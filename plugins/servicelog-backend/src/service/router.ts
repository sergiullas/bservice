import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import express from 'express';
import Router from 'express-promise-router';
import * as yaml from 'js-yaml';
import { InputError } from '@backstage/errors';
import type {
  HttpAuthService,
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import { loadCatalog, type CatalogDocument } from '@servicelog/metadata';

export interface RouterOptions {
  logger: LoggerService;
  httpAuth: HttpAuthService;
  config: RootConfigService;
}

const CSP_DIRS = ['aws', 'azure', 'google-cloud'];

/**
 * Locates the Story 2.2 CSP YAML directory. `servicelog.metadataRoot` in
 * app-config wins if set (what a real deployment would use, since it won't
 * necessarily check out this monorepo layout -- see
 * docs/backstage-compatibility.md #10). Otherwise this resolves
 * `@servicelog/metadata`'s real on-disk location via Node's own module
 * resolution rather than a `__dirname`-relative path: this package gets
 * bundled by `@backstage/cli package build` into a single output file, so
 * `__dirname` at runtime does not reliably preserve this source file's
 * depth relative to the metadata directory the way a plain relative import
 * would assume.
 */
function resolveMetadataRoot(config: RootConfigService): string {
  const configured = config.getOptionalString('servicelog.metadataRoot');
  if (configured) return configured;

  const require = createRequire(import.meta.url);
  const packageJsonPath = require.resolve('@servicelog/metadata/package.json');
  return dirname(packageJsonPath);
}

function findYamlFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...findYamlFiles(full));
    else if (entry.endsWith('.yaml') || entry.endsWith('.yml')) files.push(full);
  }
  return files;
}

function loadDocuments(metadataRoot: string): { documents: CatalogDocument[]; parseErrors: string[] } {
  const documents: CatalogDocument[] = [];
  const parseErrors: string[] = [];

  for (const cspDir of CSP_DIRS) {
    const absoluteDir = join(metadataRoot, cspDir);
    for (const absolutePath of findYamlFiles(absoluteDir)) {
      const file = relative(metadataRoot, absolutePath);
      const raw = readFileSync(absolutePath, 'utf8');
      try {
        documents.push({ file, doc: yaml.load(raw) });
      } catch (error) {
        parseErrors.push(`${file}: not valid YAML: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  return { documents, parseErrors };
}

/**
 * The Backstage-specific half of the data seam described in STORY 2.3
 * checkpoint D: everything above this line is Backstage plumbing
 * (auth, config, HTTP). `loadCatalog` below is the exact same Story 2.2
 * validator the standalone host's YAML adapter calls -- reused, not
 * reimplemented, so both hosts enforce one contract.
 */
export async function createRouter({ logger, httpAuth, config }: RouterOptions): Promise<express.Router> {
  const router = Router();
  router.use(express.json());
  const metadataRoot = resolveMetadataRoot(config);

  router.get('/services', async (req, res) => {
    // ServiceLog must never expose this catalog to an unauthenticated
    // caller merely because that's easier in an experiment -- see STORY
    // 2.3 checkpoint D and docs/backstage-compatibility.md #9.
    await httpAuth.credentials(req, { allow: ['user', 'service'] });

    const { documents, parseErrors } = loadDocuments(metadataRoot);
    if (parseErrors.length > 0) {
      logger.error(`ServiceLog metadata failed to parse: ${parseErrors.join(' | ')}`);
      throw new InputError(`ServiceLog metadata failed to parse as YAML:\n${parseErrors.join('\n')}`);
    }

    const { services, errors } = loadCatalog(documents);
    if (errors.length > 0) {
      const details = errors
        .map((error) => `${error.file} ${error.path}: ${error.message}${error.expected ? ` (expected: ${error.expected})` : ''}`)
        .join('\n');
      logger.error(`ServiceLog metadata failed validation (${errors.length} issue(s)):\n${details}`);
      // Invalid metadata must not silently produce a partial catalog --
      // fail the whole request with an actionable error instead.
      throw new InputError(`ServiceLog metadata failed validation (${errors.length} issue(s)):\n${details}`);
    }

    logger.info(`ServiceLog: served ${services.length} service(s) from ${documents.length} document(s)`);
    res.json({ services });
  });

  return router;
}
