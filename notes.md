> **LEGACY / REFERENCE ONLY -- not the active metadata contract.**
> This file is a historical example of the org's original Backstage-style
> YAML shape. STORY 2.2 replaced it with a governed contract: see
> `metadata/README.md` and `metadata/schema/service-metadata.schema.json`
> for the actual field definitions and controlled vocabularies, and
> `metadata/aws/`, `metadata/azure/`, `metadata/google-cloud/` for the real
> service metadata. Several fields below (`approvalWorkflow: requestable`,
> `atoStatus`, `statusBadge`, `trmStatus: Approved`, `serviceContact`,
> `environments`, `oemModel`, the HTML-embedded `officialDocumentationUrl`)
> are stale and were intentionally **not** carried into the new schema --
> do not copy this shape into new metadata.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: aws-amazon-bedrock
  title: Amazon Bedrock
spec:
  type: service-offering
  owner: group:default/gcp-devops
  lifecycle: production
  profile:
    provider: aws
    category: AI & Machine Learning
    description: A fully managed service that provides access to a variety of powerful foundation models from leading AI companies.
    approvalWorkflow: requestable
    statusBadge: AI & Machine Learning
    atoStatus: Authorized
    fedrampStatus: FedRAMP Certified (Authorized)
    provisioningModel: Tier 2
    requestMethod: ServiceNow
    serviceOwner: CIM AI Platform Team
    fundingApproach: ECSD pay
    serviceContact: https://servicenow.example.com/group/cim-ai-platform
    commonUseCases:
      - Foundation model inference
      - GenAI experimentation
      - Internal copilots
    environments:
      - Dev
      - Test
      - SAT
      - Prod
    limitations: Initial quotas require platform review
    trmStatus: Approved
    oemModel:
      - Shared Responsibility
      - Vendor Managed
    onboardingRequirements:
      - Cost Center
      - Project
      - Environment
      - Provisioned model name
      - Foundation model ID
      - Model units
    links:
      provisioningSlaUrl: https://servicenow.example.com/kb/provisioning-sla
      requestUrl: /create?filters%5Bkind%5D=template
      cbpDocumentationUrl: "http://google.com"
      officialDocumentationUrl: <a href="https://docs.aws.amazon.com/bedrock/" rel="noreferrer noopener" title="https://docs.aws.amazon.com/bedrock/" target="_blank">https://docs.aws.amazon.com/bedrock/</a>
```
