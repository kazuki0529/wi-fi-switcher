import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import { CodeCommitSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import {
  Construct,
  Stage,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import {
  CdkPipeline,
  SimpleSynthAction,
} from '@aws-cdk/pipelines';
import {
  WiFiSwitcherApiStack,
} from './wi-fi-switcher-api-stack';
import {
  StackStage,
  WiFiSwitcherStack,
} from './wi-fi-switcher-stack';

interface StackStageProps extends StackProps {
  readonly stage: StackStage;
}
class Application extends Stage {
  constructor(
    scope: Construct,
    id: string,
    props: StackStageProps,
  ) {
    super(scope, id, props);

    // const cognito = new WiFiSwitcherCognitoStack(
    //   this,
    //   'wi-fi-switcher-cognito',
    //   {
    //     ...props,
    //   },
    // );
    const apiStack = new WiFiSwitcherApiStack(
      this,
      'wi-fi-switcher-api',
      {
        ...props,
        // userPool: cognito.userPool,
        // userPoolClient: cognito.userPoolClient,
      },
    );
    new WiFiSwitcherStack(
      this,
      'wi-fi-switcher',
      {
        ...props,
        api: apiStack.api,
        apiStage: apiStack.apiStage,
      },
    );
  }
}

export class WiFiSwitcherPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const repo = codecommit.Repository.fromRepositoryName(
      this,
      'repo',
      'wi-fi-switcher',
    ) as codecommit.Repository;
    const sourceAction = new CodeCommitSourceAction ({
      actionName: 'CodeCommit',
      repository: repo,
      branch: 'main',
      output: sourceArtifact,
    });
    const synthProps = {
      sourceArtifact,
      cloudAssemblyArtifact,
      environment: {
        privileged: true,
        environmentVariables: {
          CERT_ARN: {
            value: this.node.tryGetContext('CERT_ARN') ?? '',
          },
          ZONE_ID: {
            value: this.node.tryGetContext('ZONE_ID') ?? '',
          },
          ZONE_NAME: {
            value: this.node.tryGetContext('ZONE_NAME') ?? '',
          },
        },
      },
      installCommand: 'yarn install --frozen-lockfile && (cd ./web && yarn install --frozen-lockfile)',
      buildCommand: '(cd ./web && yarn build)',
      synthCommand: 'npx cdk synth -c "CERT_ARN=${CERT_ARN}" -c "ZONE_ID=${ZONE_ID}" -c "ZONE_NAME=${ZONE_NAME}"',
    };

    const pipeline = new CdkPipeline(this, 'pipeline-staging', {
      pipelineName: 'Wi-Fi-SwitcherPipeline',
      cloudAssemblyArtifact,
      sourceAction,
      synthAction: SimpleSynthAction.standardYarnSynth({
        ...synthProps,
        synthCommand: 'npx cdk synth -c "CERT_ARN=${CERT_ARN}" -c "ZONE_ID=${ZONE_ID}" -c "ZONE_NAME=${ZONE_NAME}"',
      }),
    });

    // 開発用のDeploy
    pipeline.addApplicationStage(new Application(this, 'staging', { stage: 'staging' }));

    // 本番用のDeploy
    pipeline.addApplicationStage(
      new Application(this, 'prod', { stage: 'prod' }),
      {
        manualApprovals: true,
      },
    );

  }
}
