import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ec2 from 'aws-cdk-lib/aws-ec2'

// 👇 extend the props interface of ECSStack
interface EcsStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}


export class Cluster extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    // Uses the stuff from bin/demo-app.ts
    const {vpc} = props;


    const cluster = new ecs.Cluster(this, "MyCluster", {
      // vpc is the const above
      vpc: vpc
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      cpu: 256, // Default is 256
      desiredCount: 1, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample") },
      memoryLimitMiB: 512, // Default is 512
      publicLoadBalancer: true // Default is true
    });

  }
}
