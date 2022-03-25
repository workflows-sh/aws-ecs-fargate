import { ux, sdk } from '@cto.ai/sdk';
import { exec, execSync } from 'child_process';
import { stackEnvPrompt } from './prompts';

async function run() {
  const STACK_TYPE = process.env.STACK_TYPE || 'aws-ecs-fargate';

  sdk.log(`🛠 Loading up ${STACK_TYPE} stack...`);

  const { STACK_ENV } = await stackEnvPrompt();

  const bastion = execSync(
    `aws ec2 describe-instances --region=us-east-1 --filter "Name=tag:Name,Values=${STACK_ENV}-bastion" --query "Reservations[].Instances[?State.Name == 'running'].InstanceId[]" --output text`,
    {
      env: process.env,
    }
  )
    .toString()
    .trim();

  sdk.log(`🎣 Fetching bastion for ${STACK_ENV}:${bastion}`);
  const socat = execSync(
    `aws ssm send-command --region=us-east-1 --document-name "AWS-RunShellScript" --parameters 'commands=["socat TCP-LISTEN:3306,reuseaddr,fork TCP4:dev-devdbf57f5a1f-lcw1j73nuszw.cluster-cu1dsju6k2ca.us-east-1.rds.amazonaws.com:3306"]' --comment "starting vpc private tunnel" --targets "Key=instanceids,Values=${bastion}"`,
    {
      env: process.env,
    }
  );

  console.log(`🚇 Opening session for ${STACK_ENV}:${bastion} ...`);
  const tunnel = exec(
    `aws ssm start-session --region=us-east-1 --target "${bastion}" --document-name "AWS-StartPortForwardingSession" --parameters '{"portNumber":["3306"], "localPortNumber":["3306"]}'`,
    {
      env: process.env,
    }
  );

  // tunnel.stdout.pipe(process.stdout)
  // tunnel.stderr.pipe(process.stderr)
  // process.stdin.pipe(tunnel.stdin)

  await sleep();

  console.log('Welcome to MySQL, please type your SQL below...');
  const mysql = await exec(
    `mysql --protocol tcp --port 3306 --host=127.0.0.1 -u root -pVk4gwG.I=R.IHYStxpQPLg,wB.scV9 dev`,
    {
      env: process.env,
    }
  );
  mysql.stdout.pipe(process.stdout);
  mysql.stderr.pipe(process.stderr);
  process.stdin.pipe(mysql.stdin);
}

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 10000));
}

run();
