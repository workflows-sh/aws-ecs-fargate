
![aws-fargate](https://user-images.githubusercontent.com/24816990/174084189-2a529767-b3ba-4688-8750-f8dedb2abbd6.svg)

# Overview

This repo includes a complete AWS - ECS fargate Infrastructure stack that enables a PaaS workflow with GitOps / ChatOps features and supports ECS, Fargate, Aurora, SQS, Redis, and Autoscaling via CDK.


## Table of contents

- [Overview](#overview)
  - [Table of contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Demo](#demo)
  - [Latest Version](#latest-version)
  - [Getting Started](#getting-started)
    - [Set Up your Account on CTO.ai](#set-up-your-account-on-ctoai)
    - [Create Secrets from Settings](#create-secrets-from-settings)
    - [Create your Sample - App](#create-your-sample---app)
  - [Usage](#usage)
    - [Build and Publish Pipelines](#build-and-publish-pipelines)
    - [Build and Publish Services](#build-and-publish-services)
    - [Trigger your Pipelines and Services](#trigger-your-pipelines-and-services)
  - [Getting help](#getting-help)
  - [Reporting bugs and Contributing](#reporting-bugs-and-contributing)
  - [Learn more](#learn-more)
  - [Other questions?](#other-questions)
  - [License](#license)

---

## Prerequisites

- [A local NodeJS programming environment and Workflow CLI installed on your machine](https://cto.ai/docs/install-cli)
- [An AWS Personal Access key and Secret Key, which you can create via the AWS Console](https://cto.ai/docs/aws-ecs-fargate#create-secrets-from-settings)
- [Docker](https://docs.docker.com/get-docker/), [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html), and [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) installed on your machine.
- [NVM Installed](https://github.com/nvm-sh/nvm)

---

## Demo 

You can run and deploy the AWS-ECS-Fargate Workflow directly on our [Platform](https://cto.ai/), kindly follow the steps below to get started 🚀

## Latest Version 

The AWS - ECS Fargate Workflow is running on the latest version


## Getting Started 

```
git clone https://github.com/workflows-sh/aws-ecs-fargate

cd aws-ecs-fargate
```

### Set Up your Account on CTO.ai

Before you can deploy this Workflow, you need to [Setup your account on CTO.ai](https://cto.ai/docs/setup-flow)

### Create Secrets from Settings 

Secrets are encrypted environment variables that CTO.ai utilizes within your workflow to build and run your application and deployments. [Follow this guide to create secrets from settings.](https://cto.ai/docs/aws-ecs-fargate#create-secrets-from-settings), and also [generate your Github token](https://cto.ai/docs/aws-ecs-fargate#generate-github-token)

### Create your Sample - App

[You need to build and run your Sample-app](https://cto.ai/docs/aws-ecs-fargate#ecs---fargate-demo). Your sample App can be a Node.js HTTP server with a Dockerfile and `ops.yml` file.

---

## Usage 

Follow the following steps below to configure and deploy your AWS - ECS Fargate Workflow

### Build and Publish Pipelines 

- [Build Pipelines locally with the Workflow CLI](https://cto.ai/docs/aws-ecs-fargate#ecs--fargate-workflow-pipelines)


- [Run Pipelines locally with the Workflow CLI](https://cto.ai/docs/aws-ecs-fargate#run-pipelines-locally-with-the-ctoai-cli)


- [Set up your Infrastructure](https://cto.ai/docs/aws-ecs-fargate#run-and-set-up-your-infrastructure)


- [Publish Pipelines locally with the workflow CLI](https://cto.ai/docs/aws-ecs-fargate#build--publish-pipelines-locally-with-the-ctoai-cli)


---

### Build and Publish Services 

- [Build Services locally with the Workflow CLI](https://cto.ai/docs/aws-ecs-fargate#build-services-locally-with-the-ctoai-cli)


- [Publish Services locally with the Workflow CLI](https://cto.ai/docs/aws-ecs-fargate#publish-services-locally-with-the-ctoai-cli)


---


### Trigger your Pipelines and Services

When you are done building and publishing your Pipelines and Services, you can trigger them using **Event Triggers** 


- [Trigger your Pipelines using Events](https://cto.ai/docs/aws-ecs-fargate#trigger-pipelines-using-events)


- [Trigger your Services using Events](https://cto.ai/docs/aws-ecs-fargate#trigger-services-using-events)

---

## Getting help 

CTO.ai AWS-ECS-Fargate Workflow is an open-source project and is supported by the community. You can buy a supported version of CTO AWS-ECS Fargate at CTO.ai

Learn more about CTO.ai community support channels [here](https://cto.ai/community)

- Slack: https://cto.ai/community


## Reporting bugs and Contributing 

Feel free to submit PRs or to fill issues. Every kind of help is appreciated.

Kindly check our [Contributing guide](https://github.com/workflows-sh/aws-ecs-fargate/blob/main/Contributing.md) on how to propose bugfixes and improvements, and submitting pull requests to the project.


- View issues related to this image in our [GitHub repository issues tracker](https://github.com/workflows-sh/aws-ecs-fargate/issues)


## Learn more 

- Read the manual on our [Docs](https://cto.ai/docs/aws-ecs-fargate)

---

## Other questions?

Check out our [FAQ](https://cto.ai/docs/faq), send us an [email](https://cto.ai/docs/contact-support), or open an issue with your question. We'd love to hear from you!


## License 

&copy; CTO.ai, Inc., 2022

Distributed under MIT License (`The MIT License`).

See [LICENSE](License) for more information.