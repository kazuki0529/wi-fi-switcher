import * as apigw from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';;
import * as lambda from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as logs from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
import { StackStage } from './wi-fi-switcher-stack';


interface WiFiSwitcherStackApiProps extends StackProps {
  readonly userPool:cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
  readonly stage: StackStage;
}

export class WiFiSwitcherApiStack extends Stack {
  public readonly table: dynamo.Table;
  public readonly api: apigw.HttpApi;
  public readonly apiStage: apigw.HttpStage;

  constructor(
    scope: Construct, id: string,
    props: WiFiSwitcherStackApiProps,
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


    this.api = new apigw.HttpApi(this, 'game-play', {
      createDefaultStage: false,
    });
    this.apiStage = new apigw.HttpStage(this, 'api-stage', {
      httpApi: this.api,
      stageName: 'api',
      autoDeploy: true,
    });

    this.api.addRoutes({
      methods: [apigw.HttpMethod.GET, apigw.HttpMethod.POST],
      path: '/v1/requests',
      integration: new HttpLambdaIntegration('api-request-integration', requests),
    });
    this.api.addRoutes({
      methods: [apigw.HttpMethod.PUT],
      path: '/v1/requests/{requestId}',
      integration: new HttpLambdaIntegration('api-request-integration', requests),
    });
  }
}