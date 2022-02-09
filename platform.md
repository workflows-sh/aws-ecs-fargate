## Platform Account Setup for AWS ECS Fargate 

A PaaS like workflow for AWS ECS Fargate Infastructure as Code, powered by CTO.ai


### Table of Contents



### Introduction 

This is a detailed guide on setting up your Platform for the AWS-ECS-FARGATE Workflow.

### Installation 

1. Visit the [Docker download page](https://docs.docker.com/get-docker/) to download Docker and also get [Node (NVM) 12+ and NPM installed](https://www.sitepoint.com/quick-tip-multiple-versions-node-nvm/) installed on your local machine. 

2. Visit [CTO.ai](https://cto.ai/auth/realms/ops/protocol/openid-connect/registrations?client_id=www&redirect_uri=https://cto.ai/questions&response_mode=fragment&response_type=code&scope=openid&nonce=a1d72c6b-a16f-4d85-88c1-84412cfaff97), enter your details and **Sign Up**

![Screenshot 2022-02-09 at 12 07 47](https://user-images.githubusercontent.com/24816990/153186439-0d438b33-fd30-4fc7-b36a-81a613982da1.png)

- In the dashboard pane, click on **My Teams** and select **New Team**

![1](https://user-images.githubusercontent.com/24816990/153188688-180c8765-e274-430f-9446-9a8c00a540f3.png)

- Enter the name of your **Team** and click on **Create Team**

![2](https://user-images.githubusercontent.com/24816990/153189225-846588e3-88bb-4604-9eea-52c0f9b5ef8b.png)



3. Connect your GitHub account to your CTO.ai Team via Setup Flow. 

- Back in the CTO.ai dashboard, click on **Let's setup your workflow**


![Screenshot 2022-02-09 at 12 19 18](https://user-images.githubusercontent.com/24816990/153189950-6ea67dd1-d401-48d1-a256-8942e3d1be83.png)


- You will see a Welcome page, Click on **Let's do it now!** 

![Screenshot 2022-02-09 at 12 21 54](https://user-images.githubusercontent.com/24816990/153190213-483c0629-9aa8-4f1b-b645-a8dfa49439c5.png)


- Select **Continue with your current team** or **Create a new team**

![Screenshot 2022-02-09 at 12 23 07](https://user-images.githubusercontent.com/24816990/153190483-bf3f3bd2-7e78-41e7-a885-fdb538ab5f27.png)


- You can invite members to your current team or Skip 

![Screenshot 2022-02-09 at 12 24 48](https://user-images.githubusercontent.com/24816990/153190810-c65bb157-369f-46e3-8883-6d6d362bba18.png)


- Connect your GitHub to add your repository to your team. Click on **Let's Connect GitHub**

![Screenshot 2022-02-09 at 12 26 50](https://user-images.githubusercontent.com/24816990/153191100-b096ba4b-83e0-41b9-bb14-8a40c00c489c.png)


- Install and authorize CTO.ai


![Screenshot 2022-02-09 at 12 34 01](https://user-images.githubusercontent.com/24816990/153192060-238ac84f-d441-46b3-85e6-5a1b8c79fcba.png)


- You will beb redirected to your workflow and you will see your GitHub was connected successfully. Select **Continue to learn about Workflows** to know how to setup your **Commands**, **Pipelines** and **Services**

![Screenshot 2022-02-09 at 12 36 48](https://user-images.githubusercontent.com/24816990/153192419-de8b0f67-3d3a-45c7-81c1-6332d9c947a8.png)


4. Install The Ops CLI. Before you install the Ops CLI, you'll need to install [Docker](https://docs.docker.com/get-docker/) and the latest version of [Node Version Manager](https://github.com/nvm-sh/nvm)

- Open the terminal and install The Ops CLI using this command:

```
npm install -g @cto.ai/ops
```

- Once installed, you must sign in to your account. Use the command:

```
ops account:signin
```

**After signing in you're all set to start making and running Ops.**

5. Back in your CTO.ai dashboard, create your secret keys by selecting **Settings** and **Secrets**

![Screenshot 2022-02-09 at 13 16 24](https://user-images.githubusercontent.com/24816990/153199366-0550c6fb-d323-439d-bd5e-d99c055b18c7.png)

Secrets keys are encrypted environment variables that CTO.ai utilizes within your workflow to build and run your application and deployments.


**You will Create four secret keys:**

- AWS_ACCESS_KEY_ID 
- AWS_SECRET_ACCESS_KEY 
- AWS_ACCOUNT_NUMBER 
- GITHUB_TOKEN

- To create your AWS SECRET KEY AND ACCESS KEY. Log into your AWS Account, select the Identity and Access Management (IAM) dashboard, create a new user, copy the **Access Key ID** and **Secret access key** and paste it in your secret dashboard on CTO.ai.

![Screenshot 2022-02-09 at 13 20 03](https://user-images.githubusercontent.com/24816990/153200076-39dca835-be19-42d5-8d73-e58baddfeeae.png)

- Your AWS_ACCOUNT_NUMBER can be gotten from your User ID on the top right corner in your AWS Console. 


- Generate your GITHUB_TOKEN from Github by going to **Settings** → **Developer settings** → **Personal access tokens** → **Generate new token** on your Github profile.

![Screenshot 2022-02-09 at 13 25 50](https://user-images.githubusercontent.com/24816990/153200773-ed6683f3-0e8c-4dbb-a96a-aba18fcb6c79.png)


- Back in your CTO.ai **Secrets** dashboard attach your secrets keys and values. 

<img width="1244" alt="7" src="https://user-images.githubusercontent.com/24816990/152702777-d7304962-74a9-41ef-8c41-6f8e5a01eb5f.png">
