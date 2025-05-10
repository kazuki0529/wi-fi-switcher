import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
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

  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::DynamoDB::Table', {});
  template.hasResourceProperties('AWS::ApiGatewayV2::Api', {});
  template.hasResourceProperties('AWS::ApiGatewayV2::Authorizer', {});
  template.hasResourceProperties('AWS::Lambda::Function', {});

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});
