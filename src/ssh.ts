import { sdk } from "@cto.ai/sdk";
import { exec, execSync } from "child_process";
import { stackEnvPrompt } from "./prompts";

async function run() {
  const STACK_TYPE = process.env.STACK_TYPE || "aws-ecs-fargate";

  sdk.log(`🛠 Loading up ${STACK_TYPE} stack...`);

  const { STACK_ENV } = await stackEnvPrompt();

  sdk.log(`🚇 Tunneling to ${STACK_ENV}`);

  const bastion = execSync(
    `aws ec2 describe-instances --region=us-east-1 --filter "Name=tag:Name,Values=${STACK_ENV}-bastion" --query "Reservations[].Instances[?State.Name == 'running'].InstanceId[]" --output text`,
    {
      env: process.env,
    }
  );

  console.log(bastion.toString());

  const tunnel = await exec(
    `aws ssm start-session --target $BASTIONID --region us-east-1`,
    {
      env: {
        ...process.env,
        STACK_ENV: STACK_ENV,
        BASTIONID: bastion,
      },
    }
  );
  tunnel.stdout.pipe(process.stdout);
  tunnel.stderr.pipe(process.stderr);
  process.stdin.pipe(tunnel.stdin);
}

run();
