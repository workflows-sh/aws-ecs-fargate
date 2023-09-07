import fs from 'fs'
import { ux, sdk } from '@cto.ai/sdk';
import { exec as oexec, execSync } from 'child_process';
import { stackEnvPrompt, stackRepoPrompt, stackTagPrompt } from './prompts';

async function run() {

  const STACK_TYPE = process.env.STACK_TYPE || 'aws-ecs-fargate';
  const STACK_TEAM = process.env.OPS_TEAM_NAME || 'private'

  const { STACK_ENV } = await stackEnvPrompt()
  const { STACK_REPO } = await stackRepoPrompt()

  const ecrRepoName: string = `${STACK_REPO}-${STACK_TYPE}`

  // Validate if the AWS Creds are set.
  try {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (accessKeyId && secretAccessKey) {
      console.log('AWS credentials are set.');
      // Proceed with the rest of the deployment logic
    } else {
      console.log('AWS credentials are not set.');
      return;
    }
  } catch (error) {
    console.error('Invalid credentials:', error);
    return;
  }

  await ux.print(`\n🛠 Loading the latest tags for ${ux.colors.green(STACK_TYPE)} environment and ${ux.colors.green(STACK_REPO)} service...`)

  async function retrieveCurrentlyDeployedImage(env: string, service: string): Promise<string> {
    let ecsClusters: string[] = [];

    try {
      const commandOutput: Buffer = execSync(
        `aws ecs list-clusters --query "clusterArns[*]" --region $AWS_REGION`,
        {
          env: process.env
        }
      );
      
      ecsClusters = JSON.parse(commandOutput.toString()) || [];
    } catch (error) {
      console.error("An error occurred while retrieving ECS clusters:", error);
    }
    
    let ecsCluster: string = ""

    ecsClusters.forEach((clusterName: string) => {
      const re = new RegExp(`cluster\/${env}`)
      if (re.test(clusterName)) {
        ecsCluster = clusterName
      }
    })

    if (ecsCluster) {
      const ecsTasks: string[] = JSON.parse(execSync(
        `aws ecs list-tasks --cluster ${ecsCluster} --service-name ${service} --query "taskArns" --region $AWS_REGION`,
        {
          env: process.env
        }
      ).toString()) || [];
    
      for (const ecsTask of ecsTasks) {
        try {
          const image: string = execSync(
            `aws ecs describe-tasks --region $AWS_REGION --query=tasks[0].containers[0].image --cluster ${ecsCluster} --tasks ${ecsTask}`,
            {
              env: process.env
            }
          ).toString().trim();
    
          if (image) {
            return image.replace(/.+:/, "").replace(/"/, "");
          }
        } catch (error) {
          console.error("An error occurred while retrieving the image:", error);
        }
      }
    }
    
    return ""
  }

  const ecrImages: string[] = JSON.parse(execSync(
    `aws ecr describe-images --region=$AWS_REGION --repository-name ${ecrRepoName} --query "reverse(sort_by(imageDetails,& imagePushedAt))[*].imageTags[0]"`,
    {
      env: process.env
    }
  ).toString().trim()) || []

  const currentImage = await retrieveCurrentlyDeployedImage(STACK_ENV, STACK_REPO)
  await ux.print(`\n🖼️  Currently deployed image - ${ux.colors.green(currentImage)}\n`)

  const defaultImage = ecrImages.length ? ecrImages[0] : undefined
  const imageTagLimit = 20
  let { STACK_TAG }: any = ''
  
  const { STACK_TAG_CUSTOM } = await ux.prompt<{
    STACK_TAG_CUSTOM: boolean
  }>({
    type: 'confirm',
    name: 'STACK_TAG_CUSTOM',
    default: false,
    message: 'Do you want to deploy a custom image?'
  });

  if (STACK_TAG_CUSTOM){
    ({ STACK_TAG } = await ux.prompt<{
      STACK_TAG: string
    }>({
      type: 'input',
      name: 'STACK_TAG',
      message: 'What is the name of the tag or branch?',
      allowEmpty: false
    }))
  } else {
    ({ STACK_TAG } = await stackTagPrompt(
      ecrImages.slice(0, ecrImages.length < imageTagLimit ? ecrImages.length : imageTagLimit), 
      currentImage || defaultImage
    ))
  }
  await ux.print(`\n🛠 Loading the ${ux.colors.white(STACK_TYPE)} stack for the ${ux.colors.white(STACK_TEAM)}...\n`)

  const STACKS:any = {
    'dev': [`${STACK_REPO}-${STACK_TYPE}`, `${STACK_ENV}-${STACK_TYPE}`, `${STACK_ENV}-${STACK_REPO}-${STACK_TYPE}`],
    'stg': [`${STACK_REPO}-${STACK_TYPE}`, `${STACK_ENV}-${STACK_TYPE}`, `${STACK_ENV}-${STACK_REPO}-${STACK_TYPE}`],
    'prd': [`${STACK_REPO}-${STACK_TYPE}`, `${STACK_ENV}-${STACK_TYPE}`, `${STACK_ENV}-${STACK_REPO}-${STACK_TYPE}`],
    'all': [
      `${STACK_REPO}-${STACK_TYPE}`,

      `dev-${STACK_TYPE}`,
      `stg-${STACK_TYPE}`,
      `prd-${STACK_TYPE}`,

      `dev-${STACK_REPO}-${STACK_TYPE}`,
      `stg-${STACK_REPO}-${STACK_TYPE}`,
      `prd-${STACK_REPO}-${STACK_TYPE}`
    ]
  }

  if(!STACKS[STACK_ENV].length) {
    return console.log('Please try again with environment set to <dev|stg|prd|all>')
  }

  await ux.print(`📦 Deploying ${ux.colors.white(STACK_REPO)}:${ux.colors.white(STACK_TAG)} to ${ux.colors.green(STACK_ENV)} cluster`)
  console.log('\n')

  await exec(`./node_modules/.bin/cdk deploy ${STACKS[STACK_ENV].join(' ')} --outputs-file outputs.json`, {
    env: {
      ...process.env,
      STACK_ENV: STACK_ENV,
      STACK_TYPE: STACK_TYPE,
      STACK_REPO: STACK_REPO,
      STACK_TAG: STACK_TAG
    }
  })
  // Get the AWS command to retrieve kube config
  .then(async () => {

    try {

      const json = await fs.readFileSync('./outputs.json', 'utf8')
      const outputs = JSON.parse(json)

      const STATE_CONFIG_KEY = `${STACK_ENV}_${STACK_TYPE}_STATE`.toUpperCase().replace(/-/g,'_')
      sdk.setConfig(STATE_CONFIG_KEY, JSON.stringify(outputs))

      sdk.track([], {
        event_name: 'deployment',
        event_action: 'succeeded',
        environment: STACK_ENV,
        repo: STACK_REPO,
        branch: STACK_TAG,
        commit: STACK_TAG,
        image: `${STACK_REPO}:${STACK_TAG}`
      })

    } catch (e) {
      console.log('There was an error updating workflow state', e)
      sdk.track([], {
        event_name: 'deployment',
        event_action: 'failed',
        environment: STACK_ENV,
        repo: STACK_REPO,
        branch: STACK_TAG,
        commit: STACK_TAG,
        image: `${STACK_REPO}:${STACK_TAG}`
      })
      process.exit(1)
    }

  })
  .catch((err) => {
    console.log('There was an error deploying the infrastructure.')
    sdk.track([], {
      event_name: 'deployment',
      event_action: 'failed',
      environment: STACK_ENV,
      repo: STACK_REPO,
      branch: STACK_TAG,
      commit: STACK_TAG,
      image: `${STACK_REPO}:${STACK_TAG}`
    })
    process.exit(1)
  })
  
}

// custom promisify exec that pipes stdout too
async function exec(cmd, env?: any | null) {
  return new Promise(function(resolve, reject) {
    const child = oexec(cmd, env)
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    child.on('close', (code) => { code ? reject(child.stderr) : resolve(child.stdout) })
  })
}

run()