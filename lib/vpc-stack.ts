import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'

export class VPCStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(
      this,
      'Vpc',
      {
        vpcName: 'Demo',
        cidr: '192.168.0.0/16',
        natGateways: 1,
        maxAzs: 2,
        subnetConfiguration: [
          {
            name: 'PublicA',
            subnetType: ec2.SubnetType.PUBLIC,
            cidrMask: 24
          },
          {
            name: 'PublicB',
            subnetType: ec2.SubnetType.PUBLIC,
            cidrMask: 24
          },
          {
            name: 'PrivateA',
            subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
            cidrMask: 24
          },
          {
            name: 'PrivateB',
            subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
            cidrMask: 24
          }
        ]
      }
    );


  }
}
