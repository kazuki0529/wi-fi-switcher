import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { WiFiSwitcherStack } from '../src/wi-fi-switcher-stack';

test('Snapshot', () => {
  const app = new App();
  const stack = new WiFiSwitcherStack(app, 'test');

  expect(stack).toHaveResource('AWS::DynamoDB::Table');
  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
