import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds';

// 👇 extend the props interface
interface RDSStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class RDS extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RDSStackProps) {
    super(scope, id, props);

    // Uses the stuff from bin/demo-app.ts
    const {vpc} = props;

    console.log(props);

    const dbInstance = new rds.DatabaseInstance(this, 'db-instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      multiAz: false,
      allocatedStorage: 2048,
      maxAllocatedStorage: 3048,
      allowMajorVersionUpgrade: true,
      autoMinorVersionUpgrade: true,
      backupRetention: cdk.Duration.days(0),
      deleteAutomatedBackups: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
      databaseName: 'todosdb',
      publiclyAccessible: false,
    });

  }
}
