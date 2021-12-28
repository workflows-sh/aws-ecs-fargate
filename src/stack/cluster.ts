import * as cdk from '@aws-cdk/core'
import * as ecs from '@aws-cdk/aws-ecs'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds';
import * as sqs from '@aws-cdk/aws-sqs';
import * as elasticache from './redis';

interface StackProps {
  repo: string,
  tag: string
}

export default class Cluster extends cdk.Stack {
  public readonly vpc: ec2.Vpc
  public readonly cluster: ecs.Cluster
  public readonly db: rds.ServerlessCluster
  public readonly mq: sqs.Queue
  public readonly redis: cdk.Construct
  public readonly bastion: ec2.BastionHostLinux
  constructor(scope: cdk.Construct, id: string, props?: StackProps) {
    super(scope, id)

    const repo = props?.repo ?? 'sample-app'
    const tag = props?.tag ?? 'main'

    // todo @kc make AZ a StackProp
    const vpc = new ec2.Vpc(this, `${id}-vpc`, { 
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
          subnetType: ec2.SubnetType.PRIVATE,
          cidrMask: 24,
        }
      ],
    }); 

    const bastionSecurityGroup = new ec2.SecurityGroup(this, `${id}-bastion-sg`, {
      vpc: vpc,
      allowAllOutbound: true,
      description: `bastion security group for ${id} cluster`,
      securityGroupName: `${id}-bastion-sg`
    });
    bastionSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'SSH access');

    const bastion = new ec2.BastionHostLinux(this, `${id}-bastion`, {
      vpc: vpc,
      instanceName: `${id}-bastion`,
      securityGroup: bastionSecurityGroup,
      subnetSelection: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    });

    const cluster = new ecs.Cluster(this, `${id}-ecs`, { 
      vpc: vpc
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, `${id}-db-sg`, {
      vpc: vpc,
      allowAllOutbound: true,
      description: `db security group for ${id} db`,
      securityGroupName: `${id}-db-sg`
    });
    dbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306), 'MySQL access');

    const db = new rds.ServerlessCluster(this, `${id}-db`, {
      vpc: vpc,
      defaultDatabaseName: `${id}`,
      engine: rds.DatabaseClusterEngine.AURORA_MYSQL,
      scaling: { autoPause: cdk.Duration.seconds(0) },
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE },
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromGeneratedSecret('root')
    });

    const redis = new elasticache.Cluster(this, `${id}-redis`, { vpc: vpc });
    const mq = new sqs.Queue(this, `${id}-sqs`);

    new cdk.CfnOutput(this, 'DBSecretArn', { value: db?.secret?.secretArn || 'unknown' })

    this.vpc = vpc;
    this.cluster = cluster;
    this.bastion = bastion;
    this.redis = redis;
    this.db = db;
    this.mq = mq;

  }
}

