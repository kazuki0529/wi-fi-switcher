import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { WiFiSwitcherApiStack } from '../src/wi-fi-switcher-api-stack';

test('Snapshot', () => {
  const app = new App();
  const stack = new WiFiSwitcherApiStack(app, 'test');

  expect(stack).toHaveResource('AWS::DynamoDB::Table');

  expect(stack).toHaveResource('AWS::ApiGateway::RestApi');
  expect(stack).toHaveResource('AWS::Lambda::Function');

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
