# AWS-ECS-FARGATE

A PaaS workflow with GitOps / ChatOps features that supports ECS, Fargate, Aurora, SQS, Redis, Autoscaling via CDK

![13bcto](https://user-images.githubusercontent.com/24816990/152709028-1de68ba9-c813-4827-bda7-88ec1f61584d.gif)

## Table of Contents

- [AWS-ECS-FARGATE](#aws-ecs-fargate)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
- [Introduction](#introduction)
  - [Installation](#installation)
    - [Build and Run your Sample-App](#build-and-run-your-sample-app)
  - [Documentation](#documentation)
    - [Run and setup your Infrastructure](#run-and-setup-your-infrastructure)
    - [Build and publish your Pipelines and Services.](#build-and-publish-your-pipelines-and-services)

## Prerequisites

- A local NodeJS programming environment.
- An AWS Personal Access key and Secret Key, which you can create via the AWS Console.
- Docker, AWS CDK, and AWS CLI installed on your machine. 
- NPM Installed.


# Introduction 

The workflow.sh repo contains the AWS ECS and Fargate stack that acts as your infrastructure for you to be able to deploy, manage and run your container services and resources and build your Pipelines and Services on CTO.ai

---

## Installation 

---

### Build and Run your Sample-App

- Create and log in to your account on CTO.ai

**The workflow.sh repository is the Infrastructure stack (AWS Elastic container service and Fargate) that will let you deploy and host your sample-app repo. So you need to build and run your Sample-App before you can build your infrastructure.**

Your `Sample-App` can be any application of any programming language you want to build using with a Dockerfile and your ops.yml file. The ops.yaml file contains the services and pipelines sections and also specifies the events, jobs, runners, and steps for your deployment.

- Add and authorize your application via GitHub 

<img width="1439" alt="3" src="https://user-images.githubusercontent.com/24816990/152695091-95d33152-b80d-4874-b2b9-7c6873a82cc3.png">


- Back in your CTO.ai dashboard, you need to create your secret keys by clicking on **Settings** and selecting **Secrets**. You will be creating four secrets keys:
            - AWS_ACCESS_KEY_ID 
            - AWS_SECRET_ACCESS_KEY 
            - AWS_ACCOUNT_NUMBER 
            - GITHUB_TOKEN

<img width="1244" alt="7" src="https://user-images.githubusercontent.com/24816990/152702777-d7304962-74a9-41ef-8c41-6f8e5a01eb5f.png">


**Secrets keys are encrypted environment variables that CTO.ai utilizes within your workflow to build and run your application and deployments.**



---

## Documentation

### Run and setup your Infrastructure

- Back in your **aws-ecs-fargate** infrastructure, start your stacks using the `ops run -b.` command. This will provision your AWS ECS and Fargate stacks to host your Sample-App.


        - Select setup an environment.


<img width="1052" alt="14" src="https://user-images.githubusercontent.com/24816990/152706391-48da2820-7d1f-4d16-88b9-826de98d3e83.png">


- Enter the name of your environment. You can use `dev` as the name of your environment.

<img width="908" alt="15" src="https://user-images.githubusercontent.com/24816990/152706425-cbc499f1-de71-4464-b360-83aa1900a65e.png">


- Enter the name of your application repo you created which is sample-app and hit enter.

<img width="1006" alt="16" src="https://user-images.githubusercontent.com/24816990/152706446-64d44d5f-8f62-4a63-a435-67027e7b1b50.png">


- It will start deploying and creating your stack using CloudFormation.

<img width="1440" alt="17" src="https://user-images.githubusercontent.com/24816990/152706474-0b93d663-64a1-421b-94aa-3623a3557308.png">


**Note:** **Your build won’t complete until your ECS cluster finds an image that exist in your ECR registry tagged main. When it sees the image your stack creation is going to be completed.**

---

### Build and publish your Pipelines and Services.

- Build your sample-app pipeline using `ops build .` The `ops build .` command will build your `op` for sharing, Docker image from your Dockerfile, and the set of files located in the specified path you created in your source code.

---

<img width="1439" alt="10" src="https://user-images.githubusercontent.com/24816990/152705777-98f8219a-6d23-47ce-bb2a-bdf0d274d207.png">


- Select the sample-app-pipeline because you want to compile and build the image for your application deployment on Fargate.


<img width="1440" alt="11" src="https://user-images.githubusercontent.com/24816990/152705921-c6d3b5a4-0123-4937-b56a-67b37115b124.png">

- When the image is built, it is going to create an Image ID, and will successfully tag your image to your cto.ai registry.

---

- Run your sample-app pipeline by entering `ops run .` in your terminal. The `ops run.` command will start the workflow you built from your team or registry.

        - Select the sample-app-pipeline to run

<img width="1123" alt="12" src="https://user-images.githubusercontent.com/24816990/152706097-130e587d-0d85-49ec-bb08-89658f125e2b.png">

- After your infrastructure stack has been created, you can now publish your **Pipelines and Services** from your sample-app application.


Publish your sample-app pipeline using the `ops publish .` When you publish your pipeline, it will take the steps in your `ops.yml` file and compile them into your container, publish the container workflow and create the event triggers  `(pull_request.merged and pull_request.opened)` you specified.

<img width="1440" alt="19" src="https://user-images.githubusercontent.com/24816990/152707691-bda59853-7832-483c-be8a-15f87b4360bb.png">


The process will start creating the release and eventually publish your pipeline. In your command line, you will be able to see the size, tag, and registry name.


- Build and publish your Services too so you can trigger them through your events.


Build your service by typing `ops build .` Select **sample-app - preview of sample app on the terminal**

<img width="1438" alt="21" src="https://user-images.githubusercontent.com/24816990/152707878-41e9c1b8-91b7-455d-ab1a-ece159236000.png">

- The process will build your sample-app service. 

<img width="1333" alt="22" src="https://user-images.githubusercontent.com/24816990/152707919-f0656e1c-f7ba-4ab2-817e-d63915370199.png">

- When it’s done building, publish it by using the `ops publish .` command.


<img width="1440" alt="23" src="https://user-images.githubusercontent.com/24816990/152707967-9cf20769-2802-45a5-82ce-072c94a85fb3.png">

- Select the first option **sample-app- preview of sample app.** the process will start creating your service release and eventually publish it. 


**To trigger your pipeline or Service you either need to open a pull request, merge a pull request or create a tag on your sample-app repository on GitHub. Your pipeline or service will get triggered when one of those events happens.**