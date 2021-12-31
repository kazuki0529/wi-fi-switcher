const { awscdk, web } = require('projen');

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '1.137.0',
  defaultReleaseBranch: 'main',
  name: 'wi-fi-switcher',
  repository: 'https://github.com/kazuki0529/wi-fi-switcher.git',
  cdkDependencies: [
    '@aws-cdk/aws-dynamodb',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-apigateway',
    '@aws-cdk/aws-s3',
    '@aws-cdk/aws-s3-deployment',
    '@aws-cdk/aws-cloudfront',
    '@aws-cdk/aws-route53',
    '@aws-cdk/aws-route53-targets',
    '@aws-cdk/aws-certificatemanager',
    '@aws-cdk/aws-cognito',
    '@aws-cdk/pipelines',
    '@aws-cdk/aws-codecommit',
    '@aws-cdk/aws-codebuild',
    '@aws-cdk/aws-codepipeline',
    '@aws-cdk/aws-codepipeline-actions',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-logs',
  ],
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
  },
  pullRequestTemplateContents: [
    '## 解決するチケット',
    '',
    'fixed #xx',
    '',
    '## 修正内容',
    '',
    '',
    '## その他',
    '',
    '- レビュワーへの参考情報（実装上の懸念点や注意点などあれば記載）',
  ],
  deps: [
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
    '@types/aws-lambda',
    'aws-xray-sdk',
    'moment',
    'type-guards',
    '@types/uuid',
    'uuid',
  ],
  devDeps: ['esbuild', 'aws-sdk-client-mock'],
  devContainer: true,
  // description: undefined,      /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,      /* The "name" in package.json. */
  // release: undefined,          /* Add release management to this project. */
});

const excludes = ['yarn-error.log', '.env', 'data/', '.idea'];
project.gitignore.exclude(...excludes);

project.synth();

const reactProject = new web.ReactProject({
  parent: project,
  name: 'wi-fi-switcher-web',
  defaultReleaseBranch: 'main',
  outdir: 'web',
  deps: [
    'moment',
    'axios',
  ],
});

reactProject.synth();