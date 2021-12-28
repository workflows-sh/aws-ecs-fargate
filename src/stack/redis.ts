import * as cdk from '@aws-cdk/core';
import * as elasticache from '@aws-cdk/aws-elasticache';
import * as ec2 from '@aws-cdk/aws-ec2';

interface StackProps {
  vpc: ec2.Vpc
}

class RedisCluster extends cdk.Construct {
  public readonly cluster: elasticache.CfnCacheCluster
  constructor(scope: cdk.Construct, id:string, props:StackProps) {
    super(scope, id);

    const targetVpc = props.vpc;

    // Define a group for telling Elasticache which subnets to put cache nodes in.
    const subnetGroup = new elasticache.CfnSubnetGroup(this, `${id}-subnet-group`, {
      description: `List of subnets used for redis cache ${id}`,
      subnetIds: targetVpc.privateSubnets.map(function(subnet) {
        return subnet.subnetId;
      })
    });

    // The security group that defines network level access to the cluster
    const securityGroup = new ec2.SecurityGroup(this, `${id}-security-group`, { vpc: targetVpc });

    // The cluster resource itself.
    this.cluster = new elasticache.CfnCacheCluster(this, `${id}-cluster`, {
      cacheNodeType: 'cache.t2.micro',
      engine: 'redis',
      numCacheNodes: 1,
      autoMinorVersionUpgrade: true,
      cacheSubnetGroupName: subnetGroup.ref,
      vpcSecurityGroupIds: [
        securityGroup.securityGroupId
      ]
    });
  
  }

}

export { RedisCluster as Cluster }
