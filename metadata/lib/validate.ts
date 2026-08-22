import Ajv2020 from "ajv/dist/2020.js";
import type { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import schema from "../schema/service-metadata.schema.json" with { type: "json" };
import type { Service } from "../../src/app/data/types";

/**
 * Actionable validation error: identifies the offending file, the field
 * path inside it, the invalid value, and (where applicable) the values the
 * contract actually allows. ServiceLog must never fail with only
 * "metadata validation failed" -- every error must be locatable and
 * explainable without re-reading the schema.
 */
export interface ActionableError {
  file: string;
  path: string;
  message: string;
  invalidValue?: unknown;
  expected?: string;
}

const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, verbose: true });
addFormats(ajv);
const validateFn = ajv.compile(schema);

function describeError(err: ErrorObject, file: string): ActionableError {
  const path = err.instancePath || "(document root)";
  const params = err.params as Record<string, unknown>;
  let message = err.message ?? "failed validation";
  let expected: string | undefined;

  switch (err.keyword) {
    case "enum": {
      expected = (params.allowedValues as unknown[]).map(String).join(", ");
      message = `invalid value -- must be one of: ${expected}`;
      break;
    }
    case "const": {
      expected = String(params.allowedValue);
      message = `invalid value -- must equal "${expected}"`;
      break;
    }
    case "additionalProperties": {
      const prop = params.additionalProperty as string;
      message = `unrecognized field "${prop}" -- not part of the ServiceLog metadata contract (typo, or stale/legacy field)`;
      break;
    }
    case "required": {
      const prop = params.missingProperty as string;
      message = `missing required field "${prop}"`;
      break;
    }
    case "format": {
      expected = `a valid "${params.format}"`;
      message = `invalid value -- must be ${expected}`;
      break;
    }
    default:
      break;
  }

  return {
    file,
    path,
    message,
    invalidValue: err.data,
    expected,
  };
}

/** Validates a single already-parsed YAML document against the ServiceLog metadata contract. */
export function validateDocument(doc: unknown, file: string): ActionableError[] {
  const valid = validateFn(doc);
  if (valid) return [];
  return (validateFn.errors ?? []).map((err) => describeError(err, file));
}

interface ProfileDoc {
  metadata: { name: string; title: string };
  spec: {
    type: string;
    profile: {
      cloudProvider: string;
      serviceCategory: string;
      serviceDescription: string;
      serviceExternalDoc: string;
      serviceInternalDoc: string;
      provisioningModel: Service["provisioningModel"];
      cloudAto: Service["cloudAto"];
      serviceOwner: string;
      serviceLimitations?: string;
      fedRampStatus: Service["fedRampStatus"];
      trmStatus: Service["trmStatus"];
      trmRestrictionOwner?: string;
      trmLink: string;
      fundingApproach: Service["fundingApproach"];
      approvalWorkflow: Service["approvalWorkflow"];
      provisioningSLA: string;
      serviceUseCases: string[];
      serviceOnboardingRequirements?: string[];
    };
  };
}

/**
 * Normalizes an already-validated document into the ServiceLog Service
 * model. Callers must validate first -- this assumes the shape the schema
 * guarantees and does not re-check it.
 *
 * `spec.owner` (Backstage Catalog ownership) is intentionally never read
 * here: it must not be conflated with `spec.profile.serviceOwner`.
 */
export function normalizeDocument(doc: unknown): Service {
  const { metadata, spec } = doc as ProfileDoc;
  const profile = spec.profile;
  return {
    id: metadata.name,
    serviceName: metadata.title,
    cloudProvider: profile.cloudProvider,
    serviceCategory: profile.serviceCategory,
    serviceDescription: profile.serviceDescription,
    serviceExternalDoc: profile.serviceExternalDoc,
    serviceInternalDoc: profile.serviceInternalDoc,
    provisioningModel: profile.provisioningModel,
    cloudAto: profile.cloudAto,
    serviceOwner: profile.serviceOwner,
    ...(profile.serviceLimitations !== undefined ? { serviceLimitations: profile.serviceLimitations } : {}),
    fedRampStatus: profile.fedRampStatus,
    trmStatus: profile.trmStatus,
    ...(profile.trmRestrictionOwner !== undefined ? { trmRestrictionOwner: profile.trmRestrictionOwner } : {}),
    trmLink: profile.trmLink,
    fundingApproach: profile.fundingApproach,
    approvalWorkflow: profile.approvalWorkflow,
    provisioningSLA: profile.provisioningSLA,
    serviceUseCases: profile.serviceUseCases,
    ...(profile.serviceOnboardingRequirements !== undefined
      ? { serviceOnboardingRequirements: profile.serviceOnboardingRequirements }
      : {}),
  };
}

export interface CatalogDocument {
  file: string;
  doc: unknown;
}

export interface CatalogLoadResult {
  services: Service[];
  errors: ActionableError[];
}

/**
 * Validates and normalizes a full set of parsed YAML documents into the
 * ServiceLog catalog, enforcing the one cross-document rule a single-file
 * schema can't express: unique service IDs across the complete dataset.
 */
export function loadCatalog(documents: CatalogDocument[]): CatalogLoadResult {
  const errors: ActionableError[] = [];
  const services: Service[] = [];
  const filesByName = new Map<string, string[]>();

  for (const { file, doc } of documents) {
    const docErrors = validateDocument(doc, file);
    if (docErrors.length > 0) {
      errors.push(...docErrors);
      continue;
    }

    const service = normalizeDocument(doc);
    services.push(service);
    const files = filesByName.get(service.id) ?? [];
    files.push(file);
    filesByName.set(service.id, files);
  }

  for (const [name, files] of filesByName) {
    if (files.length <= 1) continue;
    for (const file of files) {
      errors.push({
        file,
        path: "/metadata/name",
        message: `duplicate service id "${name}" -- also defined in: ${files.filter((f) => f !== file).join(", ")}`,
        invalidValue: name,
      });
    }
  }

  const validIds = new Set(
    Array.from(filesByName.entries())
      .filter(([, files]) => files.length === 1)
      .map(([name]) => name)
  );

  return {
    services: services.filter((service) => validIds.has(service.id)),
    errors,
  };
}
