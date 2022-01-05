import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { WiFiSwitcherApiStack } from '../src/wi-fi-switcher-api-stack';
import { WiFiSwitcherCognitoStack } from '../src/wi-fi-switcher-cognito-stack';

test('Snapshot', () => {
  const app = new App({
    context: {
      ZONE_ID: 'ZONE-ID',
      ZONE_NAME: 'ZONE-NAME',
      CERT_ARN: 'CERT-ARN',
    },
  });
  const cognito = new WiFiSwitcherCognitoStack(app, 'cognito', { stage: 'staging' });
  const stack = new WiFiSwitcherApiStack(app, 'test', {
    stage: 'staging',
    userPool: cognito.userPool,
    userPoolClient: cognito.userPoolClient,
  });

  expect(stack).toHaveResource('AWS::DynamoDB::Table');

  expect(stack).toHaveResource('AWS::ApiGatewayV2::Api');
  expect(stack).toHaveResource('AWS::ApiGatewayV2::Authorizer');
  expect(stack).toHaveResource('AWS::Lambda::Function');

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
