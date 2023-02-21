#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VPCStack } from '../lib/vpc-stack';
import { Cluster } from '../lib/ecs-stack';
import { ECR } from '../lib/ecr-stack';
import { RDS } from '../lib/rds-stack';

const app = new cdk.App();

const vpcStack = new VPCStack(app, 'vpc-stack', {
  stackName: 'vpc-stack'
});

const ecrStack = new ECR(app, 'ecr-stack', {
  stackName: 'ecr-stack'
});

const rdsStack = new RDS(app, 'rds-stack', {
  // 👇 pass the VPC from the other stack
  vpc: vpcStack.vpc,
  stackName: 'rds-stack'
});

const cluster = new Cluster(app, 'ecs-stack', {
  // 👇 pass the VPC from the other stack
  vpc: vpcStack.vpc,
  stackName: 'ecs-stack'
});


