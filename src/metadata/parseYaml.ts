import { load } from "js-yaml";

export interface ParsedYaml {
  doc?: unknown;
  parseError?: string;
}

/** Parses raw YAML text. Never throws -- a parse failure is reported as data. */
export function parseYaml(raw: string): ParsedYaml {
  try {
    return { doc: load(raw) };
  } catch (error) {
    return { parseError: error instanceof Error ? error.message : String(error) };
  }
}
