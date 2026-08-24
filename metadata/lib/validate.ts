import Ajv2020 from "ajv/dist/2020.js";
import type { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import schema from "../schema/service-metadata.schema.json" with { type: "json" };
import type { Service } from "../../src/app/data/types";

/**
 * Actionable validation error: identifies the catalog file, the affected
 * service entry (index and, where resolvable, its id), the field path
 * inside that entry, the invalid value, and (where applicable) the values
 * the contract actually allows. ServiceLog must never fail with only
 * "metadata validation failed" -- every error must be locatable and
 * explainable without re-reading the schema.
 */
export interface ActionableError {
  file: string;
  path: string;
  message: string;
  invalidValue?: unknown;
  expected?: string;
  serviceIndex?: number;
  serviceId?: string;
}

const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, verbose: true });
addFormats(ajv);
const validateCatalogFn = ajv.compile(schema);

/**
 * Splits an AJV instancePath like "/services/12/spec/profile/trmStatus"
 * into the entry index (12), a dotted field path for messages
 * ("services[12].spec.profile.trmStatus"), and the remaining in-entry path
 * ("/spec/profile/trmStatus") used to look up the entry's id.
 */
function splitServicePath(instancePath: string): { index?: number; label: string; entryPath: string } {
  const match = /^\/services\/(\d+)(\/.*)?$/.exec(instancePath);
  if (!match) {
    return { label: instancePath || "(document root)", entryPath: "" };
  }
  const index = Number(match[1]);
  const entryPath = match[2] ?? "";
  const formattedPath = entryPath
    .split("/")
    .filter(Boolean)
    .map((segment) => (/^\d+$/.test(segment) ? `[${segment}]` : `.${segment}`))
    .join("");
  const label = `services[${index}]${formattedPath}`;
  return { index, label, entryPath };
}

function describeError(err: ErrorObject, file: string, catalog: unknown): ActionableError {
  const { index, label } = splitServicePath(err.instancePath);
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

  const serviceId = index !== undefined ? entryIdAt(catalog, index) : undefined;

  return {
    file,
    path: label,
    message,
    invalidValue: err.data,
    expected,
    serviceIndex: index,
    ...(serviceId !== undefined ? { serviceId } : {}),
  };
}

function entryIdAt(catalog: unknown, index: number): string | undefined {
  const services = (catalog as { services?: unknown[] } | undefined)?.services;
  const entry = services?.[index] as { metadata?: { name?: unknown } } | undefined;
  const name = entry?.metadata?.name;
  return typeof name === "string" ? name : undefined;
}

/** Validates a full catalog document (`{ services: [...] }`) against the ServiceLog metadata contract. */
export function validateCatalog(doc: unknown, file: string): ActionableError[] {
  const valid = validateCatalogFn(doc);
  if (valid) return [];
  return (validateCatalogFn.errors ?? []).map((err) => describeError(err, file, doc));
}

interface ServiceEntry {
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
 * Normalizes an already-validated service entry into the ServiceLog
 * Service model. Callers must validate first -- this assumes the shape the
 * schema guarantees and does not re-check it.
 *
 * `spec.owner` (Backstage Catalog ownership) is intentionally never read
 * here: it must not be conflated with `spec.profile.serviceOwner`.
 */
export function normalizeEntry(entry: unknown): Service {
  const { metadata, spec } = entry as ServiceEntry;
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

export interface CatalogLoadResult {
  services: Service[];
  errors: ActionableError[];
}

/**
 * Validates and normalizes the single aggregate catalog document into the
 * ServiceLog Service[] contract, enforcing the one cross-entry rule the
 * schema can't express on its own: unique service IDs across the whole
 * catalog.
 */
export function loadCatalog(doc: unknown, file: string): CatalogLoadResult {
  const schemaErrors = validateCatalog(doc, file);
  if (schemaErrors.length > 0) {
    return { services: [], errors: schemaErrors };
  }

  const catalog = doc as { services: unknown[] };
  const errors: ActionableError[] = [];
  const services: Service[] = [];
  const indicesById = new Map<string, number[]>();

  catalog.services.forEach((entry, index) => {
    const service = normalizeEntry(entry);
    services.push(service);
    const indices = indicesById.get(service.id) ?? [];
    indices.push(index);
    indicesById.set(service.id, indices);
  });

  for (const [id, indices] of indicesById) {
    if (indices.length <= 1) continue;
    for (const index of indices) {
      errors.push({
        file,
        path: `services[${index}].metadata.name`,
        message: `duplicate service id "${id}" -- also defined at: ${indices
          .filter((i) => i !== index)
          .map((i) => `services[${i}]`)
          .join(", ")}`,
        invalidValue: id,
        serviceIndex: index,
        serviceId: id,
      });
    }
  }

  if (errors.length > 0) {
    return { services: [], errors };
  }

  return { services, errors: [] };
}
