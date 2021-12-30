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

    new WiFiSwitcherApiStack(
      this,
      'wi-fi-switcher-api',
    );
    new WiFiSwitcherStack(
      this,
      'wi-fi-switcher',
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
        },
        synthCommand: 'npx cdk synth',
      }),
    });

    // 開発用のDeploy
    pipeline.addApplicationStage(
      new Application(this, 'staging'),
    );

    // 本番用のDeploy
    pipeline.addApplicationStage(
      new Application(this, 'prod'),
      {
        manualApprovals: true,
      },
    );
  }
}
