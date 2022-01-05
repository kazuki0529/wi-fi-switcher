import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { WiFiSwitcherCognitoStack } from '../src/wi-fi-switcher-cognito-stack';

test('Snapshot', () => {
  const app = new App({
    context: {
      ZONE_ID: 'ZONE-ID',
      ZONE_NAME: 'ZONE-NAME',
      CERT_ARN: 'CERT-ARN',
    },

  });
  const stack = new WiFiSwitcherCognitoStack(app, 'test', { stage: 'staging' });

  expect(stack).toHaveResource('AWS::Cognito::UserPool');
  expect(stack).toHaveResource('AWS::Cognito::UserPoolClient');

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
