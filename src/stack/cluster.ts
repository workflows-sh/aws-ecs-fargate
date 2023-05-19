import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as elasticache from './redis'
import { Construct } from 'constructs';

interface StackProps {
  org: string
  env: string
  repo: string
  tag: string
  key: string
  entropy: string
}

export default class Cluster extends cdk.Stack {

  public readonly id: string
  public readonly org: string
  public readonly env: string
  public readonly repo: string
  public readonly tag: string
  public readonly key: string
  public readonly entropy: string

  public readonly vpc: ec2.Vpc
  public readonly cluster: ecs.Cluster
  public readonly db: rds.ServerlessCluster
  public readonly mq: sqs.Queue
  public readonly redis: Construct
  public readonly bastion: ec2.BastionHostLinux

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id)
    this.id = id
    this.org = props?.org ?? 'cto-ai'
    this.env = props?.env ?? 'dev'
    this.key = props?.key ?? 'aws-ecs-fargate'
    this.repo = props?.repo ?? 'sample-expressjs-aws-ecs-fargate'
    this.tag = props?.tag ?? 'main'
    this.entropy = props?.entropy ?? '01012022'

    // todo @kc make AZ a StackProp
    const vpc = new ec2.Vpc(this, `${this.id}-vpc`, { 
      cidr: '10.0.0.0/16',
      natGateways: 1,
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        }
      ],
    }); 

    const bastionSecurityGroup = new ec2.SecurityGroup(this, `${this.id}-bastion-sg`, {
      vpc: vpc,
      allowAllOutbound: true,
      description: `bastion security group for ${this.id} cluster`,
      securityGroupName: `${this.id}-bastion-sg`
    });
    bastionSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH access');

    const bastion = new ec2.BastionHostLinux(this, `${this.id}-bastion`, {
      vpc: vpc,
      instanceName: `${this.id}-bastion`,
      securityGroup: bastionSecurityGroup,
      subnetSelection: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    });

    const cluster = new ecs.Cluster(this, `${this.id}-ecs`, { 
      vpc: vpc,
      containerInsights: true
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, `${this.id}-db-sg`, {
      vpc: vpc,
      allowAllOutbound: true,
      description: `db security group for ${this.id} db`,
      securityGroupName: `${this.id}-db-sg`
    });
    dbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306), 'MySQL access');

    const db = new rds.ServerlessCluster(this, `${this.id}-db`, {
      vpc: vpc,
      defaultDatabaseName: `${this.env}`,
      engine: rds.DatabaseClusterEngine.AURORA_MYSQL,
      scaling: { autoPause: cdk.Duration.seconds(0) },
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromGeneratedSecret('root')
    });

    const redis = new elasticache.Cluster(this, `${this.id}-redis`, { vpc: vpc });
    const mq = new sqs.Queue(this, `${this.id}-sqs`);

    this.vpc = vpc;
    this.cluster = cluster;
    this.bastion = bastion;
    this.redis = redis;
    this.db = db;
    this.mq = mq;

    new cdk.CfnOutput(this, `${this.id}VpcId`, { value: this.vpc.vpcId})
    new cdk.CfnOutput(this, `${this.id}ClusterArn`, { value: this.cluster.clusterArn})
    new cdk.CfnOutput(this, `${this.id}ClusterVaultArn`, { value: this.db?.secret?.secretArn || '' })
    new cdk.CfnOutput(this, `${this.id}DbArn`, { value: this.db?.clusterArn})

  }
}

