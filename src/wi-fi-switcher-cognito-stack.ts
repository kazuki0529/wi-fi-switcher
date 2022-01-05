import * as cognito from '@aws-cdk/aws-cognito';
import * as cdk from '@aws-cdk/core';

import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { StackStage } from './wi-fi-switcher-stack';

interface WiFiSwitcherCognitoStackProps extends StackProps {
  readonly stage: StackStage;
}

export class WiFiSwitcherCognitoStack extends Stack {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;

  constructor(
    scope: Construct, id: string,
    props: WiFiSwitcherCognitoStackProps,
  ) {
    super(scope, id, props);

    const zoneName = this.node.tryGetContext('ZONE_NAME');
    const domain = `${(props.stage === 'staging') ? 'dev.': ''}${zoneName}`;
    const fqdn = `game-play.home.${domain}`;

    this.userPool = new cognito.UserPool(this, 'userPool', {
      selfSignUpEnabled: false,
      standardAttributes: {
        email: { required: true, mutable: true },
        phoneNumber: { required: false },
      },
      signInCaseSensitive: false,
      autoVerify: { email: true },
      signInAliases: { username: true },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.userPool.addDomain('domain', {
      cognitoDomain: { domainPrefix: fqdn.toLowerCase().split('.').join('-') },
    });

    this.userPoolClient = this.userPool.addClient('client', {
      oAuth: {
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [`https://${fqdn}/`],
        logoutUrls: [`https://${fqdn}/`],
        flows: { authorizationCodeGrant: true },
      },
    });
  }
}