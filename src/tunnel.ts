import { ux, sdk } from '@cto.ai/sdk';
import { exec, execSync } from 'child_process';

async function run() {

  const STACK_TYPE = process.env.STACK_TYPE || 'aws-ecs-fargate';

  sdk.log(`🛠 Loading up ${STACK_TYPE} stack...`)

  const { STACK_ENV } = await ux.prompt<{
    STACK_ENV: string
  }>({
      type: 'input',
      name: 'STACK_ENV',
      default: 'dev',
      message: 'What environment do you want to tunnel to?'
    })

  const { TARGET } = await ux.prompt<{
    TARGET: string
  }>({
      type: 'input',
      name: 'TARGET',
      default: 'localhost',
      message: 'What private host do you want to tunnel to?'
    })


  const { PORT } = await ux.prompt<{
    PORT: string
  }>({
      type: 'input',
      name: 'PORT',
      default: '3306',
      message: 'What private port do you want to tunnel to?'
    })


  const bastion = execSync(
    `aws ec2 describe-instances --region=$AWS_REGION --filter "Name=tag:Name,Values=${STACK_ENV}-${STACK_TYPE}-bastion" --query "Reservations[].Instances[?State.Name == 'running'].InstanceId[]" --output text`, 
    {
      env: process.env
    }
  ).toString().trim()

  sdk.log(`🎣 Fetching bastion for ${STACK_ENV}-${STACK_TYPE}:${bastion}`)
  const socat = execSync(
    `aws ssm send-command --region=$AWS_REGION --document-name "AWS-RunShellScript" --parameters 'commands=["socat TCP-LISTEN:${PORT},reuseaddr,fork TCP4:${TARGET}"]' --comment "starting vpc private tunnel" --targets "Key=instanceids,Values=${bastion}"`, 
    {
      env: process.env
    }
  )

  console.log(`🚇 Opening session for ${STACK_ENV}:${bastion} ...`)
  const tunnel = exec(`aws ssm start-session --region=$AWS_REGION --target "${bastion}" --document-name "AWS-StartPortForwardingSession" --parameters '{"portNumber":["${PORT}"], "localPortNumber":["${PORT}"]}'`, {
    env: process.env
  })

  // tunnel.stdout.pipe(process.stdout)
  // tunnel.stderr.pipe(process.stderr)
  // process.stdin.pipe(tunnel.stdin)
  
  await sleep()

  console.log('Welcome to MySQL, please type your SQL below...')
  const mysql = await exec(`mysql --protocol tcp --port 3306 --host=127.0.0.1 -u root -p dev`, {
    env: process.env
  })
  mysql.stdout.pipe(process.stdout)
  mysql.stderr.pipe(process.stderr)
  process.stdin.pipe(mysql.stdin)

}

function sleep() {
  return new Promise(resolve => setTimeout(resolve, 10000));
}

run()
