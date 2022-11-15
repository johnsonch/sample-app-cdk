#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VPCStack } from '../lib/vpc-stack';

const app = new cdk.App();
//const vpc = new cdk.Stack(app, 'VPCStack');

new VPCStack(app, 'VPCStack', {

});

