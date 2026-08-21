import { AWS_SOURCE_CATALOG, SourceServiceRecord } from "./sourceCatalog";
import { AWS_ENRICHMENT, AwsEnrichment } from "./awsEnrichment";
import { CloudAto, Service } from "./types";

/**
 * Per PO follow-up, this prototype displays exactly one provider-default
 * Cloud ATO per service — not a merge with the source's per-service `uar`
 * flags. `cloudAto` stays an array (future multi-select), but every current
 * record gets exactly this one value. The source `uar` data remains in
 * sourceCatalog.ts for future investigation; it is not read here.
 */
const PROVIDER_DEFAULT_CLOUD_ATO: Record<string, CloudAto> = {
  AWS: "CACE",
  Azure: "CMAA",
  "Google Cloud": "MAGE",
};

export function defaultCloudAto(provider: string): CloudAto[] {
  const value = PROVIDER_DEFAULT_CLOUD_ATO[provider];
  return value ? [value] : [];
}

/** Service Owner is a person, determined by the service's (single) Cloud ATO value. */
const OWNER_BY_CLOUD_ATO: Record<CloudAto, string> = {
  CACE: "Natasha Romanoff",
  MAGE: "Carol Danvers",
  CMAA: "Wanda Maximoff",
};

export function ownerForCloudAto(cloudAto: CloudAto[]): string {
  const [primary] = cloudAto;
  return primary ? OWNER_BY_CLOUD_ATO[primary] : "Unassigned";
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface OnboardingNode {
  text: string;
  indent: number;
  children: OnboardingNode[];
}

/**
 * Normalizes raw source onboarding_requirements text into clean, flat
 * requirement strings.
 *
 * The source is not uniform: some services provide a simple bullet list,
 * others (e.g. AWS Lambda, Amazon SQS, Amazon End User Messaging) wrap
 * nested detail in legacy `<p title="...">Hover over this...</p>` markup
 * meant for a hover tooltip in the old UI. That markup is never rendered —
 * this only reads the plain-text bullets inside/around it.
 *
 * Rules:
 *  - Only `- ` bullet lines are treated as requirements; free-standing
 *    prose (section labels, footnotes) is dropped rather than guessed at.
 *  - Indentation nests a bullet under its parent. A nested bullet is folded
 *    into its parent's text as a parenthetical rather than surfaced as its
 *    own top-level requirement, so deeply-nested qualifiers/notes don't get
 *    invented into new requirements.
 *  - `<p title="...">`/`</p>` and `<a ...>`/`</a>` wrapper tags are
 *    stripped; their content (the actual nested bullets) is kept.
 *  - Exact-duplicate top-level requirements (the source repeats the same
 *    field list more than once for some services) are de-duplicated.
 */
export function normalizeOnboardingRequirements(raw?: string): string[] | undefined {
  if (!raw) return undefined;

  const cleaned = raw
    .replace(/<p title="/g, "")
    .replace(/<\/?a[^>]*>/g, "")
    .replace(/">/g, "\n");

  const roots: OnboardingNode[] = [];
  const stack: OnboardingNode[] = [];

  for (const rawLine of cleaned.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    const match = line.match(/^(\s*)-\s+(.*)$/);
    if (!match) continue;

    const [, indentStr, textRaw] = match;
    const text = textRaw.trim();
    if (!text) continue;

    const indent = indentStr.length;
    const node: OnboardingNode = { text, indent, children: [] };

    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    if (stack.length === 0) roots.push(node);
    else stack[stack.length - 1].children.push(node);
    stack.push(node);
  }

  const flatten = (node: OnboardingNode): string =>
    node.children.length === 0 ? node.text : `${node.text} (${node.children.map(flatten).join("; ")})`;

  const requirements = roots.map(flatten);
  return requirements.length ? Array.from(new Set(requirements)) : undefined;
}

// Fallbacks used when the source record has no internal/external doc link.
// Internal/External Documentation are required at the ServiceLog layer even
// though the source is sometimes missing one; a missing source value is
// prototype-enriched with a generic (but real, non-fabricated-deep-link)
// pointer into the relevant docs portal rather than hidden.
export const INTERNAL_DOC_FALLBACK = "https://cloud-docs.cbp.dhs.gov/";
const EXTERNAL_DOC_FALLBACK = "https://docs.aws.amazon.com/";

function buildAwsService(category: string, source: SourceServiceRecord, enrichment: AwsEnrichment): Service {
  const id = slugify(source.name);
  const cloudAto = defaultCloudAto(source.provider);
  return {
    id,
    serviceName: source.name,
    cloudProvider: source.provider,
    serviceCategory: category,
    serviceDescription: source.description,
    serviceExternalDoc: source.official_link ?? EXTERNAL_DOC_FALLBACK,
    serviceInternalDoc: source.internal_link ?? INTERNAL_DOC_FALLBACK,
    cloudAto,
    serviceOwner: ownerForCloudAto(cloudAto),
    serviceOnboardingRequirements: normalizeOnboardingRequirements(source.onboarding_requirements),
    // trmLink is prototype enrichment (no TRM system integration exists yet): a
    // stable, formulaic link into the authoritative TRM reference rather than a
    // per-record hand-authored value.
    trmLink: `https://cloud-docs.cbp.dhs.gov/governance/trm.html#${id}`,
    ...enrichment,
  };
}

/**
 * Maps the approved AWS source catalog into ServiceLog records: real
 * source-backed fields (name, provider, category, description, doc links,
 * Cloud ATO, onboarding requirements) plus each service's prototype
 * enrichment (data/awsEnrichment.ts) for the fields the source doesn't
 * supply (TRM, provisioning, owner, funding, approval, SLA, use cases).
 */
export function buildAwsServices(): Service[] {
  return AWS_SOURCE_CATALOG.flatMap((category) =>
    category.services.map((source) => {
      const enrichment = AWS_ENRICHMENT[source.name];
      if (!enrichment) {
        throw new Error(`Missing prototype enrichment for approved AWS service "${source.name}"`);
      }
      return buildAwsService(category.name, source, enrichment);
    })
  );
}
