import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import { CodeCommitSourceAction } from '@aws-cdk/aws-codepipeline-actions';
import * as iam from '@aws-cdk/aws-iam';
import {
  CfnOutput,
  Construct,
  Stage,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import {
  CdkPipeline,
  SimpleSynthAction,
  ShellScriptAction,
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
  public readonly distributionId: CfnOutput;
  public readonly webBucketName: CfnOutput;

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
    const stack = new WiFiSwitcherStack(
      this,
      'wi-fi-switcher',
      {
        ...props,
        api: apiStack.api,
        apiStage: apiStack.apiStage,
      },
    );

    this.distributionId = new CfnOutput(stack, 'DISTRIBUTION_ID', {
      value: stack.distribution.distributionId,
    });
    this.webBucketName = new CfnOutput(stack, 'WEB_BUCKET_NAME', {
      value: stack.webBucket.bucketName,
    });
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
    const deployProps = {
      actionName: 'deployment-web',
      environment: {
        privileged: true,
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
      },
      commands: [
        'npm install -g yarn aws-cli',
        '(cd ./web && yarn install --frozen-lockfile && yarn build)',
        '(cd ./web/build && aws s3 sync . "s3://${WEB_BUCKET_NAME}/" --include "*" --delete)',
        'aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths "/*"',
      ],
      additionalArtifacts: [sourceArtifact],
      rolePolicyStatements: [
        new iam.PolicyStatement({
          actions: [
            's3:ListAllMyBuckets',
            's3:ListBucket',
            's3:ListObjectsV2',
            's3:PutObject',
            's3:DeleteObject',
            's3:GetObject',
          ],
          resources: ['arn:aws:s3:::*'],
        }),
        new iam.PolicyStatement({
          actions: [
            'cloudfront:GetDistribution',
            'cloudfront:GetDistributionConfig',
            'cloudfront:ListDistributions',
            'cloudfront:ListStreamingDistributions',
            'cloudfront:CreateInvalidation',
            'cloudfront:ListInvalidations',
            'cloudfront:GetInvalidation',
          ],
          resources: ['*'],
        }),
      ],
    };
    const stageApp = new Application(this, 'staging', { stage: 'staging' });
    const stage = pipeline.addApplicationStage(stageApp);
    stage.addActions(new ShellScriptAction({
      ...deployProps,
      useOutputs: {
        DISTRIBUTION_ID: pipeline.stackOutput(stageApp.distributionId),
        WEB_BUCKET_NAME: pipeline.stackOutput(stageApp.webBucketName),
      },
    }));

    // 本番用のDeploy
    const prodApp = new Application(this, 'prod', { stage: 'prod' });
    const prod = pipeline.addApplicationStage(prodApp, { manualApprovals: true });
    prod.addActions( new ShellScriptAction({
      ...deployProps,
      useOutputs: {
        DISTRIBUTION_ID: pipeline.stackOutput(prodApp.distributionId),
        WEB_BUCKET_NAME: pipeline.stackOutput(prodApp.webBucketName),
      },
    }));
  }
}
