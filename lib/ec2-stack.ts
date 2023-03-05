import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';


// 👇 extend the props interface of Ec2Stack
interface Ec2StackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}


export class Server extends cdk.Stack {
  readonly bastionSecurityGroup: ec2.SecurityGroup;
  constructor(scope: Construct, id: string, props: Ec2StackProps) {
    super(scope, id, props);
    // Uses the stuff from bin/demo-app.ts
    const {vpc} = props;

    // You can attach permissions to a role and determine what your
    // instance can or can not do
    const role = new iam.Role(
      this,
      'simple-instance-1-role', // this is a unique id that will represent this resource in a Cloudformation template
      { assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com') }
    )
    // lets create a security group for our instance
    // A security group acts as a virtual firewall for your instance to control inbound and outbound traffic.
    const securityGroup = new ec2.SecurityGroup(
      this,
      'simple-instance-1-sg',
      {
        vpc: vpc,
        allowAllOutbound: true, // will let your instance send outboud traffic
        securityGroupName: 'simple-instance-1-sg',
      }
    )
    // Finally lets provision our ec2 instance
    const instance = new ec2.Instance(this, 'simple-instance-1', {
      vpc: vpc,
      role: role,
      securityGroup: securityGroup,
      instanceName: 'simple-instance-1',
      instanceType: ec2.InstanceType.of( // t2.micro has free tier usage in aws
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),

    });

    this.bastionSecurityGroup = new ec2.SecurityGroup(
        this,
        'bastion-sg',
        {
          vpc: vpc,
          allowAllOutbound: false,
        }
    );
    this.bastionSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.allTraffic(), 'all from self');
    this.bastionSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'Allow Postgres outbound traffic');
    this.bastionSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH outbound traffic');
    this.bastionSecurityGroup.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow SSM outbound traffic');

    const bastion = new ec2.BastionHostLinux(this, "DatabaseBastion", {
      instanceName: "SecureframeSSMDatabaseBastion",
      instanceType: new ec2.InstanceType("t2.nano"),
      vpc: vpc,
      securityGroup: this.bastionSecurityGroup,
      subnetSelection: props.vpc.selectSubnets({subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS}),
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(8, {
            encrypted: true,
          }),
        },
      ],
    });
  }
}
