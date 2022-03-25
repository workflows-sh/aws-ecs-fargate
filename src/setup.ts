import fs from 'fs';
import util from 'util';
import { ux, sdk } from '@cto.ai/sdk';
import { exec as oexec } from 'child_process';
import { stackEnvPrompt, stackRepoPrompt, stackTagPrompt } from './prompts';
const pexec = util.promisify(oexec);

async function run() {
  const STACK_TYPE = process.env.STACK_TYPE || 'aws-ecs-fargate';
  const STACK_TEAM = process.env.OPS_TEAM_NAME || 'private';

  sdk.log(
    `🛠 Loading the ${ux.colors.white(
      STACK_TYPE
    )} stack for the ${ux.colors.white(STACK_TEAM)}...`
  );

  const { STACK_ENV } = await stackEnvPrompt();
  const { STACK_REPO } = await stackRepoPrompt();
  const { STACK_TAG } = await stackTagPrompt();

  const STACKS: any = {
    dev: [
      `${STACK_REPO}-${STACK_TYPE}`,
      `${STACK_ENV}-${STACK_TYPE}`,
      `${STACK_ENV}-${STACK_REPO}-${STACK_TYPE}`,
    ],
    stg: [
      `${STACK_REPO}-${STACK_TYPE}`,
      `${STACK_ENV}-${STACK_TYPE}`,
      `${STACK_ENV}-${STACK_REPO}-${STACK_TYPE}`,
    ],
    prd: [
      `${STACK_REPO}-${STACK_TYPE}`,
      `${STACK_ENV}-${STACK_TYPE}`,
      `${STACK_ENV}-${STACK_REPO}-${STACK_TYPE}`,
    ],
    all: [
      `${STACK_REPO}-${STACK_TYPE}`,

      `dev-${STACK_TYPE}`,
      `stg-${STACK_TYPE}`,
      `prd-${STACK_TYPE}`,

      `dev-${STACK_REPO}-${STACK_TYPE}`,
      `stg-${STACK_REPO}-${STACK_TYPE}`,
      `prd-${STACK_REPO}-${STACK_TYPE}`,
    ],
  };

  if (!STACKS[STACK_ENV].length) {
    return console.log(
      'Please try again with environment set to <dev|stg|prd|all>'
    );
  }

  sdk.log(
    `\n📦 Setting up the ${ux.colors.white(STACK_TYPE)} ${ux.colors.white(
      STACK_ENV
    )} stack for ${ux.colors.white(STACK_TEAM)} team...`
  );
  await exec(`./node_modules/.bin/cdk bootstrap`, { env: process.env });

  await exec(
    `./node_modules/.bin/cdk deploy ${STACKS[STACK_ENV].join(
      ' '
    )} --outputs-file outputs.json`,
    {
      env: {
        ...process.env,
        STACK_ENV: STACK_ENV,
        STACK_TYPE: STACK_TYPE,
        STACK_REPO: STACK_REPO,
        STACK_TAG: STACK_TAG,
      },
    }
  )
    // Get the AWS command to retrieve kube config
    .then(async () => {
      try {
        const json = await fs.readFileSync('./outputs.json', 'utf8');
        const outputs = JSON.parse(json);

        const STATE_KEY = `${STACK_ENV}-${STACK_TYPE}`;

        const STATE_CONFIG_KEY = `${STACK_ENV}_${STACK_TYPE}_STATE`
          .toUpperCase()
          .replace(/-/g, '_');
        sdk.setConfig(STATE_CONFIG_KEY, JSON.stringify(outputs));
      } catch (e) {
        throw e;
      }
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
}

// custom promisify exec that pipes stdout too
async function exec(cmd, env?: any | null) {
  return new Promise(function (resolve, reject) {
    const child = oexec(cmd, env);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on('close', (code) => {
      code ? reject(child.stderr) : resolve(child.stdout);
    });
  });
}

run();
