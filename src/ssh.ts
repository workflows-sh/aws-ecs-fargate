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

  sdk.log(`🚇 Tunneling to ${STACK_ENV}`)

    const bastion = execSync(
      `aws ec2 describe-instances --region=$AWS_REGION --filter "Name=tag:Name,Values=${STACK_ENV}-${STACK_TYPE}-bastion" --query "Reservations[].Instances[?State.Name == 'running'].InstanceId[]" --output text`, 
      {
        env: process.env
      }
    )

  console.log(bastion.toString())

  const tunnel = exec(`aws ssm start-session --target $BASTIONID --region $AWS_REGION`, {
    env: { 
      ...process.env, 
      STACK_ENV: STACK_ENV,
      BASTIONID: bastion
    }
  })
  tunnel.stdout.pipe(process.stdout)
  tunnel.stderr.pipe(process.stderr)
  process.stdin.pipe(tunnel.stdin)



}

run()
