import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ecr from "aws-cdk-lib/aws-ecr";



export class ECR extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const repository = new ecr.Repository(this, 'DemoRepository',
                                          {
      repositoryName: 'demoapp'
    }
    );
  }
}
