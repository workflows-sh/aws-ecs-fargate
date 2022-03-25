import { sdk } from "@cto.ai/sdk";
import { exec } from "child_process";
import { stackEnvPrompt, stackRepoPrompt } from "./prompts";

async function run() {
  const STACK_TYPE = process.env.STACK_TYPE || "aws-ecs-fargate";

  sdk.log(`⚠️  Destroying ${STACK_TYPE} stack...`);

  const { STACK_ENV } = await stackEnvPrompt();
  const { STACK_REPO } = await stackRepoPrompt();

  const STACKS: any = {
    dev: [`${STACK_REPO}`, STACK_ENV, `${STACK_ENV}-${STACK_REPO}`],
    stg: [`${STACK_REPO}`, STACK_ENV, `${STACK_ENV}-${STACK_REPO}`],
    prd: [`${STACK_REPO}`, STACK_ENV, `${STACK_ENV}-${STACK_REPO}`],
    all: [
      `${STACK_REPO}`,
      "dev",
      "stg",
      "prd",
      `dev-${STACK_REPO}`,
      `stg-${STACK_REPO}`,
      `stg-${STACK_REPO}`,
    ],
  };

  if (!STACKS[STACK_ENV].length) {
    return console.log(
      "Please try again with environment set to <dev|stg|prd|all>"
    );
  }

  sdk.log(`📦 Setting up the stack`);
  const deploy = await exec(
    `./node_modules/.bin/cdk destroy -f -e true ${STACKS[
      STACK_ENV
    ].reverse().join(" ")}`,
    {
      env: {
        ...process.env,
        STACK_TYPE: STACK_TYPE,
        STACK_REPO: STACK_REPO,
        STACK_TAG: "main",
      },
    }
  );
  deploy.stdout.pipe(process.stdout);
  deploy.stderr.pipe(process.stderr);
}

run();
