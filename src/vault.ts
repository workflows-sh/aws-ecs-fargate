import fs from 'fs';
import util from 'util';
import { ux, sdk } from '@cto.ai/sdk';
import { exec as oexec } from 'child_process';
import { secretKeyPrompt, secretValuePrompt, stackEnvPrompt } from './prompts';
const pexec = util.promisify(oexec);

const ARGS = process.argv.slice(3);

async function init() {
  const STACK_TYPE = process.env.STACK_TYPE || 'aws-eks-ec2-asg';

  sdk.log(`🛠 Loading up ${STACK_TYPE} stack...`);

  const { STACK_ENV } = await stackEnvPrompt();

  try {
    const secrets = {};
    const KEY = `${STACK_ENV}_${STACK_TYPE}_SERVICE_VAULT_ARN`
      .replace(/-/g, '_')
      .toUpperCase();
    const vault = await pexec(
      `aws secretsmanager create-secret --name ${KEY} --description "The ${STACK_ENV} secret vault" --secret-string "${JSON.stringify(
        secrets
      )}" --region "${process.env.AWS_REGION}"`
    );
    sdk.setConfig(`${KEY}`, JSON.parse(vault.stdout).ARN);
    console.log(vault.stdout);
  } catch (e) {
    console.log('there was an error:', e);
  }
}

async function create() {
  const STACK_TYPE = process.env.STACK_TYPE || 'aws-eks-ec2-asg';

  sdk.log(`🛠 Loading up ${STACK_TYPE} stack...`);

  const { STACK_ENV } = await stackEnvPrompt();
  const { SECRET_KEY } = await secretKeyPrompt();
  const { SECRET_VALUE } = await secretValuePrompt();

  try {
    const KEY = `${STACK_ENV}_${STACK_TYPE}_SERVICE_VAULT_ARN`
      .replace(/-/g, '_')
      .toUpperCase();
    const { confirmation } = await ux.prompt<{
      confirmation: boolean;
    }>({
      type: 'confirm',
      name: 'confirmation',
      message: `Are you sure you want to set ${SECRET_KEY} to ${SECRET_VALUE} in the ${KEY}?`,
    });

    if (!confirmation) {
      return console.log('Exiting...');
    }

    const vault_id = await sdk.getConfig(KEY);
    const vault = await pexec(
      `aws secretsmanager get-secret-value --secret-id ${vault_id} --region "${process.env.AWS_REGION}"`
    );
    const data = JSON.parse(vault.stdout);
    const secrets = JSON.parse(data.SecretString);

    console.log(
      `🔐 Setting ${SECRET_KEY} to ${SECRET_VALUE} on the ${SECRET_KEY} with type ${typeof SECRET_VALUE}`
    );
    secrets[SECRET_KEY] = SECRET_VALUE.toString();

    const update = await pexec(
      `aws secretsmanager update-secret --secret-id ${vault_id} --description "The ${STACK_ENV} secret vault" --secret-string '${JSON.stringify(
        secrets
      )}' --region "${process.env.AWS_REGION}"`
    );
    console.log(update.stdout);
  } catch (e) {
    console.log('there was an error:', e);
  }
}

async function list() {
  const STACK_TYPE = process.env.STACK_TYPE || 'aws-eks-ec2-asg';

  sdk.log(`🛠 Loading up ${STACK_TYPE} stack...`);

  const { STACK_ENV } = await stackEnvPrompt();

  try {
    const KEY = `${STACK_ENV}_${STACK_TYPE}_SERVICE_VAULT_ARN`
      .replace(/-/g, '_')
      .toUpperCase();
    const vault_id = await sdk.getConfig(KEY);
    const vault = await pexec(
      `aws secretsmanager get-secret-value --secret-id ${vault_id} --region "${process.env.AWS_REGION}"`
    );

    const data = JSON.parse(vault.stdout);
    const secrets = JSON.parse(data.SecretString);

    console.log(`🔐 ${KEY} has the following secrets: \n`);

    for (let k in secrets) {
      console.log(`${k}: ${secrets[k]}`);
    }

    console.log('');
  } catch (e) {
    console.log('there was an error:');
    throw e;
  }
}

async function remove() {
  const STACK_TYPE = process.env.STACK_TYPE || 'aws-eks-ec2-asg';

  sdk.log(`🛠 Loading up ${STACK_TYPE} stack...`);

  const { STACK_ENV } = await stackEnvPrompt();
  const { SECRET_KEY } = await secretKeyPrompt();

  try {
    const { confirmation } = await ux.prompt<{
      confirmation: boolean;
    }>({
      type: 'confirm',
      name: 'confirmation',
      message: `Are you sure you want to remove ${SECRET_KEY} from the vault?`,
    });

    if (!confirmation) {
      return console.log('Exiting...');
    }

    const KEY = `${STACK_ENV}_${STACK_TYPE}_SERVICE_VAULT_ARN`
      .replace(/-/g, '_')
      .toUpperCase();
    const vault_id = await sdk.getConfig(KEY);
    const vault = await pexec(
      `aws secretsmanager get-secret-value --secret-id ${vault_id} --region "${process.env.AWS_REGION}"`
    );
    const data = JSON.parse(vault.stdout);
    const secrets = JSON.parse(data.SecretString);

    console.log(`🔐 deleting ${SECRET_KEY} from the ${KEY}`);
    delete secrets[SECRET_KEY];

    const update = await pexec(
      `aws secretsmanager update-secret --secret-id ${vault_id} --description "The ${STACK_ENV} secret vault" --secret-string '${JSON.stringify(
        secrets
      )}' --region "${process.env.AWS_REGION}"`
    );
    console.log(update.stdout);
  } catch (e) {
    console.log('there was an error:');
    throw e;
  }
}

async function destroy() {
  const STACK_TYPE = process.env.STACK_TYPE || 'aws-eks-ec2-asg';

  sdk.log(`🛠 Loading up ${STACK_TYPE} stack...`);

  const { STACK_ENV } = await stackEnvPrompt();

  try {
    const KEY = `${STACK_ENV}_${STACK_TYPE}_SERVICE_VAULT_ARN`
      .replace(/-/g, '_')
      .toUpperCase();
    const vault_id = await sdk.getConfig(KEY);

    const { confirmation } = await ux.prompt<{
      confirmation: boolean;
    }>({
      type: 'confirm',
      name: 'confirmation',
      message: 'Are you sure you want to delete the vault?',
    });

    if (!confirmation) {
      return console.log('Exiting...');
    }

    const vault = await pexec(
      `aws secretsmanager delete-secret --secret-id ${vault_id} --force-delete-without-recovery --region "${process.env.AWS_REGION}"`
    );
    const data = JSON.parse(vault.stdout);
    console.log(data);
  } catch (e) {
    console.log('there was an error:');
    throw e;
  }
}

switch (ARGS[0]) {
  case 'init':
    init();

    break;

  case 'set':
    create();

    break;

  case 'ls':
    list();

    break;

  case 'rm':
    remove();

    break;

  case 'destroy':
    destroy();

    break;
  case 'help':
  default:
    console.log('\n ⛔️ No sub command provided. See available subcommands:\n');
    console.log('ops run vault <cmd> [arguments]');
    console.log('');
    console.log('Available subcommands:');
    console.log('   ops run vault init');
    console.log('   ops run vault set');
    console.log('   ops run vault ls');
    console.log('   ops run vault rm');
    console.log('   ops run vault destroy');
    console.log('');
    break;
}
