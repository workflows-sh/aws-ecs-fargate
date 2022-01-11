import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as ecr from '@aws-cdk/aws-ecr'
import * as ecs from '@aws-cdk/aws-ecs'
import * as rds from '@aws-cdk/aws-rds';
import * as sm from "@aws-cdk/aws-secretsmanager";
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as sqs from '@aws-cdk/aws-sqs';
import * as elasticache from './redis'

import ecsPatterns = require('@aws-cdk/aws-ecs-patterns')

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
  public readonly db: rds.ServerlessCluster
  public readonly mq: sqs.Queue
  public readonly redis: any | undefined // todo @kc - fix this

  public URL: string

  constructor(scope: cdk.Construct, id: string, props?: StackProps) {
    super(scope, id)

    if(!props?.cluster) {
      throw new Error('You must provide a Cluster for Service')
    }
    if(!props?.registry) {
      throw new Error('You must provide a Registry for Service')
    }
    if(!props?.db) {
      throw new Error('You must provide a db for Service')
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
    this.repo = props?.repo ?? 'sample-app'
    this.tag = props?.tag ?? 'main'
    this.entropy = props?.entropy ?? '01012022'

    this.cluster = props.cluster
    this.registry = props.registry
    this.db = props.db
    this.redis = props.redis
    this.mq = props.mq
  }

  async initialize() {

    // S3
    const bucket = new s3.Bucket(this, `${this.repo}-${this.key}-bucket`, {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html"
    });

    // We can enable deployment from the local system using this
    // const src = new s3Deploy.BucketDeployment(this, `${this.repo}-${this.key}-deployment`, {
      // sources: [s3Deploy.Source.asset("./sample-app/dist")],
      // destinationBucket: bucket
    // });

    // Cloudfront
    const cf = new cloudfront.CloudFrontWebDistribution(this, `${this.repo}-${this.key}-cloudfront`, {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket
          },
          behaviors: [{isDefaultBehavior: true}]
        },
      ]
    });

    const db_secrets = sm.Secret.fromSecretAttributes(this, `${this.repo}-${this.key}-db-secrets`, {
      secretArn: this.db?.secret?.secretArn
    });

    const VAULT_KEY = `${this.env}_${this.key}_VAULT_ARN`.replace(/-/g,'_').toUpperCase()
    console.log(process.env[VAULT_KEY])

    const vault_secrets = sm.Secret.fromSecretAttributes(this, `${this.repo}-${this.key}-env-secrets`, {
      secretArn: process.env[VAULT_KEY]
    });

    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `${this.repo}-${this.key}`, {
      cluster: this.cluster,
      desiredCount: 1,
      serviceName: `${this.repo}`,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(this.registry, this.tag),
        containerPort: 3000,
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: `${this.repo}-${this.key}`}),
        environment: {
          DB_HOST: db_secrets.secretValueFromJson('host').toString(),
          DB_PORT: db_secrets.secretValueFromJson('port').toString(),
          DB_USER: db_secrets.secretValueFromJson('username').toString(),
          DB_PASS: db_secrets.secretValueFromJson('password').toString(),
          REDIS_HOST: this.redis?.cluster?.attrRedisEndpointAddress,
          REDIS_PORT: this.redis?.cluster?.attrRedisEndpointPort,
          SQS_URL: this.mq?.queueUrl,
          SQS_NAME: this.mq?.queueName,
          CF_DOMAIN: cf.distributionDomainName
        }
      }
    })
    fargateService.service.connections.allowToDefaultPort(this.db, 'MySQL access')
    fargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '10')

    // Setup AutoScaling policy
    const scaling = fargateService.service.autoScaleTaskCount({ maxCapacity: 2 })
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });



    this.URL = fargateService.loadBalancer.loadBalancerDnsName; 
    new cdk.CfnOutput(this, 'ServiceURL', { value: this.URL });

  }
}

