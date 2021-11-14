import { App } from '@aws-cdk/core';
import { WiFiSwitcherStack } from './wi-fi-switcher-stack';


// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new WiFiSwitcherStack(app, 'wi-fi-switcher-stack', { env: devEnv });

app.synth();
