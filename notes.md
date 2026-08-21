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

 