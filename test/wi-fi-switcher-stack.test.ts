import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
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

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::CloudFront::Distribution', {});
  template.hasResourceProperties('AWS::CloudFront::CloudFrontOriginAccessIdentity', {});
  template.hasResourceProperties('AWS::S3::Bucket', {});
  template.hasResourceProperties('AWS::IAM::User', {});

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
