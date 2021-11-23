const { AwsCdkTypeScriptApp } = require('projen');
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.95.2',
  defaultReleaseBranch: 'main',
  name: 'wi-fi-switcher',
  repository: 'https://github.com/kazuki0529/wi-fi-switcher.git',
  cdkDependencies: [
    '@aws-cdk/aws-dynamodb',
    '@aws-cdk/pipelines',
    '@aws-cdk/aws-codecommit',
    '@aws-cdk/aws-codebuild',
    '@aws-cdk/aws-codepipeline',
    '@aws-cdk/aws-codepipeline-actions',
    '@aws-cdk/aws-iam',
  ],
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
  },
  // deps: [],                    /* Runtime dependencies of this module. */
  // description: undefined,      /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],                 /* Build dependencies for this module. */
  // packageName: undefined,      /* The "name" in package.json. */
  // release: undefined,          /* Add release management to this project. */
});

const excludes = ['yarn-error.log', '.env', 'data/'];
project.gitignore.exclude(...excludes);

project.synth();