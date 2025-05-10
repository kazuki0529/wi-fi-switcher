import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
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

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Cognito::UserPool', {});
  template.hasResourceProperties('AWS::Cognito::UserPoolClient', {});

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
