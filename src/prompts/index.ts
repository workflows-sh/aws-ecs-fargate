import { ux } from "@cto.ai/sdk";

export function stackEnvPrompt() {
  return ux.prompt<{
    STACK_ENV: string;
  }>({
    type: "list",
    name: "STACK_ENV",
    choices: ["dev", "stg", "prd"],
    default: "dev",
    message: "What is the name of the environment?",
  });
}

export function stackRepoPrompt() {
  return ux.prompt<{
    STACK_REPO: string;
  }>({
    type: "list",
    name: "STACK_REPO",
    choices: ["dailyhive-react", "dailyhive-express", "dailyhive-wordpress"],
    default: "dailyhive-react",
    message: "What is the name of the application repo?",
  });
}

export function stackTagPrompt() {
  return ux.prompt<{
    STACK_TAG: string;
  }>({
    type: "input",
    name: "STACK_TAG",
    default: "main",
    message: "What is the name of the tag or branch?",
    allowEmpty: false,
  });
}

export function secretValuePrompt() {
  return ux.prompt<{
    SECRET_VALUE: string;
  }>({
    type: "input",
    name: "SECRET_VALUE",
    message: "What is the value for the secret?",
    allowEmpty: false,
  });
}

export function secretKeyPrompt() {
  return ux.prompt<{
    SECRET_KEY: string;
  }>({
    type: "input",
    name: "SECRET_KEY",
    message: "What is the key for the secret?",
    allowEmpty: false,
  });
}
