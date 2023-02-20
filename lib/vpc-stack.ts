import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'

export class VPCStack extends cdk.Stack {
  // 👇 set a property for the vpc
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(
      this,
      'Vpc',
      {
        vpcName: 'Demo',
        ipAddresses: ec2.IpAddresses.cidr('192.168.0.0/16'),
        natGateways: 1,
        maxAzs: 2,
        subnetConfiguration: [
          {
            name: 'Public',
            subnetType: ec2.SubnetType.PUBLIC,
            cidrMask: 24
          },
          {
            name: 'Private',
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            cidrMask: 24
          }
        ]
      }
    );


  }
}
