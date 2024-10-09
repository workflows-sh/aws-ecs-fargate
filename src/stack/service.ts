import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as rds from 'aws-cdk-lib/aws-rds';
import * as sm from "aws-cdk-lib/aws-secretsmanager";
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { Construct } from 'constructs';

import ecsPatterns = require('aws-cdk-lib/aws-ecs-patterns')

import util from 'util';
import { exec as oexec } from 'child_process';
const pexec = util.promisify(oexec);

interface StackProps {
  org: string
  env: string
  repo: string
  tag: string
  key: string
  entropy: string

  cluster: ecs.Cluster | undefined
  registry: ecr.Repository | undefined
  redis: any | undefined // todo @kc - fix this
  db: rds.ServerlessCluster | undefined
  mq: sqs.Queue | undefined
 }

export default class Service extends cdk.Stack {

  public readonly id: string
  public readonly org: string
  public readonly env: string
  public readonly repo: string
  public readonly tag: string
  public readonly key: string
  public readonly entropy: string

  public readonly vpc: ec2.Vpc
  public readonly cluster: ecs.Cluster
  public readonly registry: ecr.Repository
  public readonly db: rds.ServerlessCluster | undefined
  public readonly mq: sqs.Queue
  public readonly redis: any | undefined

  public URL: string

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id)

    if(!props?.cluster) {
      throw new Error('You must provide a Cluster for Service')
    }
    if(!props?.registry) {
      throw new Error('You must provide a Registry for Service')
    }
    if(!props?.db) {
      console.log('WARN: There is no DB for Service')
    }
    if(!props?.redis) {
      throw new Error('You must provide a redis for Service')
    }
    if(!props?.mq) {
      throw new Error('You must provide a mq for Service')
    }

    this.id = id
    this.org = props?.org ?? 'cto-ai'
    this.env = props?.env ?? 'dev'
    this.key = props?.key ?? 'aws-ecs-fargate'
    this.repo = props?.repo ?? 'sample-expressjs-aws-ecs-fargate'
    this.tag = props?.tag ?? 'main'
    this.entropy = props?.entropy ?? '01012022'

    this.cluster = props.cluster
    this.registry = props.registry
    this.db = props.db
    this.redis = props.redis
    this.mq = props.mq
  }

  async initialize() {
    let serviceSecrets = {}
    let dbSecrets = {}

    const SERVICE_VAULT_KEY = `${this.env}_${this.key}_SERVICE_VAULT_ARN`.replace(/-/g,'_').toUpperCase()
    if(process.env[SERVICE_VAULT_KEY]) {
      const service_vault = await pexec(`aws secretsmanager get-secret-value --secret-id ${process.env[SERVICE_VAULT_KEY]} --region "${process.env.AWS_REGION}"`)
      const service_data = JSON.parse(service_vault.stdout)
      serviceSecrets = JSON.parse(service_data.SecretString)
    }

    if (this.db) {
      const dbVault = sm.Secret.fromSecretAttributes(this, `${this.repo}-${this.key}-db-secrets`, {
        secretArn: this.db?.secret?.secretArn
      } as sm.SecretAttributes)

      dbSecrets = {
        DB_HOST: dbVault.secretValueFromJson('host').toString(),
        DB_PORT: dbVault.secretValueFromJson('port').toString(),
        DB_USER: dbVault.secretValueFromJson('username').toString(),
        DB_PASS: dbVault.secretValueFromJson('password').toString(),
      }
    }

    const environment = Object.assign({
      REDIS_HOST: this.redis?.cluster?.attrRedisEndpointAddress,
      REDIS_PORT: this.redis?.cluster?.attrRedisEndpointPort,
      MQ_URL: this.mq?.queueUrl,
      MQ_NAME: this.mq?.queueName,
    }, { ...dbSecrets, ...serviceSecrets })

    // get env vars that can be used to update container runtime task definition
    const PORT = serviceSecrets['PORT'] ? parseInt(serviceSecrets['PORT']) : 3000

    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `${this.repo}-${this.key}`, {
      cluster: this.cluster,
      desiredCount: 1,
      serviceName: `${this.repo}`,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(this.registry, this.tag),
        containerPort: PORT,
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: `${this.repo}-${this.key}`}),
        environment: environment
      }
    })
    fargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '10')

    if (this.db) {
      fargateService.service.connections.allowToDefaultPort(this.db, 'MySQL access')
    }

    // Setup AutoScaling policy
    const scaling = fargateService.service.autoScaleTaskCount({ maxCapacity: 2 })
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    })
    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    })

    scaling.scaleOnSchedule('DaytimeScaleDown', {
      schedule: autoscaling.Schedule.expression('cron(0 23 ? * MON-FRI *)'),
      minCapacity: 1,
    })

    scaling.scaleOnSchedule('DaytimeScaleUp', {
      schedule: autoscaling.Schedule.expression('cron(0 8 ? * MON-FRI *)'),
      minCapacity: 1,
    })

    this.URL = fargateService.loadBalancer.loadBalancerDnsName
    new cdk.CfnOutput(this, `${this.repo}LoadBalancer`, { value: this.URL });

  }
}

