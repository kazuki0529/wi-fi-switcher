import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { WiFiSwitcherApiStack } from '../src/wi-fi-switcher-api-stack';
import { WiFiSwitcherStack } from '../src/wi-fi-switcher-stack';

test('Snapshot', () => {
  const app = new App();
  const api = new WiFiSwitcherApiStack(app, 'api');
  const stack = new WiFiSwitcherStack(app, 'test', { api: api.api });

  expect(stack).toHaveResource('AWS::CloudFront::Distribution');
  expect(stack).toHaveResource('AWS::CloudFront::CloudFrontOriginAccessIdentity');
  expect(stack).toHaveResource('AWS::S3::Bucket');

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
