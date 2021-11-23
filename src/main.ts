import { App } from '@aws-cdk/core';
import { WiFiSwitcherPipelineStack } from './wi-fi-switcher-pipeline-stack';


// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new WiFiSwitcherPipelineStack(app, 'wi-fi-switcher-pipeline-stack', { env: devEnv });

app.synth();
