import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { WiFiSwitcherApiStack } from '../src/wi-fi-switcher-api-stack';
import { WiFiSwitcherCognitoStack } from '../src/wi-fi-switcher-cognito-stack';
import { WiFiSwitcherStack } from '../src/wi-fi-switcher-stack';

test('Snapshot', () => {
  const app = new App({
    context: {
      ZONE_ID: 'ZONE-ID',
      ZONE_NAME: 'ZONE-NAME',
      CERT_ARN: 'CERT-ARN',
    },
  });
  const cognito = new WiFiSwitcherCognitoStack(app, 'cognito', { stage: 'staging' });
  const api = new WiFiSwitcherApiStack(app, 'api', {
    stage: 'staging',
    userPool: cognito.userPool,
    userPoolClient: cognito.userPoolClient,
  });
  const stack = new WiFiSwitcherStack(app, 'test', {
    stage: 'staging',
    api: api.api,
    table: api.table,
  });

  expect(stack).toHaveResource('AWS::CloudFront::Distribution');
  expect(stack).toHaveResource('AWS::CloudFront::CloudFrontOriginAccessIdentity');
  expect(stack).toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('AWS::IAM::User');

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
