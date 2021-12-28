import cdk = require('@aws-cdk/core')
import ecr = require('@aws-cdk/aws-ecr')

interface StackProps {
  repo: string
 }

export default class Registry extends cdk.Stack {
  public readonly repo: ecr.Repository
  constructor(scope: cdk.Construct, id: string, props?: StackProps) {
    super(scope, id)

    const repo = props?.repo ?? 'sample-app'

    const repository = new ecr.Repository(this, `${repo}`, {
      repositoryName: `${repo}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    this.repo = repository;
    new cdk.CfnOutput(this, `${repo}Registry`, { value: repository.repositoryUri });
  }
}

