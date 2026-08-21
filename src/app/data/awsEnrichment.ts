import { ApprovalWorkflow, FedRampStatus, FundingApproach, ProvisioningModel, Service, TrmStatus } from "./types";

/**
 * Prototype enrichment for the approved AWS source catalog: the governance,
 * ownership, and workflow fields the source metadata doesn't supply.
 * Keyed by the source's approved-catalog service name (sourceCatalog.ts).
 *
 * These values represent the intended ServiceLog experience and are not
 * claimed to come from the developers' production metadata.
 */
export type AwsEnrichment = Omit<
  Service,
  | "id"
  | "serviceName"
  | "cloudProvider"
  | "serviceCategory"
  | "serviceDescription"
  | "serviceExternalDoc"
  | "serviceInternalDoc"
  | "cloudAto"
  | "serviceOwner"
  | "serviceOnboardingRequirements"
  | "trmLink"
>;

// `team` is the CIM group that owns the service operationally. It surfaces
// as `trmRestrictionOwner` for Restricted services only — per the PO's final
// ownership model, Service Owner is a person derived from Cloud ATO
// (normalize.ts), not this team, and non-Restricted services don't display
// a restriction owner at all.
function permitted(
  provisioningModel: ProvisioningModel,
  team: string,
  fedRampStatus: FedRampStatus,
  fundingApproach: FundingApproach,
  approvalWorkflow: ApprovalWorkflow,
  provisioningSLA: string,
  serviceUseCases: string[],
  serviceLimitations?: string
): AwsEnrichment {
  return {
    provisioningModel,
    serviceLimitations,
    fedRampStatus,
    trmStatus: "Permitted",
    fundingApproach,
    approvalWorkflow,
    provisioningSLA,
    serviceUseCases,
  };
}

function restricted(
  provisioningModel: ProvisioningModel,
  team: string,
  fedRampStatus: FedRampStatus,
  fundingApproach: FundingApproach,
  approvalWorkflow: ApprovalWorkflow,
  provisioningSLA: string,
  serviceUseCases: string[],
  serviceLimitations?: string
): AwsEnrichment {
  return {
    provisioningModel,
    serviceLimitations,
    fedRampStatus,
    trmStatus: "Restricted",
    trmRestrictionOwner: team,
    fundingApproach,
    approvalWorkflow,
    provisioningSLA,
    serviceUseCases,
  };
}

const DATA = "CIM Data Platform";
const COMPUTE = "CIM Compute Platform";
const CONTAINER = "CIM Container Platform Team";
const APPLICATION = "CIM Application Platform Team";
const NETWORK = "CIM Network Services";
const AI = "CIM AI Platform Team";
const INTEGRATION = "CIM Integration Platform Team";
const MIGRATION = "CIM Migration Services";
const OBSERVABILITY = "CIM Observability Platform Team";
const SECURITY = "CIM Security Operations";
const STORAGE = "CIM Storage Platform";

export const AWS_ENRICHMENT: Record<string, AwsEnrichment> = {
  // ── Analytics ──────────────────────────────────────────────────────────
  "AWS Glue": permitted("Tier 2", DATA, "FedRAMP Certified", "ECSD pay", "Manager Approval", "3 business days", [
    "ETL job orchestration",
    "Data catalog and schema discovery",
    "Serverless data preparation pipelines",
  ]),
  "Amazon Athena": permitted("Tier 1", DATA, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Ad hoc SQL analysis over S3 data",
    "Serverless querying for data lake workloads",
    "Log and clickstream analysis",
  ]),

  // ── Compute ────────────────────────────────────────────────────────────
  "Amazon EC2": permitted("Tier 1", COMPUTE, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Web application hosting",
    "Batch processing workloads",
    "Development and test environments",
    "High-performance computing",
  ]),
  "EC2 Image Builder": permitted("Tier 2", COMPUTE, "FedRAMP Certified", "ECSD pay", "Manager Approval", "3 business days", [
    "Golden AMI pipelines",
    "Compliance-hardened image baselines",
    "Automated patching of server images",
  ]),
  "AWS Lambda": permitted("Tier 1", COMPUTE, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Event-driven microservices",
    "API backend functions",
    "Scheduled data processing",
    "S3 trigger workflows",
  ]),

  // ── Container Platform ────────────────────────────────────────────────
  "Amazon EKS": restricted("Tier 3", CONTAINER, "FedRAMP Certified", "Funding recouped", "Architecture Review", "10 business days", [
    "Containerized microservices",
    "CI/CD workload hosting",
    "Multi-tenant Kubernetes workloads",
  ]),
  "Elastic Load Balancing": permitted("Tier 1", CONTAINER, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Application and network load balancing",
    "Blue-green and canary traffic shifting",
    "TLS termination for containerized services",
  ]),
  "Auto-Scaling": permitted("Tier 1", CONTAINER, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Horizontal pod autoscaling in EKS",
    "Elastic capacity for variable traffic",
    "Cost-optimized compute scaling",
  ]),

  // ── Customer Engagement ───────────────────────────────────────────────
  "Amazon Connect": restricted("Tier 3", APPLICATION, "FedRAMP In Process", "Funding recouped", "Security Review", "10 business days", [
    "Cloud-based contact center",
    "Customer support call routing",
    "Interactive voice response (IVR) flows",
  ]),

  // ── Database ───────────────────────────────────────────────────────────
  "Amazon DocumentDB": permitted("Tier 2", DATA, "FedRAMP Certified", "ECSD pay", "Manager Approval", "3 business days", [
    "JSON document workloads",
    "MongoDB-compatible application backends",
    "Content management data stores",
  ]),
  "Amazon DynamoDB": permitted("Tier 1", DATA, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Session state management",
    "Real-time leaderboards",
    "IoT device telemetry",
    "High-throughput key-value lookups",
  ]),
  "Amazon ElastiCache": permitted("Tier 2", DATA, "FedRAMP Certified", "ECSD pay", "Manager Approval", "3 business days", [
    "Application caching layers",
    "Session store for web applications",
    "Real-time leaderboard and counters",
  ]),
  "Amazon Keyspaces": permitted("Tier 2", DATA, "FedRAMP Certified", "ECSD pay", "Manager Approval", "3 business days", [
    "Cassandra-compatible workload migration",
    "High-throughput wide-column data",
    "IoT and time-series data storage",
  ]),
  "Amazon Neptune": restricted("Tier 3", DATA, "FedRAMP Certified", "Funding recouped", "Architecture Review", "10 business days", [
    "Graph relationship analysis",
    "Fraud detection graphs",
    "Knowledge graph applications",
  ]),
  "Amazon RDS": permitted("Tier 1", DATA, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "1 business day", [
    "Transactional application databases",
    "Reporting and analytics",
    "COTS application backends",
    "Disaster recovery replicas",
  ]),
  "Amazon Redshift": permitted("Tier 2", DATA, "FedRAMP Certified", "Funding recouped", "Manager Approval", "5 business days", [
    "Enterprise data warehousing",
    "BI dashboard reporting",
    "Zero-ETL analytics pipelines",
  ]),
  "Amazon RDS Aurora": permitted("Tier 1", DATA, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "1 business day", [
    "High-throughput relational workloads",
    "MySQL/PostgreSQL-compatible migrations",
    "Read-replica scaling for reporting",
  ]),
  "Amazon RDS MySQL": permitted("Tier 1", DATA, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "1 business day", [
    "MySQL application backends",
    "Legacy database lift-and-shift",
    "Web application data stores",
  ]),
  "Amazon RDS Oracle": permitted("Tier 2", DATA, "FedRAMP Certified", "Funding recouped", "Manager Approval", "3 business days", [
    "Oracle-dependent COTS applications",
    "Enterprise transactional systems",
    "Licensed database migrations",
  ]),
  "Amazon RDS PostgreSQL": permitted("Tier 1", DATA, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "1 business day", [
    "PostgreSQL application backends",
    "Geospatial data workloads",
    "Multi-tenant SaaS databases",
  ]),
  "Amazon RDS SQL Server": permitted("Tier 2", DATA, "FedRAMP Certified", "Funding recouped", "Manager Approval", "3 business days", [
    "SQL Server-dependent COTS applications",
    "Windows application backends",
    "Licensed database migrations",
  ]),
  "Amazon RDS Proxy": permitted("Tier 2", DATA, "FedRAMP Certified", "ECSD pay", "Manager Approval", "3 business days", [
    "Connection pooling for serverless apps",
    "Improved database failover resilience",
    "Reducing connection overhead at scale",
  ]),
  "Amazon Aurora Serverless": permitted("Tier 2", DATA, "FedRAMP Certified", "Funding recouped", "Manager Approval", "3 business days", [
    "Variable and intermittent workload databases",
    "Dev and test database capacity",
    "Auto-scaling relational workloads",
  ]),

  // ── Identity & Access Management ─────────────────────────────────────
  "AWS IAM": permitted("Tier 1", SECURITY, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Role-based access control",
    "Cross-account resource sharing",
    "Service-to-service authentication",
    "Least-privilege policy enforcement",
  ]),

  // ── Infrastructure & Platforms ────────────────────────────────────────
  "Amazon VPC": permitted("Tier 2", NETWORK, "FedRAMP Certified", "ECSD pay", "Manager Approval", "2 business days", [
    "Isolated workload networking",
    "Hybrid connectivity to on-prem",
    "Multi-tier application segmentation",
    "Security group enforcement",
  ]),
  "Demilitarized Zone": restricted("Tier 3", NETWORK, "FedRAMP Certified", "Funding recouped", "Security Review", "10 business days", [
    "External connectivity for internet-facing services",
    "Trusted Internet Connection (TIC) compliance",
    "Public-facing API exposure",
  ]),

  // ── AI & Machine Learning ──────────────────────────────────────────────
  "Amazon Bedrock": restricted(
    "Tier 3",
    AI,
    "FedRAMP Ready",
    "Funding recouped",
    "Multi-Level Approval",
    "10 business days",
    ["Content generation and summarization", "Document analysis and extraction", "Code generation assistance", "Conversational AI prototyping"],
    "Not approved for PII or PHI workloads."
  ),
  "Amazon SageMaker": restricted(
    "Tier 3",
    AI,
    "FedRAMP Certified",
    "Funding recouped",
    "Multi-Level Approval",
    "10 business days",
    ["Custom ML model training", "Batch inference pipelines", "Real-time prediction endpoints", "MLOps and model versioning"],
    "GPU instances require separate approval."
  ),
  "Amazon Groundtruth": restricted("Tier 3", AI, "FedRAMP Ready", "Funding recouped", "Multi-Level Approval", "10 business days", [
    "Training dataset labeling",
    "Human-in-the-loop annotation",
    "Auto-labeling for ML pipelines",
  ]),
  "Amazon SageMaker Studio": restricted("Tier 3", AI, "FedRAMP Certified", "Funding recouped", "Multi-Level Approval", "10 business days", [
    "Unified ML development IDE",
    "Notebook-based model experimentation",
    "End-to-end ML workflow authoring",
  ]),

  // ── Messaging ──────────────────────────────────────────────────────────
  "Amazon MQ": permitted("Tier 2", INTEGRATION, "FedRAMP Certified", "Funding recouped", "Manager Approval", "3 business days", [
    "Legacy ActiveMQ/RabbitMQ migrations",
    "Protocol-standard message brokering",
    "Enterprise application integration",
  ]),
  "Amazon SQS": permitted("Tier 1", INTEGRATION, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Decoupled microservice messaging",
    "Work queue processing",
    "Dead-letter queue handling for failed messages",
  ]),
  "Amazon End User Messaging": restricted(
    "Tier 3",
    INTEGRATION,
    "FedRAMP In Process",
    "Funding recouped",
    "Security Review",
    "10 business days",
    ["Time-sensitive SMS/MMS alerts", "One-time passcode delivery", "Two-way customer text messaging"],
    "SMS/MMS campaign registration must be approved before send access is granted."
  ),
  "Amazon SNS": permitted("Tier 1", INTEGRATION, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Pub/sub fan-out messaging",
    "Fault-tolerant event notification",
    "Lambda and SQS event triggers",
  ]),
  "Amazon Kinesis Data Streams": permitted("Tier 2", DATA, "FedRAMP Certified", "Funding recouped", "Manager Approval", "3 business days", [
    "Real-time clickstream analytics",
    "IoT telemetry ingestion",
    "Streaming ETL pipelines",
  ]),

  // ── Migration & Transfer ──────────────────────────────────────────────
  "AWS DMS": permitted("Tier 2", MIGRATION, "FedRAMP Certified", "Funding recouped", "Manager Approval", "5 business days", [
    "Homogeneous and heterogeneous database migration",
    "Continuous data replication",
    "On-prem to cloud database cutover",
  ]),
  "AWS Transfer Family": permitted("Tier 2", MIGRATION, "FedRAMP Certified", "Funding recouped", "Manager Approval", "5 business days", [
    "SFTP file exchange with external partners",
    "Legacy file-transfer workflow migration",
    "Managed inbound/outbound file transfer",
  ]),

  // ── Monitoring & Management ───────────────────────────────────────────
  "AWS CloudTrail": permitted("Tier 1", OBSERVABILITY, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Account activity auditing",
    "Governance and compliance logging",
    "Security incident investigation",
  ]),
  "AWS CloudWatch": permitted("Tier 1", OBSERVABILITY, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Metrics and alarms for AWS resources",
    "Centralized log aggregation",
    "Automated remediation triggers",
  ]),
  "Amazon OpenSearch Service": permitted("Tier 2", OBSERVABILITY, "FedRAMP Certified", "Funding recouped", "Manager Approval", "5 business days", [
    "Interactive log analytics",
    "Full-text search for applications",
    "Real-time application monitoring dashboards",
  ]),
  "AWS CloudWatch Database Insights": permitted(
    "Tier 2",
    OBSERVABILITY,
    "FedRAMP Certified",
    "Funding recouped",
    "Manager Approval",
    "3 business days",
    ["Fleet-level RDS/Aurora health monitoring", "AI-assisted database bottleneck diagnosis", "Unified database performance dashboards"]
  ),

  // ── Secret Management ──────────────────────────────────────────────────
  "AWS KMS": permitted(
    "Tier 1",
    SECURITY,
    "FedRAMP Certified",
    "ECSD pay",
    "Security Review",
    "5 business days",
    ["Data-at-rest encryption", "S3 server-side encryption", "EBS volume encryption", "Application-level key management"],
    "HSM key type requires security board approval."
  ),
  "AWS Secrets Manager": permitted("Tier 1", SECURITY, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Database credential rotation",
    "API key storage",
    "Application config secrets",
    "Cross-service secret sharing",
  ]),

  // ── Security Scanning ──────────────────────────────────────────────────
  "Amazon Guard Duty": permitted("Tier 1", SECURITY, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Continuous threat detection",
    "Anomaly and unauthorized-behavior monitoring",
    "Automated security finding triage",
  ]),
  "AWS Security Hub": permitted("Tier 1", SECURITY, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Cloud security posture management",
    "Compliance scoring against CIS/PCI DSS/NIST",
    "Centralized security finding aggregation",
  ]),

  // ── Storage ────────────────────────────────────────────────────────────
  "Amazon S3": permitted("Tier 1", STORAGE, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Static website hosting",
    "Data lake storage",
    "Backup and archive",
    "Application artifact storage",
  ]),
  "AWS Backup": permitted("Tier 1", STORAGE, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Centralized backup policy management",
    "Cross-service data protection",
    "Automated backup retention and lifecycle",
  ]),
  "Amazon Elastic Block Store": permitted("Tier 1", STORAGE, "FedRAMP Certified", "ECSD pay", "Auto-Approved", "Same day", [
    "Persistent EC2 instance storage",
    "Database volume storage",
    "Snapshot-based disaster recovery",
  ]),
  "Amazon S3 Vector Bucket": restricted("Tier 3", STORAGE, "FedRAMP Ready", "Funding recouped", "Architecture Review", "10 business days", [
    "Vector embedding storage for AI/ML search",
    "Sub-second similarity search",
    "Retrieval-augmented generation (RAG) pipelines",
  ]),
  "Amazon S3 Table Bucket": permitted("Tier 2", STORAGE, "FedRAMP Ready", "Funding recouped", "Manager Approval", "5 business days", [
    "Tabular analytics data storage",
    "Apache Iceberg table management",
    "Structured data lake workloads",
  ]),

  // ── Streaming ──────────────────────────────────────────────────────────
  "Amazon MSK": permitted("Tier 2", DATA, "FedRAMP Certified", "Funding recouped", "Manager Approval", "5 business days", [
    "Real-time streaming data pipelines",
    "Event-driven microservice communication",
    "Kafka workload migration to managed infrastructure",
  ]),
};
