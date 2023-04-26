import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ecs from "aws-cdk-lib/aws-ecs";
import { FargateService, FargateTaskDefinition, Secret } from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { Role } from 'aws-cdk-lib/aws-iam';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';



// 👇 extend the props interface of ECSStack
interface LetsEncryptStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}


export class LetsEncryptCluster extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LetsEncryptStackProps) {
    super(scope, id, props);


    // Uses the stuff from bin/demo-app.ts
    const { vpc } = props;


    const cluster = new ecs.Cluster(this, "LetsEncryptCluster", {
      // vpc is the const above
      vpc: vpc
    });

    const taskDefinition = new FargateTaskDefinition(this, `TaskDefinitionDemoApp`, {
      family: 'DemoApp',
      memoryLimitMiB: 512, // Default is 512
      cpu: 256, // Default is 256
    });

    const applicationContainer = taskDefinition.addContainer('MyFargateService', {
      image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
    });

    const certbotTaskDefinintion = new FargateTaskDefinition(this, `CertbotTaskDefinition`, {
      family: 'CertBot',
      memoryLimitMiB: 512, // Default is 512
      cpu: 256, // Default is 256
    });

    certbotTaskDefinintion.executionRole?.roleArn

    const certbotContainer = certbotTaskDefinintion.addContainer('CertBot', {
      image: ecs.ContainerImage.fromRegistry("nginx"),
      essential: true
    });

    certbotContainer.addPortMappings({
      containerPort: 80,
    });
    certbotContainer.addPortMappings({
      containerPort: 443,
    });

    applicationContainer.addPortMappings({
      containerPort: 80,
    });
    applicationContainer.addPortMappings({
      containerPort: 443,
    });


    const webService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster, // Required
      desiredCount: 1, // Default is 1
      taskDefinition: taskDefinition,
      publicLoadBalancer: true // Default is true
    });

    const certBotService = new ecs.FargateService(this, 'CertBotService', {
      cluster: cluster,
      desiredCount: 1,
      taskDefinition: certbotTaskDefinintion,
    });

    const certBotTargetGroup = new elbv2.ApplicationTargetGroup(this, 'CertBotTargetGroup', {
      vpc: cluster.vpc,
      port: 80,
      targetType: elbv2.TargetType.IP,
    });

    new elbv2.CfnListenerRule(this, 'certBotListenerRule', {
      actions: [
        {
          type: 'forward',
          targetGroupArn: certBotTargetGroup.targetGroupArn,
        },
      ],
      conditions: [
        {
          field: 'path-pattern',
          values: ['/.well-known/acme-challenge/*'],
        },
      ],
      listenerArn: webService.listener.listenerArn,
      priority: 1,
    });

    certbotTaskDefinintion.addToTaskRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel",
        "elasticloadbalancing:DescribeSSLPolicies",
        "elasticloadbalancing:DescribeListeners",
        "elasticloadbalancing:DescribeListenerCertificates",
        "acm:DescribeCertificate",
        "acm:RemoveTagsFromCertificate",
        "acm:GetCertificate",
        "acm:AddTagsToCertificate",
        "acm:ListCertificates",
        "acm:ImportCertificate",
        "acm:ListTagsForCertificate"
      ],
      resources: ['*'],
    }));

    certbotTaskDefinintion.addToTaskRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "elasticloadbalancing:RemoveTags",
        "elasticloadbalancing:DescribeTags",
        "elasticloadbalancing:AddTags",
        "elasticloadbalancing:AddListenerCertificates"
      ],
      resources: [webService.loadBalancer.loadBalancerArn],
    }))



  }
}
