import { ux, sdk } from '@cto.ai/sdk';
import { exec } from 'child_process';

async function run() {

  const STACK_TYPE = process.env.STACK_TYPE || 'aws-ecs-fargate';

  await ux.print(`\n⚠️  Requested destroy of a ${STACK_TYPE} stack...`)

  const { STACK_ENV } = await ux.prompt<{
    STACK_ENV: string
  }>({
      type: 'input',
      name: 'STACK_ENV',
      default: 'dev',
      message: 'What environment do you want to destroy?'
    })

  const { STACK_REPO } = await ux.prompt<{
    STACK_REPO: string
  }>({
      type: 'input',
      name: 'STACK_REPO',
      default: 'sample-app',
      message: 'What is the name of the application repo you want to destroy?'
    })

  function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  console.log('')
  await ux.spinner.start(`🗑  Collecting resources...`)
  await delay(2000); // give user 2 seconds to think about it
  await ux.spinner.stop(`🗑  Collecting resources...    ✅`)
  console.log('')

  const { CONFIRM } = await ux.prompt<{
    CONFIRM: boolean
  }>({
      type: 'confirm',
      name: 'CONFIRM',
      default: false,
      message: `Are you sure that you want to destroy the ${STACK_ENV}`
    })

  if(!CONFIRM){
    await ux.print(`\n⚠️  Destroy was not confirmed. Exiting.\n`)
    process.exit(1)
  }

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

  console.log('')
  await ux.print(`🗑  Attempting to destroy the following stacks: ${ux.colors.white(STACKS[STACK_ENV].reverse().join(' '))}`)
  await ux.print(`📝 ${ux.colors.green('FYI:')} There may be stack resources that must be manually deleted (s3, ECR) or stack dependencies (ECS may have other running services).`)
  await ux.print(`👉 ${ux.colors.green('So...')} This may require you to go to the AWS Console to delete these resources and re-run this workflow once per service to fully destroy the stack.`)
  console.log('')

  const deploy = exec(`./node_modules/.bin/cdk destroy -f -e true ${STACKS[STACK_ENV].reverse().join(' ')}`, {
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
