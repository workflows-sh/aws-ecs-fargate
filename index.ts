import { Stack } from './src/stack/index';

const STACK_ENV = process.env.STACK_ENV || 'dev'
const STACK_TYPE = process.env.STACK_TYPE || 'aws-ecs-fargate'
const STACK_REPO = process.env.STACK_REPO || 'sample-app'
const STACK_TAG = process.env.STACK_TAG || 'main'

console.log(`Stack Details:`)
console.log(`env: ${STACK_ENV}`)
console.log(`type: ${STACK_TYPE}`)
console.log(`repo: ${STACK_REPO}`)
console.log(`tag: ${STACK_TAG}`)

new Stack({
  repo: STACK_REPO,
  tag: STACK_TAG,
  key: STACK_TYPE
});

