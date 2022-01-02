import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import { CodeCommitSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import {
  Construct,
  Stage,
  Stack,
  StackProps,
  StageProps,
} from '@aws-cdk/core';
import {
  CdkPipeline,
  SimpleSynthAction,
} from '@aws-cdk/pipelines';
import {
  WiFiSwitcherApiStack,
} from './wi-fi-switcher-api-stack';
import {
  WiFiSwitcherStack,
} from './wi-fi-switcher-stack';


class Application extends Stage {
  constructor(
    scope: Construct,
    id: string,
    props?: StageProps,
  ) {
    super(scope, id, props);

    const apiStack = new WiFiSwitcherApiStack(
      this,
      'wi-fi-switcher-api',
    );
    new WiFiSwitcherStack(
      this,
      'wi-fi-switcher',
      { api: apiStack.api },
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

    const pipeline = new CdkPipeline(this, 'Pipeline', {
      pipelineName: 'Wi-Fi-SwitcherPipeline',
      cloudAssemblyArtifact,
      sourceAction: new CodeCommitSourceAction ({
        actionName: 'CodeCommit',
        repository: repo,
        branch: 'main',
        output: sourceArtifact,
      }),
      synthAction: SimpleSynthAction.standardYarnSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        environment: {
          privileged: true,
          environmentVariables: {
            APP_CERT_ARN: {
              value: this.node.tryGetContext('CERT_ARN') ?? '',
            },
            APP_ZONE_ID: {
              value: this.node.tryGetContext('ZONE_ID') ?? '',
            },
            APP_ZONE_NAME: {
              value: this.node.tryGetContext('ZONE_NAME') ?? '',
            },
            APP_FQDN: { value: this.node.tryGetContext('FQDN') ?? '' },
          },
        },
        installCommand: 'yarn install --frozen-lockfile && (cd ./web && yarn install --frozen-lockfile)',
        buildCommand: '(cd ./web && yarn build)',
        synthCommand: 'npx cdk synth -c CERT_ARN=${CERT_ARN} -c ZONE_ID=${ZONE_ID} -c ZONE_NAME=${ZONE_NAME} -c FQDN=${FQDN}',
      }),
    });

    // 開発用のDeploy
    pipeline.addApplicationStage(new Application(this, 'staging'));

    // 本番用のDeploy
    pipeline.addApplicationStage(
      new Application(this, 'prod'),
      {
        manualApprovals: true,
      },
    );
  }
}
