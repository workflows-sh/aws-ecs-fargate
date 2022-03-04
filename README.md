# AWS ECS Fargate

## Introduction 

A PaaS like workflow for AWS ECS Fargate Infastructure as Code, powered by CTO.ai

## Pre-requisites

- Docker, Node (NVM) 12+ & npm installed
- Sign up for CTO.ai, setup CTO.ai team
- Install Ops CLI, Connect Github & Slack

## Documentation 

[![diagram](docs/img/diagram.png)](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0)

- [0:00](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Intro 
- [0:37](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Solution Overview 
- [0:55](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Developer Control Plane 
- [1:35](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Infrastructure Overview 
- [2:54](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Setup Secrets, Configs 
- [5:05](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Overview of Workflows 
- [6:34](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Run the Setup Command 
- [11:59](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Run a Service locally 
- [13:05](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Run a Pipeline locally 
- [17:15](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Mounting source to Pipeline locally 
- [18:30](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Building & Debugging Pipelines 
- [25:00](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Using ECR Console 
- [27:00](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Using Cloudformation Console 
- [27:45](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Using ECS Console 
- [29:05](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - ECS Stack Config State 
- [30:00](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Deploying a code change 
- [31:13](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Initialize an environment vault 
- [31:33](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Setting enviroment vault values 
- [32:10](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Override Container PORT 
- [33:15](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Listing vault values 
- [33:44](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Building a new image w/ pipelines 
- [36:04](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Deploying a new container 
- [37:20](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Monitoring deployment in ECS Console 
- [38:44](https://www.loom.com/share/b4b45f1030fb429888e2059a34ed56f0) - Monitoring & Searching container logs

_note: you'll have to select the timestamp, on loom.com_



---

# Overview

This repo includes a complete Digital Ocean infrastructure complete with Kubernetes, Container Registry, Postgres, Spaces, Load Balancers  A PaaS workflow with GitOps / ChatOps features that supports ECS, Fargate, Aurora, SQS, Redis, Autoscaling via CDK

## Table of contents

- [AWS ECS Fargate](#aws-ecs-fargate)
  - [Introduction](#introduction)
  - [Pre-requisites](#pre-requisites)
  - [Documentation](#documentation)
- [Overview](#overview)
  - [Table of contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Demo](#demo)
  - [Latest Version](#latest-version)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
  - [Getting help](#getting-help)
  - [Reporting bugs and Contributing](#reporting-bugs-and-contributing)
  - [Limitations](#limitations)
  - [Learn more](#learn-more)
  - [License](#license)

---

## Prerequisites

- A local NodeJS programming environment.
- An AWS Personal Access key and Secret Key, which you can create via the AWS Console.
- Docker, AWS CDK, and AWS CLI installed on your machine.
- NPM Installed.


## Demo 

You can try run and deploy the DigitalOcean Kubernetes workflow directly on our [Platform](CTO.ai).

## Latest Version 

The DigitalOcean Kubernetes workflow is updated 


## Getting Started 

- [Creating and setting up your Account on CTO.ai](https://cto.ai/auth/realms/ops/protocol/openid-connect/registrations?client_id=www&redirect_uri=https://cto.ai/questions&response_mode=fragment&response_type=code&scope=openid&nonce=d2e4022c-04e1-4f70-910c-31a9d25ef321)
- [install Ops CLI]()
- [Create AWS Secret and Access keys]()
- [Create GitHub Token]()
- [Attach keys on CTO.ai secrets dashboard]()


## Usage 

- [Building your Digital Ocean Workflow]()
- [Running your Digital Ocean Workflow]()
- [Publishing Workflow]()


## Getting help 

CTO.ai DigitalOcean Kubernetes Workflow is an open source project and is supported by the community. You can buy a supported version of CTO DOKS at CTO.ai

Learn more about CTO.ai community support channels [here](https://cto.ai/community)

- Slack (chat): https://cto.ai/community


## Reporting bugs and Contributing 

Feel free to submit PRs or to fill issues. Every kind of help is appreciated.

Kindly check our [Contributing guide]() on how to propose bugfixes and improvements, and submitting pull requests to the project.

- View issues related to this image in our GitHub repository: https://github.com/workflows-sh/do-k8s/issues


## Limitations 


## Learn more 

- Read the manual at: https://cto.ai/docs#


## License 

&copy; CTO.ai, Inc., 2022

Distributed under MIT License (`The MIT License`).

See [LICENSE](LICENSE) for more information.
