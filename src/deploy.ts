import fs from 'fs'
import util from 'util';
import { ux, sdk } from '@cto.ai/sdk';
import { exec as oexec } from 'child_process';
const pexec = util.promisify(oexec);


async function run() {

  const STACK_TYPE = process.env.STACK_TYPE || 'aws-ecs-fargate';
  const STACK_TEAM = process.env.OPS_TEAM_NAME || 'private'

  await ux.print(`\n🛠 Loading the ${ux.colors.white(STACK_TYPE)} stack for the ${ux.colors.white(STACK_TEAM)}...\n`)

  const { STACK_ENV } = await ux.prompt<{
    STACK_ENV: string
  }>({
      type: 'input',
      name: 'STACK_ENV',
      default: 'dev',
      message: 'What is the name of the environment?'
    })

  const { STACK_REPO } = await ux.prompt<{
    STACK_REPO: string
  }>({
      type: 'input',
      name: 'STACK_REPO',
      default: 'sample-app',
      message: 'What is the name of the application repo?'
    })

  const { STACK_TAG } = await ux.prompt<{
    STACK_TAG: string
  }>({
      type: 'input',
      name: 'STACK_TAG',
      default: 'main',
      message: 'What is the name of the tag or branch?'
    })

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

  // await exec(`npx aws-cdk deploy ${STACKS[STACK_ENV].join(' ')} --outputs-file outputs.json`, {
  await exec(`npx aws-cdk diff ${STACKS[STACK_ENV].join(' ')}`, {
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

      // const json = await fs.readFileSync('./outputs.json', 'utf8')
      // const outputs = JSON.parse(json)

      const STATE_CONFIG_KEY = `${STACK_ENV}_${STACK_TYPE}_STATE`.toUpperCase().replace(/-/g,'_')
      // sdk.setConfig(STATE_CONFIG_KEY, JSON.stringify(outputs))

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
