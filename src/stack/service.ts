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
  repo: string,
  tag: string,
  cluster: ecs.Cluster | undefined
  registry: ecr.Repository | undefined
  redis: any | undefined // todo @kc - fix this
  db: rds.ServerlessCluster | undefined
  mq: sqs.Queue | undefined
 }

export default class Service extends cdk.Stack {
  public readonly URL: string
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

    const repo = props?.repo ?? 'sample-app'
    const tag = props?.tag ?? 'main'

    // S3
    const bucket = new s3.Bucket(this, `${id}-bucket`, {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html"
    });

    // We can enable deployment from the local system using this
    const src = new s3Deploy.BucketDeployment(this, `${id}-deployment`, {
      sources: [s3Deploy.Source.asset("./sample-app/dist")],
      destinationBucket: bucket
    });

    // Cloudfront
    const cf = new cloudfront.CloudFrontWebDistribution(this, `${id}-cloudfront`, {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket
          },
          behaviors: [{isDefaultBehavior: true}]
        },
      ]
    });

    const db_secrets = sm.Secret.fromSecretAttributes(this, 'host', {
      secretArn: props?.db?.secret?.secretArn
    });

    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `${id}`, {
      cluster: props?.cluster,
      desiredCount: 1,
      serviceName: `${id}`,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(props?.registry, tag),
        containerPort: 80,
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({ streamPrefix: `${id}`}),
        environment: {
          DB_HOST: db_secrets.secretValueFromJson('host').toString(),
          DB_PORT: db_secrets.secretValueFromJson('port').toString(),
          DB_USER: db_secrets.secretValueFromJson('username').toString(),
          DB_PASS: db_secrets.secretValueFromJson('password').toString(),
          REDIS_HOST: props?.redis?.cluster?.attrRedisEndpointAddress,
          REDIS_PORT: props?.redis?.cluster?.attrRedisEndpointPort,
          SQS_URL: props?.mq?.queueUrl,
          SQS_NAME: props?.mq?.queueName,
          CF_DOMAIN: cf.distributionDomainName
        }
      }
    });
    fargateService.service.connections.allowToDefaultPort(props?.db, 'MySQL access')
    fargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '10');

    // Setup AutoScaling policy
    const scaling = fargateService.service.autoScaleTaskCount({ maxCapacity: 2 });
    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60)
    });



    this.URL = fargateService.loadBalancer.loadBalancerDnsName; 
    new cdk.CfnOutput(this, 'ServiceURL', { value: this.URL });

  }
}

