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

    // VPC Endpoints allow traffic from our private subnets to not traverse the entire
    // internet in order to access AWS resources, this is designed to limit the amount
    // of bandwidth the inernet/NAT gateway consumes.
    // The addInterfaceEndpoint method appears in the docs to default to private subnets,
    // however it's not obvious how to explicitly set that.

    const endpointSecurityGroup = new ec2.SecurityGroup(
      this,
      'EndPointSecurityGroup',
      {
        vpc: this.vpc,
        allowAllOutbound: false,
        securityGroupName: `vpc-endpoint-sg`,
      }
    );

    this.vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [
       { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }
      ]
    });

    this.vpc.addInterfaceEndpoint('EcrDockerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER,
      securityGroups: [ endpointSecurityGroup ]
    });

    this.vpc.addInterfaceEndpoint('RDSEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.RDS,
      securityGroups: [ endpointSecurityGroup ]
    });


  }
}
