#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VPCStack } from '../lib/vpc-stack';
import { Cluster } from '../lib/ecs-stack';
import { LetsEncryptCluster } from '../lib/lets-encrypt-stack';
import { Server } from '../lib/ec2-stack';
import { ECR } from '../lib/ecr-stack';
import { RDS } from '../lib/rds-stack';

const app = new cdk.App();

const vpcStack = new VPCStack(app, 'vpc-stack', {
  stackName: 'vpc-stack'
});

//const ecrStack = new ECR(app, 'ecr-stack', {
//  stackName: 'ecr-stack'
//});
//
//const rdsStack = new RDS(app, 'rds-stack', {
//  // 👇 pass the VPC from the other stack
//  vpc: vpcStack.vpc,
//  stackName: 'rds-stack'
//});

//new Cluster(app, 'ecs-stack', {
//  // 👇 pass the VPC from the other stack
//  vpc: vpcStack.vpc,
//  stackName: 'ecs-stack'
//});

new LetsEncryptCluster(app, 'lets-encrypt-stack', {
  // 👇 pass the VPC from the other stack
  vpc: vpcStack.vpc,
  stackName: 'lets-encrypt-stack'
});

//const server = new Server(app, 'ec2-stack', {
//  // 👇 pass the VPC from the other stack
//  vpc: vpcStack.vpc,
//  stackName: 'ec2-stack'
//});
