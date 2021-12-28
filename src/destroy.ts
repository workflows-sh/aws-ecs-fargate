import { ux, sdk } from '@cto.ai/sdk';
import { exec } from 'child_process';

async function run() {

  const STACK_TYPE = process.env.STACK_TYPE || 'aws-ecs-fargate';

  sdk.log(`⚠️  Destroying ${STACK_TYPE} stack...`)

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

  const STACKS:any = {
    'dev': [`${STACK_REPO}`, STACK_ENV, `${STACK_ENV}-${STACK_REPO}`],
    'stg': [`${STACK_REPO}`, STACK_ENV, `${STACK_ENV}-${STACK_REPO}`],
    'prd': [`${STACK_REPO}`, STACK_ENV, `${STACK_ENV}-${STACK_REPO}`],
    'all': [
      `${STACK_REPO}`,
      'dev', 'stg', 'prd',
      `dev-${STACK_REPO}`,
      `stg-${STACK_REPO}`,
      `stg-${STACK_REPO}`
    ]
  }

  if(!STACKS[STACK_ENV].length) {
    return console.log('Please try again with environment set to <dev|stg|prd|all>')
  }

  sdk.log(`📦 Setting up the stack`)
  /*const synth =*/ await exec(`npm run cdk synth`, {
    env: { 
      ...process.env, 
      STACK_TYPE: STACK_TYPE, 
      STACK_REPO: STACK_REPO,
      STACK_TAG: 'main'
    }
  })
  // synth.stdout.pipe(process.stdout)
  // synth.stderr.pipe(process.stdout)

  const deploy = await exec(`./node_mdoules/.bin/cdk destroy -f -e true ${STACKS[STACK_ENV].join(' ')}`, {
    env: { 
      ...process.env, 
      STACK_TYPE: STACK_TYPE, 
      STACK_REPO: STACK_REPO, 
      STACK_TAG: 'main'
    }
  })
  deploy.stdout.pipe(process.stdout)
  deploy.stderr.pipe(process.stderr)

}

run()
