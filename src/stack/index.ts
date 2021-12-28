import * as cdk from '@aws-cdk/core';
import Cluster from './cluster'
import Service from './service'
import Registry from './registry'
//import RDS from '../stacks/rds'
import * as rds from '@aws-cdk/aws-rds';

interface StackProps {
  repo: string,
  tag: string,
  key: string
}

export class Stack{
  constructor(props?: StackProps) {

    const repo = props?.repo ?? 'sample-app'
    const tag = props?.tag ?? 'main'
    const key = props?.key ?? 'ecs'

    // setup app
    const app = new cdk.App();

    // create a shared ECR Registry
    const registry = new Registry(app, `${repo}`, {
      repo: repo
    })

    // create each vpc, cluster & db
    const dev = new Cluster(app, `dev-${key}`, {
      repo: repo,
      tag: tag
    }); 
    const stg = new Cluster(app, `stg-${key}`, {
      repo: repo,
      tag: tag
    }); 
    const prd = new Cluster(app, `prd-${key}`, {
      repo: repo,
      tag: tag
    }); 

    // instantiate a service in dev cluster
    const devService = new Service(app, `dev-${repo}-${key}`, {
      repo: repo,
      tag: tag,
      db: dev.db,
      cluster: dev.cluster,
      redis: dev.redis,
      mq: dev.mq,
      registry: registry.repo,
    })

    // instantiate a service in stg cluster
    const stgService = new Service(app, `stg-${repo}-${key}`, {
      repo: repo,
      tag: tag,
      db: stg.db,
      cluster: stg.cluster,
      redis: stg.redis,
      mq: stg.mq,
      registry: registry.repo
    })

    // instantiate a service in prd cluster
    const prdService = new Service(app, `prd-${repo}-${key}`,{
      repo: repo,
      tag: tag,
      db: prd.db,
      cluster: prd.cluster,
      redis: prd.redis,
      mq: prd.mq,
      registry: registry.repo
    })

  }
}

export default Stack
