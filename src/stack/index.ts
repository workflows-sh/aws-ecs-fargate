import * as cdk from '@aws-cdk/core';
import Cluster from './cluster'
import Service from './service'
import Registry from './registry'
import * as rds from '@aws-cdk/aws-rds';

interface StackProps {
  org: string
  env: string
  repo: string
  tag: string
  key: string
  entropy: string
}

export class Stack{

  public readonly org: string
  public readonly env: string
  public readonly repo: string
  public readonly tag: string
  public readonly key: string
  public readonly entropy: string

  constructor(props?: StackProps) {
    this.org = props?.org ?? 'schier'
    this.env = props?.env ?? 'dev'
    this.key = props?.key ?? 'aws-ecs-fargate'
    this.repo = props?.repo ?? 'sample-app'
    this.tag = props?.tag ?? 'main'
    this.entropy = props?.entropy ?? '01012022'
  }
  async initialize() {
    // setup app
    const app = new cdk.App();

    // create a shared ECR Registry
    const registry = new Registry(app, `${this.repo}-${this.key}`, {
      org: this.org,
      env: this.env,
      key: this.key,
      repo: this.repo,
      tag: this.tag,
      entropy: this.entropy
    })

    // create each vpc, cluster & db
    const dev = new Cluster(app, `dev-${this.key}`, {
      org: this.org,
      env: this.env,
      key: this.key,
      repo: this.repo,
      tag: this.tag,
      entropy: this.entropy
    }); 
    const stg = new Cluster(app, `stg-${this.key}`, {
      org: this.org,
      env: this.env,
      key: this.key,
      repo: this.repo,
      tag: this.tag,
      entropy: this.entropy
    }); 
    const prd = new Cluster(app, `prd-${this.key}`, {
      org: this.org,
      env: this.env,
      key: this.key,
      repo: this.repo,
      tag: this.tag,
      entropy: this.entropy
    }); 
    // instantiate a service in dev cluster
    const devService = new Service(app, `dev-${this.repo}-${this.key}`, {
      org: this.org,
      env: this.env,
      key: this.key,
      repo: this.repo,
      tag: this.tag,
      entropy: this.entropy,
      db: dev.db,
      cluster: dev.cluster,
      redis: dev.redis,
      mq: dev.mq,
      registry: registry.repository
    })
    await devService.initialize()
    // instantiate a service in stg cluster
    const stgService = new Service(app, `stg-${this.repo}-${this.key}`, {
      org: this.org,
      env: this.env,
      key: this.key,
      repo: this.repo,
      tag: this.tag,
      entropy: this.entropy,
      db: stg.db,
      cluster: stg.cluster,
      redis: stg.redis,
      mq: stg.mq,
      registry: registry.repository
    })
    await stgService.initialize()
    // instantiate a service in prd cluster
    const prdService = new Service(app, `prd-${this.repo}-${this.key}`,{
      org: this.org,
      env: this.env,
      key: this.key,
      repo: this.repo,
      tag: this.tag,
      entropy: this.entropy,
      db: prd.db,
      cluster: prd.cluster,
      redis: prd.redis,
      mq: prd.mq,
      registry: registry.repository
    })
    await prdService.initialize()

    app.synth()

  }
}

export default Stack
