import type { ErrorObject } from "ajv";
import { validateServiceMetadataDocument } from "./schema";
import type { ServiceMetadataDocument } from "./documentTypes";

export interface DocumentIssue {
  path: string;
  message: string;
  invalidValue?: unknown;
  expected?: unknown;
}

function valueAtPath(doc: unknown, instancePath: string): unknown {
  if (!instancePath) return doc;
  const segments = instancePath.split("/").slice(1);
  let current: unknown = doc;
  for (const segment of segments) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function describeError(doc: unknown, error: ErrorObject): DocumentIssue {
  const path = error.instancePath || "(document root)";

  if (error.keyword === "enum") {
    return {
      path,
      message: `${path}: value is not one of the allowed controlled-vocabulary values`,
      invalidValue: valueAtPath(doc, error.instancePath),
      expected: (error.params as { allowedValues: unknown[] }).allowedValues,
    };
  }

  if (error.keyword === "const") {
    return {
      path,
      message: `${path}: value does not match the required constant`,
      invalidValue: valueAtPath(doc, error.instancePath),
      expected: (error.params as { allowedValue: unknown }).allowedValue,
    };
  }

  if (error.keyword === "additionalProperties") {
    const property = (error.params as { additionalProperty: string }).additionalProperty;
    return {
      path: `${path}/${property}`,
      message: `${path || "(document root)"}: unrecognized field "${property}" -- not part of the metadata contract (typo, or stale/legacy field)`,
      invalidValue: property,
    };
  }

  if (error.keyword === "required") {
    const property = (error.params as { missingProperty: string }).missingProperty;
    return {
      path: `${path}/${property}`,
      message: `${path || "(document root)"}: missing required field "${property}"`,
    };
  }

  if (error.keyword === "format") {
    return {
      path,
      message: `${path}: value is not a valid ${(error.params as { format: string }).format}`,
      invalidValue: valueAtPath(doc, error.instancePath),
    };
  }

  if (error.keyword === "pattern") {
    return {
      path,
      message: `${path}: value does not match required pattern ${(error.params as { pattern: string }).pattern}`,
      invalidValue: valueAtPath(doc, error.instancePath),
    };
  }

  return {
    path,
    message: `${path}: ${error.message ?? "failed schema validation"}`,
    invalidValue: valueAtPath(doc, error.instancePath),
  };
}

/**
 * Validates a single parsed YAML document against the ServiceLog metadata
 * contract. Returns an empty array when the document is valid; otherwise one
 * actionable issue per schema violation (field/path, invalid value, and
 * expected value(s) where applicable). Never coerces or reinterprets an
 * out-of-vocabulary value -- an unrecognized value is always a failure.
 */
export function validateDocument(doc: unknown): DocumentIssue[] {
  const valid = validateServiceMetadataDocument(doc);
  if (valid) return [];
  return (validateServiceMetadataDocument.errors ?? []).map((error) => describeError(doc, error));
}

export function isValidServiceMetadataDocument(doc: unknown): doc is ServiceMetadataDocument {
  return validateDocument(doc).length === 0;
}
