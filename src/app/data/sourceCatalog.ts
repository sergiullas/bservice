/**
 * Source metadata supplied by the implementation team (see notes.md),
 * trimmed to the PO-approved 51-service AWS subset (STORY 1.1).
 *
 * This mirrors the shape of the real source dataset:
 *   categories: [{ name, services: [{ name, provider, internal_link,
 *     official_link, description, uar: { cace, cmaa, mage },
 *     onboarding_requirements } ] }]
 *
 * Hard line-wraps present in the original YAML block-scalar text (a pure
 * formatting artifact of the source file) have been folded back into their
 * logical single line during transcription. Genuine nested structure
 * (indented sub-bullets, and legacy `<p title="...">` hover wrappers such as
 * the one on AWS Lambda) is preserved as-is so normalize.ts has real
 * messy-markup cases to normalize.
 *
 * `anchor`, `icon`, `availability`, and `tech_spec_link` are intentionally
 * not carried over — they are out of scope for the ServiceLog model per the
 * story's Selection Rules.
 */

export interface SourceUar {
  cace: boolean;
  cmaa: boolean;
  mage: boolean;
}

export interface SourceServiceRecord {
  /** Approved-catalog display name (source's expanded names are normalized per Selection Rule 5). */
  name: string;
  provider: string;
  internal_link: string | null;
  official_link: string | null;
  description: string;
  uar: SourceUar;
  onboarding_requirements?: string;
}

export interface SourceCategory {
  name: string;
  services: SourceServiceRecord[];
}

export const AWS_SOURCE_CATALOG: SourceCategory[] = [
  {
    name: "Analytics",
    services: [
      {
        name: "AWS Glue",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/glue",
        official_link: "https://docs.aws.amazon.com/glue/",
        description:
          "AWS Glue is a serverless data integration service that makes it easy to discover, prepare, and combine data for analytics, machine learning, and application development. AWS Glue provides all the capabilities needed for data integration so that you can start analyzing your data and putting it to use in minutes instead of months.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: "- cost-center\n- project\n- environment\n- Requested name for glue-db",
      },
      {
        name: "Amazon Athena",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/athena",
        official_link: "https://docs.aws.amazon.com/athena/",
        description:
          "Amazon Athena is an interactive query service that makes it easy to analyze data in Amazon S3 using standard SQL. Athena is serverless, so there is no infrastructure to manage, and you pay only for the queries that you run.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: "- cost-center\n- project\n- environment",
      },
    ],
  },
  {
    name: "Compute",
    services: [
      {
        name: "Amazon EC2",
        provider: "AWS",
        internal_link: "./platforms/iaas/ec2",
        official_link: "https://docs.aws.amazon.com/ec2/",
        description:
          'Amazon EC2 forms a central part of the AWS cloud-computing platform, Amazon Web Services (AWS), by allowing users to rent virtual computers on which to run their own computer applications. EC2 encourages scalable deployment of applications by providing a web service through which a user can boot an Amazon Machine Image (AMI) to configure a virtual machine, which Amazon calls an "instance", containing any software desired. A user can create, launch, and terminate server-instances as needed, paying by the hour for active servers – hence the term "elastic". EC2 provides users with control over the geographical location of instances that allows for latency optimization and high levels of redundancy.',
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements:
          "- cost-center\n- project\n- environment\n- quantity\n- operating-system (linux or windows)\n- instance-type\n- storage-size\n- tier-structure (for linux)\n- subnet-id\n- security-group-ids",
      },
      {
        name: "EC2 Image Builder",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/ec2-image-builder",
        official_link: "https://docs.aws.amazon.com/imagebuilder/",
        description:
          "EC2 Image Builder is a fully managed AWS service that helps the user to automate the creation, management, and deployment of customized, secure, and up-to-date server images. The user can use the AWS Management Console, AWS Command Line Interface, or APIs to create custom images in their AWS account. The EC2 Image builder increases productivity and reduces operations for building compliant and up-to-date images. It increases service up time and raises the security bar for deployments.",
        uar: { cace: false, cmaa: true, mage: false },
        onboarding_requirements: "- Tier 2 account name",
      },
      {
        name: "AWS Lambda",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/lambda",
        official_link: "https://docs.aws.amazon.com/lambda/",
        description:
          "AWS Lambda is a serverless, event-driven compute service that lets you run code for virtually any type of application or backend service without provisioning or managing servers.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
<p title="
- package_type ("Image" or "Zip")
- Description
- handler
- Memory_size (defaults to 128MB)
  - Note- Amount of memory in MB your Lambda Function can use at runtime.
- Timeout (defaults to seconds)
  - Note- The amount of time your Lambda Function has to run in seconds
- Concurrency (defaults to -1)
  - Note- The amount of reserved concurrent executions for this lambda function. A value of 0 disables lambda from being triggered and -1 removes any concurrency limitations.
- tracing_config ("PassThrough" or "Active")
- Environment Variables (No PII or Sensitive data) (Optional)
  - Note- Environment variables will be added to the TFE workspace and hence cannot contain any sensitive data.
- Runtime (Required for "Zip" file-based deployments)
  - Note- Please see Cloud Docs for supported values.
- GitLab Artifacts Repository for Jenkins Pipeline Deployment
  - Note- CME needs this for setting up Jenkinsfile / config.json
">Hover over this for additional information.</p>
<p title="
- File System Configuration - EFS Resource Name (Optional)
  - Create new or use an existing one?
  - mountpath (should start with /mnt)
- Dead Letter Configuration – SQS DLQ Resource Name (Optional)
  - Create a new DLQ or use an existing one?
- Lambda Trigger Configuration (Optional)
  - S3 Bucket Name
    - Create a new one or use an existing one?
  - SQS Resource Name
    - Create a new one or use an existing one?
  - EventBridge (Optional)
    - Schedule_expression - The scheduling expression. For example, cron(0 20 * * ? *) or rate(5 minutes). At least one of schedule_expression or event_pattern is required.
">Hover over this for continued information from above.</p>`,
      },
    ],
  },
  {
    name: "Container Platform",
    services: [
      {
        name: "Amazon EKS",
        provider: "AWS",
        internal_link: "./platforms/cicd/eks/index",
        official_link: "https://docs.aws.amazon.com/eks/",
        description:
          "Amazon EKS (Elastic Kubernetes Service) is a fully managed service that allows you to run Kubernetes on AWS without needing to install, operate, or maintain your own Kubernetes control plane. Because it is certified Kubernetes-conformant, any application running on standard upstream Kubernetes can easily migrate to Amazon EKS without any code changes.",
        uar: { cace: true, cmaa: false, mage: false },
      },
      {
        name: "Elastic Load Balancing",
        provider: "AWS",
        internal_link: null,
        official_link: "https://docs.aws.amazon.com/elasticloadbalancing/",
        description:
          "Amazon ELB automatically distributes incoming application traffic across multiple targets, such as EC2 instances. It monitors the health of registered targets and routes traffic only to the healthy targets. ELB supports two types of load balancers, Application Load Balancers and Classic Load Balancers.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost-center
- project
- environment
- quantity
- type (application or network)
- scheme (internal or internet-facing)
- subnets (a comma-separated list of subnet-ids)
- listener-ports (a comma-separated list, e.g., 80, 443)
- Application Load Balancers
  - default-ssl-certificate-arn (if using https)
  - security-groups (a comma-separated list of security-group-ids)
  - target-groups (list of all groups)
    - for-each-target-group-provide
      - protocol (e.g., http)
      - port (e.g., 8080)
      - URL to re-route
      - routing-rules (if using multiple target groups)
- Network Load Balancers
  - target-groups (list of all groups)
    - for-each-target-group-provide
      - port (e.g., 8443)`,
      },
      {
        name: "Auto-Scaling",
        provider: "AWS",
        internal_link: "./platforms/cicd/eks/auto-scaling",
        official_link: "https://docs.aws.amazon.com/autoscaling/",
        description:
          "Automatically adjusts the number of compute resources in your application to maintain steady, predictable performance at the lowest possible cost. In EKS, this is often handled by Horizontal Pod Autoscalers (HPAs).",
        uar: { cace: true, cmaa: true, mage: false },
      },
    ],
  },
  {
    name: "Customer Engagement",
    services: [
      {
        name: "Amazon Connect",
        provider: "AWS",
        internal_link: "./governance/request-access#amazon-connect",
        official_link: "https://docs.aws.amazon.com/connect/",
        description: "A self-service, cloud-based contact center service that scales to support any size business.",
        uar: { cace: false, cmaa: true, mage: false },
      },
    ],
  },
  {
    name: "Database",
    services: [
      {
        name: "Amazon DocumentDB",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/docudb",
        official_link: "https://docs.aws.amazon.com/documentdb/",
        description:
          "Amazon DocumentDB (with MongoDB compatibility) is a database service that is purpose-built for JSON data management at scale, fully managed and integrated with AWS, and enterprise-ready with high durability. Amazon DocumentDB is designed to give you the scalability and durability you need when operating mission-critical MongoDB workloads. Storage scales automatically up to 64TiB without any impact to your application. It supports millions of requests per second with up to 15 low latency read replicas in minutes, without any application downtime, regardless of the size of your data.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements:
          "- cost_center\n- project\n- environment\n- version\n- instance_types\n- Instance_count",
      },
      {
        name: "Amazon DynamoDB",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/dynamodb",
        official_link: "https://docs.aws.amazon.com/dynamodb/",
        description:
          "Amazon DynamoDB is a fully managed proprietary NoSQL database service that is offered by Amazon.com as part of the Amazon Web Services portfolio. DynamoDB exposes a similar data model and derives its name from Dynamo, but has a different underlying implementation. Dynamo had a multi-master design requiring the client to resolve version conflicts, and DynamoDB uses synchronous replication across multiple datacenters for high durability and availability.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements:
          "- cost_center\n- project\n- environment\n- table_name (Optional)\n- read_capacity\n- write_capacity\n- hash_key\n- range_key (Optional)",
      },
      {
        name: "Amazon ElastiCache",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/elasticache",
        official_link: "https://docs.aws.amazon.com/ElastiCache/",
        description:
          "Amazon ElastiCache offers fully managed Redis and Memcached. Seamlessly deploy, operate, and scale popular open source compatible in-memory data stores. Build data-intensive apps or improve the performance of your existing apps by retrieving data from high throughput and low latency in-memory data stores.",
        uar: { cace: false, cmaa: true, mage: false },
        onboarding_requirements:
          "- cost-center\n- project\n- environment\n- mode\n- node-type\n- nodes\n- encryption-in-transit\n- encryption-at-rest",
      },
      {
        name: "Amazon Keyspaces",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/keyspaces",
        official_link: "https://docs.aws.amazon.com/keyspaces/",
        description:
          "Amazon Keyspaces (for Apache Cassandra) is a scalable, highly available, and managed Apache Cassandra–compatible database service. With Amazon Keyspaces, you can run Cassandra workloads on AWS using the same Cassandra application code and developer tools that you use today. It is serverless and managed by AWS and does not require you to provision, patch, or manage servers, and does not require you to install, maintain, or operate software. The service can automatically scale tables up and down in response to application traffic. Data is encrypted by default and Amazon Keyspaces backs up table data continuously using point-in-time recovery. Keyspaces gives you the performance, elasticity, and enterprise features you need to operate business-critical Cassandra workloads at scale.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: "- cost_center\n- project\n- environment\n- Keyspace suffix (optional)",
      },
      {
        name: "Amazon Neptune",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/neptunedb",
        official_link: "https://docs.aws.amazon.com/neptune/",
        description:
          "Amazon Neptune is a service that includes a graph database engine, graph analytics database engine, graph machine learning (ML), and visualization tools, which can be used individually or together. The Neptune service makes it easy to work with graph data on AWS.",
        uar: { cace: true, cmaa: false, mage: false },
        onboarding_requirements:
          "- cost_center\n- project\n- environment\n- Quantity\n- environment\n- Multi-AZ\n- Instance Type/Instance Class\n- Storage",
      },
      {
        name: "Amazon RDS",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/rds",
        official_link: "https://docs.aws.amazon.com/rds/",
        description:
          "A managed relational database service that provides several familiar database engines to choose from, including PostgreSQL, MySQL, and Oracle.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- Quantity
- Engine
- Instance Type/Instance Class
- Multi-AZ
- Storage
- RDS Proxy needed (without native connection pooling capabilities): Yes/No
- Target database endpoint: If yes
- Serverless (Aurora PostgreSQL/MySQL only): Yes/No`,
      },
      {
        name: "Amazon Redshift",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/redshift",
        official_link: "https://docs.aws.amazon.com/redshift/",
        description:
          "AWS Redshift is an Internet hosting service and data warehouse product which forms part of the larger cloud-computing platform Amazon Web Services. Now includes the Zero-ETL integration for easier data ingestion.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- enable_logging (Optional)
- cluster_node_type (ex: "ra3.xlplus")
- cluster_number_of_nodes
- zero-etl integration (Optional)
  - source RDS or cluster
  - target Redshift cluster`,
      },
      {
        name: "Amazon RDS Aurora",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/rds",
        official_link: "https://aws.amazon.com/rds/aurora/",
        description:
          "Amazon Aurora is a MySQL and PostgreSQL-compatible relational database built for the cloud that combines the performance and availability of traditional enterprise databases with the simplicity and cost-effectiveness of open source databases. Amazon Aurora is up to five times faster than standard MySQL databases and three times faster than standard PostgreSQL databases. It provides the security, availability, and reliability of commercial databases at 1/10th the cost. Amazon Aurora is fully managed by Amazon Relational Database Service (RDS), which automates time-consuming administration tasks like hardware provisioning, database setup, patching, and backups. Amazon Aurora features a distributed, fault-tolerant, self-healing storage system that auto-scales up to 128TB per database instance. It delivers high performance and availability with up to 15 low-latency read replicas, point-in-time recovery, continuous backup to Amazon S3, and replication across three Availability Zones.",
        uar: { cace: true, cmaa: true, mage: false },
      },
      {
        name: "Amazon RDS MySQL",
        provider: "AWS",
        internal_link: "https://cloud-docs.cbp.dhs.gov/platforms/development/amazon/rds.html#mysql",
        official_link: "https://aws.amazon.com/rds/",
        description:
          'RDS is a distributed relational database service by Amazon Web Services (AWS). It is a web service running "in the cloud" designed to simplify the setup, operation, and scaling of a relational database for use in applications. Complex administration processes like patching the database software, backing up databases and enabling point-in-time recovery are managed automatically. Scaling storage and compute resources can be performed by a single API call.',
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- Quantity
- Engine (MySQL)
- Instance Type/Instance Class
- Multi-AZ
- Storage
- RDS Proxy needed (without native connection pooling capabilities): Yes/No
- Target database endpoint: If yes
- Serverless (Aurora PostgreSQL/MySQL only): Yes/No`,
      },
      {
        name: "Amazon RDS Oracle",
        provider: "AWS",
        internal_link: "https://cloud-docs.cbp.dhs.gov/platforms/development/amazon/rds.html#oracle",
        official_link: "https://aws.amazon.com/rds/",
        description:
          'RDS is a distributed relational database service by Amazon Web Services (AWS). It is a web service running "in the cloud" designed to simplify the setup, operation, and scaling of a relational database for use in applications. Complex administration processes like patching the database software, backing up databases and enabling point-in-time recovery are managed automatically. Scaling storage and compute resources can be performed by a single API call.',
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- Quantity
- Engine (Oracle)
- Instance Type/Instance Class
- Multi-AZ
- Storage
- RDS Proxy needed (without native connection pooling capabilities): Yes/No
- Target database endpoint: If yes
- Serverless (Aurora PostgreSQL/MySQL only): Yes/No`,
      },
      {
        name: "Amazon RDS PostgreSQL",
        provider: "AWS",
        internal_link: "https://cloud-docs.cbp.dhs.gov/platforms/development/amazon/rds.html#postgresql",
        official_link: "https://aws.amazon.com/rds/",
        description:
          "Amazon RDS is a web service that makes it easier to set up, operate, and scale a relational database in the cloud. It provides cost-efficient, resizable capacity for an industry-standard relational database and manages common database administration tasks. RDS (Postgres) specifically makes it easy to set up, operate, and scale PostgreSQL deployments in the cloud.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- Quantity
- Engine (Postgres)
- Instance Type/Instance Class
- Multi-AZ
- Storage
- RDS Proxy needed (without native connection pooling capabilities): Yes/No
- Target database endpoint: If yes
- Serverless (Aurora PostgreSQL/MySQL only): Yes/No`,
      },
      {
        name: "Amazon RDS SQL Server",
        provider: "AWS",
        internal_link: null,
        official_link: "https://aws.amazon.com/rds/sqlserver/",
        description:
          'Amazon RDS SQL Server is a relational database management system developed by Microsoft. Amazon RDS for SQL Server supports the "License Included" licensing model. You do not need separately purchased Microsoft SQL Server licenses.',
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- Quantity
- Engine (SQL Server)
- Instance Type/Instance Class
- Multi-AZ
- Storage
- RDS Proxy needed (without native connection pooling capabilities): Yes/No
- Target database endpoint: If yes
- Serverless (Aurora PostgreSQL/MySQL only): Yes/No`,
      },
      {
        name: "Amazon RDS Proxy",
        provider: "AWS",
        internal_link: "https://cloud-docs.cbp.dhs.gov/platforms/development/amazon/rds.html#amazon-rds-proxy",
        official_link: "https://aws.amazon.com/rds/proxy/",
        description:
          "Amazon RDS Proxy is a fully managed database proxy designed to enhance the scalability, availability, and security of applications interacting with Amazon RDS databases. It achieves this by pooling and sharing database connections, reducing the overhead of establishing new connections, and improving resilience during database failovers.",
        uar: { cace: true, cmaa: true, mage: false },
      },
      {
        name: "Amazon Aurora Serverless",
        provider: "AWS",
        internal_link: "https://cloud-docs.cbp.dhs.gov/platforms/development/amazon/rds.html#aurora-serverless",
        official_link: "https://aws.amazon.com/rds/aurora/serverless/",
        description:
          "Amazon Aurora Serverless is an on demand, autoscaling configuration for Amazon Aurora, a relational database service compatible with MySQL and PostgreSQL. It automatically adjusts database capacity based on workload requirements, eliminating the need for manual provisioning and management of database servers.",
        uar: { cace: true, cmaa: true, mage: false },
      },
    ],
  },
  {
    name: "Identity & Access Management",
    services: [
      {
        name: "AWS IAM",
        provider: "AWS",
        internal_link: "https://cloud-docs.cbp.dhs.gov/platforms/development/amazon/iam.html",
        official_link: "https://docs.aws.amazon.com/iam/",
        description:
          "AWS IAM (Identity and Access Management) is a core security service that controls who can authenticate (who you are) and authorize (what you are allowed to do) within your AWS environment. Access is denied by default unless explicitly granted by a policy.",
        uar: { cace: true, cmaa: true, mage: false },
      },
    ],
  },
  {
    name: "Infrastructure & Platforms",
    services: [
      {
        name: "Amazon VPC",
        provider: "AWS",
        internal_link: "./platforms/development/network",
        official_link: "https://aws.amazon.com/vpc/",
        description:
          "Amazon Virtual Private Cloud (Amazon VPC) is a logically isolated virtual network that closely resembles a traditional network and has subnets and IP addresses that are allocated to the various resources that are provisioned within the VPC. VPCs are configured by the administrators and are not a service that would be explicitly requested.",
        uar: { cace: true, cmaa: true, mage: false },
      },
      {
        name: "Demilitarized Zone",
        provider: "AWS",
        internal_link: "https://gitlab-pages.cbp.dhs.gov/cloud/documentation/cim-7266/platforms/dmz/",
        official_link: null,
        description:
          "CBP AWS Trusted Internet Connections 3.0 (in short CATIC 3.0) allows CBP project teams to provide external connectivity to their services running in the on-premises and cloud. CATIC 3.0 is CBP's alternative to existing demilitarized zones (DMZ) — DHS TIC and DHS Cloudflare — to expose CBP services to users in the public Internet.",
        uar: { cace: true, cmaa: true, mage: false },
      },
    ],
  },
  {
    name: "AI & Machine Learning",
    services: [
      {
        name: "Amazon Bedrock",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/bedrock",
        official_link: "https://docs.aws.amazon.com/bedrock/",
        description:
          "Amazon Bedrock is a fully managed service from Amazon Web Services (AWS) that provides access to a variety of powerful foundation models (FMs) from leading AI companies, including Anthropic, Meta, and Cohere, as well as Amazon's own Titan family of models. It is designed to simplify the development of generative AI applications without the need to manage infrastructure.",
        uar: { cace: false, cmaa: true, mage: false },
        onboarding_requirements:
          "- cost_center\n- project\n- environment\n- TRM Link to the requested Large Language Model (LLM)",
      },
      {
        name: "Amazon SageMaker",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/sagemaker-notebook",
        official_link: "https://docs.aws.amazon.com/sagemaker/",
        description:
          "Amazon SageMaker provides data scientists and developers with a fully managed environment to prepare, build, train, and deploy Machine Learning models with fully managed infrastructure, tools, and workflows.",
        uar: { cace: false, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- Instance Type (The name of the ML instance type, defaults to ml.t3.medium)
- Volume size (The size, in GB, of the ML storage volume to attach to the notebook instance. Defaults to 5 GB)
- S3 bucket (Does the Sagemaker instance need a new S3 bucket? Yes or No?)
- Additional IAM Policies (Optional)
  - List of all SageMaker IAM Actions that the End User plans to perform`,
      },
      {
        name: "Amazon Groundtruth",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/sagemaker-groundtruth",
        official_link: "https://aws.amazon.com/sagemaker/groundtruth/",
        description:
          "Amazon Ground Truth enables users with the ability to label image and text datasets to provide the correct metadata for Machine Learning (ML) model training. Auto-labeling is a ML enabled Ground Truth feature available to automatically complete labeling operations on a dataset while using only part of the dataset that has been already manually labeled within Ground Truth.",
        uar: { cace: false, cmaa: true, mage: false },
      },
      {
        name: "Amazon SageMaker Studio",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/sagemaker-studio",
        official_link: "https://aws.amazon.com/sagemaker/studio/",
        description:
          "Amazon SageMaker Studio provides a single, unified web-based interface with purpose-built tools to prepare, build, train, and deploy Machine Learning models using your preferred IDE.",
        uar: { cace: false, cmaa: true, mage: false },
        onboarding_requirements:
          "- cost_center\n- project (note that the project will be the SageMaker Studio domain name)\n- environment",
      },
    ],
  },
  {
    name: "Messaging",
    services: [
      {
        name: "Amazon MQ",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/mq",
        official_link: "https://docs.aws.amazon.com/amazon-mq/",
        description:
          "Amazon MQ is a managed message broker service for Apache ActiveMQ and RabbitMQ that makes it easy to set up and operate message brokers on AWS. Amazon MQ reduces your operational responsibilities by managing the provisioning, setup, and maintenance of message brokers for you. Because Amazon MQ connects to your current applications with industry-standard APIs and protocols, you can easily migrate to AWS without having to rewrite code.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- Quantity
- Engine Type (ActiveMQ or RabbitMQ)
- Deployment mode (SINGLE_INSTANCE [default], ACTIVE_STANDBY_MULTI_AZ, or CLUSTER_MULTI_AZ)
- Broker instance types (see AWS documentation for supported instance types)`,
      },
      {
        name: "Amazon SQS",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/sqs",
        official_link: "https://docs.aws.amazon.com/sqs/",
        description:
          "Amazon SQS is a fully managed message queuing service that decouples and scales microservices, distributed systems, and serverless applications. SQS eliminates the complexity and overhead associated with managing and operating message-oriented middleware and empowers developers to focus on differentiating work. Using SQS, one can send, store, and receive messages between software components at any volume, without losing messages or requiring other services to be available. SQS offers two types of message queues. Standard queues offer maximum throughput, best-effort ordering, and at-least-once delivery. SQS FIFO queues are designed to guarantee that messages are processed exactly once, in the exact order that they are sent.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `Produce/Consume Queue
- cost-center
- project
- environment
<p title="
- queue-name
- suffix (optional)
- queue-type (standard or fifo)
- fifo-content-based-deduplication (true or false, for fifo queues only)
- message-retention-period (e.g., 4 days)
- visibility-timeout (in seconds)
- receive-message-wait-time (in seconds)
- deadletter-queue
- dlq-maximum-receives (number of receives before moving to dlq)
Dead Letter Queue
- cost-center
- project
- environment
- queue-name
- suffix (optional)
- queue-type (standard or fifo)
- fifo-content-based-deduplication (true or false, for fifo queues only)
- message-retention-period (e.g., 4 days)
- visibility-timeout (in seconds)
- receive-message-wait-time (in seconds)

At a minimal we will need to know the queue type and the retention period to get this added to our work queue. Note, anytime there is a QueueType change to an existing resource then it's a replacement (decommission the old and recreate a new one).
">Hover over this for additional information.</p>`,
      },
      {
        name: "Amazon End User Messaging",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/eum",
        official_link: "https://aws.amazon.com/sns/",
        description:
          "AWS End User Messaging empowers developers to integrate scalable and reliable messaging capabilities into their applications. Whether it is time-sensitive alerts, one-time passwords, or two-way communications, AWS End User Messaging helps ensure your messages reach their local or global destination across channels like SMS, MMS. AWS End User Messaging helps unlock the full potential of your messaging strategy by connecting your applications directly to your end-users across the channels they use and trust.",
        uar: { cace: true, cmaa: false, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
<p title="
- Estimated Monthly Message Volume - Optional (Less than 500 / Greater than 500 but less than 5000 / Greater than 5000)
- Destination (Local or International)
- Two-way SMS Messaging (Yes or No)
- Originator Type
  - Long Code - Supports only voice messaging.
  - Short Code - Supports SMS and MMS messaging.
  - Toll-Free – Supports SMS, MMS, and voice messaging.
  - 10DLC - Supports SMS, MMS, and voice messaging.
- Registration Information (Please note it will take several weeks for registration to complete)
  - Enter Campaign Description
    - Identify who the sender is
    - Identify who the recipient is
    - Why messages are being sent to the intended recipient.
  - Company's SMS Terms & Conditions (URL or File, less than 500KB)
- Company Privacy policy URL (Example - https://www.dhs.gov/topics/privacy)
">Hover over this for additional information.</p>
<p title="
- Campaign opt-in workflow (Explain end-to-end how a user explicitly consents to receive text messages.)
- Opt-in confirmation message (Provide the message sent to recipients confirming with them that they've opted in to your service.)
- Help message (Provide the message sent to end-users when they send the 'HELP' keyword.)
- Stop message (Provide the message sent to end-users when they send the opt-out keywords such as 'STOP'.)
- Message Type - Transactional or Promotional (Needs to align with your campaign use case, if it's misaligned your registration will be denied.)
- Use case – Details about how this campaign will be used for sending SMS messages.
">Hover over this for continued information from above.</p>
<p title="
- Subscriber opt-in (Yes or No, Yes acknowledges you are required to collect and process consumer opt-ins.)
- Subscriber opt-out (Yes or No, Yes acknowledges you are required to collect and process consumer opt-outs.)
- Subscriber help (Yes or No, Yes confirms you've implemented automated 'HELP' replies with sender contact info.)
- Message Sample (At least one sample is required, minimum 20 characters, limited to 1024 characters. Include a sample message for each message you plan on sending from this campaign, up to 5 samples.)
- MMS Sample – Optional with File attachment
">Hover over this for continued information from above.</p>`,
      },
      {
        name: "Amazon SNS",
        provider: "AWS",
        internal_link:
          "https://gitlab-pages.cbp.dhs.gov/cloud/documentation/cim-7266/platforms/development/amazon/sns.html",
        official_link: "https://aws.amazon.com/sns/",
        description:
          "Amazon SNS is a fully managed, reliable pub/sub messaging service that enables asynchronous communication between microservices or other distributed system components. It allows publishers to send messages to many subscribers including Lambda and SQS using one or more topics. While SQS offers persistence and a pull-based model, where a consumer polls a queue to process single messages, SNS offers a push-based fire and forget model, where multiple consumers subscribe to a topic and each process their own copy of a message.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- Topic Names
- Need FIFO (First-In-First-Out) Topic
- Need Disable Content-Based Deduplication
- How many SNS Publishers (Optional)
- How many SNS Subscribers (Optional)
- How many Lambda Publishers (Optional)
- How many Lambda Subscribers (Optional)`,
      },
      {
        name: "Amazon Kinesis Data Streams",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/kinesis",
        official_link: "https://docs.aws.amazon.com/streams/",
        description:
          "Amazon Kinesis Data Streams makes it easy to collect, process, and analyze real-time, streaming data to get timely insights and react quickly to new information. Amazon Kinesis offers key capabilities to cost-effectively process streaming data at any scale, along with the flexibility to choose the tools that best suit the requirements of an application. With Amazon Kinesis, one can ingest real-time data such as video, audio, application logs, website clickstreams, and IoT telemetry data for machine learning, analytics, and other applications. Amazon Kinesis enables one to process and analyze data as it arrives and respond instantly instead of having to wait until all data is collected before the processing can begin.",
        uar: { cace: false, cmaa: true, mage: false },
        onboarding_requirements: "- cost_center\n- project\n- environment\n- Quantity",
      },
    ],
  },
  {
    name: "Migration & Transfer",
    services: [
      {
        name: "AWS DMS",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/dms",
        official_link: "https://docs.aws.amazon.com/dms/",
        description:
          "AWS DMS enables database migration to AWS quickly and securely. The source database remains fully operational during migration, minimizing downtime to applications that rely on the database. The AWS Database Migration Service can migrate data to and from most widely used commercial and open-source databases. The service supports homogenous migrations such as Oracle to Oracle, as well as heterogeneous migrations between different database platforms, such as Oracle to Amazon Aurora or Microsoft SQL Server to MySQL. One can stream data to Amazon Redshift, Amazon DynamoDB, and Amazon S3 from any of the supported sources, which are Amazon Aurora, PostgreSQL, MySQL, MariaDB, Oracle Database, SAP ASE, SQL Server, IBM DB2 LUW, and MongoDB, enabling consolidation and easy analysis of data in a petabyte-scale data warehouse. AWS Database Migration Service can also be used for continuous data replication with high availability.",
        uar: { cace: false, cmaa: true, mage: false },
        onboarding_requirements: `- cost-center
- project
- environment
- Full-load OR Full-load plus on-going replication
- Source database connection parameters
- Target database connection parameters

Note to Customer- There are many other configuration parameters that will be set based on database engine and volume of data.`,
      },
      {
        name: "AWS Transfer Family",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/transfer",
        official_link: "https://aws.amazon.com/aws-transfer-family",
        description: "AWS Transfer is a fully managed service for transfer of files over SFTP.",
        uar: { cace: true, cmaa: false, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment

For using the Amazon Transfer Service, please provide user(s) information in a password protected excel file in the specified format: Username, Folder, Type, Value — Username is the username; Folder is the folder under the designated S3 bucket for the directorate; Type is for the type of authentication used and valid values are "cert" or "password"; Value is the certificate or the password.`,
      },
    ],
  },
  {
    name: "Monitoring & Management",
    services: [
      {
        name: "AWS CloudTrail",
        provider: "AWS",
        internal_link: null,
        official_link: "https://aws.amazon.com/cloudtrail/",
        description:
          "AWS CloudTrail is an AWS service that helps you enable operational and risk auditing, governance, and compliance of your AWS account. Actions taken by a user, role, or an AWS service are recorded as events in CloudTrail. Events include actions taken in the AWS Management Console, AWS Command Line Interface, and AWS SDKs and APIs.",
        uar: { cace: true, cmaa: true, mage: false },
      },
      {
        name: "AWS CloudWatch",
        provider: "AWS",
        internal_link: null,
        official_link: "https://docs.aws.amazon.com/cloudwatch/",
        description:
          "Amazon CloudWatch is a monitoring and observability service for Amazon Web Services (AWS) resources and applications. It collects and tracks metrics, collects and stores log files, sets alarms, and automatically reacts to changes in your infrastructure to keep your systems running smoothly.",
        uar: { cace: true, cmaa: true, mage: false },
      },
      {
        name: "Amazon OpenSearch Service",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/opensearch",
        official_link: "https://aws.amazon.com/opensearch-service/",
        description:
          "Amazon OpenSearch Service makes it easy for you to perform interactive log analytics, real-time application monitoring, website search, and more. OpenSearch is an open source, distributed search and analytics suite derived from Elasticsearch. Amazon OpenSearch Service offers the latest versions of OpenSearch, support for 19 versions of Elasticsearch (1.5 to 7.10 versions), and visualization capabilities powered by OpenSearch Dashboards and Kibana (1.5 to 7.10 versions).",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost_center
- project
- environment
- quantity
- domain-name
- multi-az (If so, 2AZs?)
- es-version
- data-node-instance-type
- number-of-data-node-instances
- dedicated-to-master-instances
- master-instance-type
- storage
- encryption
- snapshot
- Will this be an internal only accessible domain (i.e. No access over the internet)?`,
      },
      {
        name: "AWS CloudWatch Database Insights",
        provider: "AWS",
        internal_link:
          "https://cloud-docs.cbp.dhs.gov/platforms/development/amazon/rds.html#aws-database-insights-di",
        official_link: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Database-Insights.html",
        description:
          "Amazon CloudWatch Database Insights is a comprehensive, unified observability solution for monitoring and troubleshooting Amazon RDS and Aurora databases. It provides a single dashboard for fleet-level health, automatic telemetry collection, and AI-powered diagnostics to pinpoint bottlenecks in relational databases like PostgreSQL, MySQL, Oracle, and SQL Server.",
        uar: { cace: true, cmaa: false, mage: false },
      },
    ],
  },
  {
    name: "Secret Management",
    services: [
      {
        name: "AWS KMS",
        provider: "AWS",
        internal_link: null,
        official_link: "https://aws.amazon.com/kms/",
        description:
          "AWS KMS keys and functionality are used by other AWS services and is not a service that would need to be explicitly requested. It is an encryption and key management service scaled for cloud. The AWS KMS keys are protected by FIPS 140-3 Security Level 3 validated hardware security modules (HSM).",
        uar: { cace: true, cmaa: true, mage: false },
      },
      {
        name: "AWS Secrets Manager",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/secrets-mngr",
        official_link: "https://aws.amazon.com/secrets-manager/",
        description:
          "AWS Secrets Manager helps you manage, retrieve, and rotate credentials, tokens, API keys, and other secrets throughout their lifecycles. Many AWS services store and use secrets in Secrets Manager.",
        uar: { cace: true, cmaa: true, mage: false },
      },
    ],
  },
  {
    name: "Security Scanning",
    services: [
      {
        name: "Amazon Guard Duty",
        provider: "AWS",
        internal_link:
          "https://cloud-docs.cbp.dhs.gov/governance/compliancefaq.html#threat-monitoring-and-compliance-standards",
        official_link: "https://aws.amazon.com/guardduty/",
        description:
          "Amazon GuardDuty is a managed threat detection service that continuously monitors your AWS environment for malicious activity, unauthorized behavior, and security compromises. It uses machine learning, anomaly detection, and integrated threat intelligence to analyze data across multiple AWS sources.",
        uar: { cace: true, cmaa: true, mage: false },
      },
      {
        name: "AWS Security Hub",
        provider: "AWS",
        internal_link:
          "https://cloud-docs.cbp.dhs.gov/governance/compliancefaq.html#threat-monitoring-and-compliance-standards",
        official_link: "https://aws.amazon.com/security-hub/",
        description:
          "AWS Security Hub is a cloud security posture management (CSPM) and SOAR (Security Orchestration, Automation, and Response) service. It evaluates your AWS environment against industry standards and best practices and compliance frameworks like CIS, PCI DSS, and NIST, assigning you a percentage-based security score.",
        uar: { cace: true, cmaa: true, mage: false },
      },
    ],
  },
  {
    name: "Storage",
    services: [
      {
        name: "Amazon S3",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/s3",
        official_link: "https://docs.aws.amazon.com/s3/",
        description:
          'Amazon S3 is a web service offered by Amazon Web Services. Amazon S3 provides storage through web services interfaces (REST, SOAP, and BitTorrent). Instead of organizing files in a traditional folder hierarchy (like a computer hard drive), S3 treats each file as an independent "object" stored in a flat architecture. Amazon S3 supports three types of buckets. The General bucket type is for general object storage.',
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements:
          "- cost-center\n- project\n- environment\n- quantity\n- bucket-name\n- actions (GetObject, PutObject, DeleteObject)\n- bucket-type (general)",
      },
      {
        name: "AWS Backup",
        provider: "AWS",
        internal_link: null,
        official_link: "https://docs.aws.amazon.com/aws-backup/",
        description:
          "AWS Backup is a fully managed service that centralizes and automates data protection across AWS services and hybrid workloads.",
        uar: { cace: true, cmaa: true, mage: false },
      },
      {
        name: "Amazon Elastic Block Store",
        provider: "AWS",
        internal_link: null,
        official_link: "https://aws.amazon.com/ebs/",
        description:
          "Amazon Elastic Block Store (EBS) provides raw, block-level storage volumes for use with Amazon EC2 instances. It functions like a virtual hard drive, enabling you to install operating systems, run databases, or store persistent files that remain intact even when an EC2 instance is stopped or restarted.",
        uar: { cace: true, cmaa: true, mage: false },
      },
      {
        name: "Amazon S3 Vector Bucket",
        provider: "AWS",
        internal_link:
          "https://gitlab-pages.cbp.dhs.gov/cloud/documentation/cim-7266/platforms/development/amazon/s3.html#s3-vector-buckets",
        official_link: "https://aws.amazon.com/s3/",
        description:
          "Vector buckets are a type of Amazon S3 bucket designed specifically for storing and querying vector data. They are optimized for long-term vector storage with sub-second search times.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements:
          "- cost-center\n- project\n- environment\n- quantity\n- bucket-name\n- actions (GetObject, PutObject, DeleteObject)\n- bucket-type (vector)",
      },
      {
        name: "Amazon S3 Table Bucket",
        provider: "AWS",
        internal_link: "https://gitlab-pages.cbp.dhs.gov/cloud/documentation/cim-7266/platforms/development/amazon/s3.html",
        official_link: "https://aws.amazon.com/s3/",
        description:
          "Table buckets are an Amazon S3 bucket type that can be used to create and store tables as S3 resources. They are used to store tabular data and metadata as objects for use in analytics workloads.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements:
          "- cost-center\n- project\n- environment\n- quantity\n- bucket-name\n- actions (GetObject, PutObject, DeleteObject)\n- bucket-type (table)",
      },
    ],
  },
  {
    name: "Streaming",
    services: [
      {
        name: "Amazon MSK",
        provider: "AWS",
        internal_link: "./platforms/development/amazon/msk",
        official_link: "https://docs.aws.amazon.com/msk/",
        description:
          "AWS MSK (Managed Streaming for Apache Kafka) is a fully managed service that simplifies running Apache Kafka applications on AWS. It handles infrastructure tasks like provisioning, scaling, patching, and multi-AZ replication, letting you build real-time data pipelines and streaming applications without managing the underlying servers.",
        uar: { cace: true, cmaa: true, mage: false },
        onboarding_requirements: `- cost-center
- project
- environment
- number-of-nodes (non-prod defaults to a 3 node cluster unless requested otherwise; prod has a minimum of 6 nodes, in increments of 3)
- For PROD, the Amazon EC2 instance type to use for brokers (kafka.m5.large, kafka.m5.xlarge, kafka.m5.2xlarge, kafka.m5.4xlarge, kafka.m5.12xlarge, or kafka.m5.24xlarge)`,
      },
    ],
  },
];
