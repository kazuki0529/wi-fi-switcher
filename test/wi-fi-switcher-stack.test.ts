import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { WiFiSwitcherStack } from '../src/wi-fi-switcher-stack';

test('Snapshot', () => {
  const app = new App();
  const stack = new WiFiSwitcherStack(app, 'test');

  expect(stack).toHaveResource('AWS::CloudFront::Distribution');
  expect(stack).toHaveResource('AWS::CloudFront::CloudFrontOriginAccessIdentity');
  expect(stack).toHaveResource('AWS::S3::Bucket');

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
