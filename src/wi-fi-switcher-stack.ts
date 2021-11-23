import * as dynamo from '@aws-cdk/aws-dynamodb';
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';

export class WiFiSwitcherStack extends Stack {
  public readonly table: dynamo.Table;

  constructor(scope: Construct, id: string, props: StackProps = {}) {
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
  }
}