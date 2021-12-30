import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';;
import * as lambda from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';

import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';

export type StackStage = 'staging' | 'prod';

export class WiFiSwitcherApiStack extends Stack {
  public readonly table: dynamo.Table;
  public readonly api: apigateway.RestApi;

  constructor(
    scope: Construct, id: string,
    props?: StackProps,
  ) {
    super(scope, id, props);

    // データ格納領域作成
    this.table =new dynamo.Table(this, 'data', {
      partitionKey: {
        name: '_p_key',
        type: dynamo.AttributeType.STRING,
      },
      sortKey: {
        name: '_s_key',
        type: dynamo.AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
    });
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI-1',
      partitionKey: {
        name: '_gsi1_p_key',
        type: dynamo.AttributeType.STRING,
      },
      sortKey: {
        name: '_gsi1_s_key',
        type: dynamo.AttributeType.STRING,
      },
      projectionType: dynamo.ProjectionType.ALL,
    });

    /**
     * API作成
     */
    const requests = new NodejsFunction(this, 'requests', {
      tracing: lambda.Tracing.ACTIVE,
      runtime: lambda.Runtime.NODEJS_14_X,
      timeout: cdk.Duration.seconds(60),
      memorySize: 2048,
      environment: {
        REGION: this.region,
        TABLE_NAME: this.table.tableName,
      },
      logRetention: logs.RetentionDays.ONE_MONTH,
      role: new iam.Role(this, 'generateBatchLambdaRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole',
          ),
        ],
      }),
    });
    this.table.grantReadWriteData(requests);

    this.api = new apigateway.RestApi(this, 'game-play', {
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            principals: [new iam.AnyPrincipal()],
            effect: iam.Effect.ALLOW,
            actions: ['execute-api:Invoke'],
            resources: ['execute-api:/prod/*'],
          }),
        ],
      }),
      deployOptions: {
        tracingEnabled: true,
        stageName: 'prod',
      },
    });
    const baseApi = this.api.root.addResource('v1');
    const requestsIntegration = new apigateway.LambdaIntegration(requests);
    const requestsApi = baseApi.addResource('requests');
    requestsApi.addMethod('POST', requestsIntegration);
    requestsApi.addMethod('GET', requestsIntegration);

    requestsApi.addResource('{requestId}').addMethod('PUT', requestsIntegration);

    new cdk.CfnOutput(this, 'ApiUrl', { value: this.api.url });
  }
}