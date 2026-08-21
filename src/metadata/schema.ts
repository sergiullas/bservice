import Ajv2020, { type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
// @ts-expect-error -- JSON module import; both tsx (Node) and Vite resolve this natively.
import serviceMetadataSchema from "../../metadata/schema/service-metadata.schema.json";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

export const validateServiceMetadataDocument: ValidateFunction = ajv.compile(serviceMetadataSchema);

export { serviceMetadataSchema };
