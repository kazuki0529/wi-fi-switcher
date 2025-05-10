import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  CfnOutput,
  Stage,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import {
  WiFiSwitcherApiStack,
} from './wi-fi-switcher-api-stack';
import {
  WiFiSwitcherCognitoStack,
} from './wi-fi-switcher-cognito-stack';
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
  public readonly userPoolRegion: CfnOutput;
  public readonly userPoolId: CfnOutput;
  public readonly userPoolClientId: CfnOutput;
  public readonly apiUrl: CfnOutput;

  constructor(
    scope: Construct,
    id: string,
    props: StackStageProps,
  ) {
    super(scope, id, props);

    const cognito = new WiFiSwitcherCognitoStack(
      this,
      'wi-fi-switcher-cognito',
      {
        ...props,
      },
    );
    const apiStack = new WiFiSwitcherApiStack(
      this,
      'wi-fi-switcher-api',
      {
        ...props,
        userPool: cognito.userPool,
        userPoolClient: cognito.userPoolClient,
      },
    );
    const stack = new WiFiSwitcherStack(
      this,
      'wi-fi-switcher',
      {
        ...props,
        api: apiStack.api,
        table: apiStack.table,
      },
    );

    this.distributionId = new CfnOutput(stack, 'DISTRIBUTION_ID', {
      value: stack.distribution.distributionId,
    });
    this.webBucketName = new CfnOutput(stack, 'WEB_BUCKET_NAME', {
      value: stack.webBucket.bucketName,
    });
    this.userPoolRegion = new CfnOutput(stack, 'USER_POOL_REGION', {
      value: cognito.userPool.stack.region,
    });
    this.userPoolId = new CfnOutput(stack, 'USER_POOL_ID', {
      value: cognito.userPool.userPoolId,
    });
    this.userPoolClientId = new CfnOutput(stack, 'USER_POOL_CLIENT_ID', {
      value: cognito.userPoolClient.userPoolClientId,
    });
    this.apiUrl = new CfnOutput(stack, 'API_URL', {
      value: `https://${apiStack.api.apiId}.execute-api.${apiStack.region}.${apiStack.urlSuffix}`,
    });
  }
}

export class WiFiSwitcherPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repo = codecommit.Repository.fromRepositoryName(
      this,
      'repo',
      'wi-fi-switcher',
    ) as codecommit.Repository;

    const pipeline = new CodePipeline(this, 'pipeline', {
      pipelineName: 'Wi-Fi-SwitcherPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.codeCommit(repo, 'main'),
        env: {
          CERT_ARN: this.node.tryGetContext('CERT_ARN') ?? '',
          ZONE_ID: this.node.tryGetContext('ZONE_ID') ?? '',
          ZONE_NAME: this.node.tryGetContext('ZONE_NAME') ?? '',
        },
        commands: [
          'npm ci',
          'npx cdk synth -c "CERT_ARN=${CERT_ARN}" -c "ZONE_ID=${ZONE_ID}" -c "ZONE_NAME=${ZONE_NAME}"',
        ],
      }),
    });

    // Create deployment steps for web assets
    const deployWebCommands = [
      'npm install -g yarn aws-cli',
      '(cd ./web && yarn install --frozen-lockfile && yarn build)',
      '(cd ./web/build && aws s3 sync . "s3://${WEB_BUCKET_NAME}/" --include "*" --delete)',
      'aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" --paths "/*"',
    ];

    // 開発用のDeploy
    const stageApp = new Application(this, 'staging', { stage: 'staging' });
    const stageDeployment = pipeline.addStage(stageApp);
    
    stageDeployment.addPost(new ShellStep('DeployWebAssets', {
      envFromCfnOutputs: {
        DISTRIBUTION_ID: stageApp.distributionId,
        WEB_BUCKET_NAME: stageApp.webBucketName,
        REACT_APP_API_URL: stageApp.apiUrl,
        REACT_APP_AWS_COGNITO_REGION: stageApp.userPoolRegion,
        REACT_APP_AWS_USER_POOLS_ID: stageApp.userPoolId,
        REACT_APP_AWS_USER_POOLS_CLIENT_ID: stageApp.userPoolClientId,
      },
      commands: deployWebCommands,
    }));

    // 本番用のDeploy
    const prodApp = new Application(this, 'prod', { stage: 'prod' });
    const prodDeployment = pipeline.addStage(prodApp, {
      pre: [
        new ShellStep('Approval', {
          commands: ['echo "Deployment to production approved"'],
        }),
      ],
    });
    
    prodDeployment.addPost(new ShellStep('DeployWebAssets', {
      envFromCfnOutputs: {
        DISTRIBUTION_ID: prodApp.distributionId,
        WEB_BUCKET_NAME: prodApp.webBucketName,
        REACT_APP_API_URL: prodApp.apiUrl,
        REACT_APP_AWS_COGNITO_REGION: prodApp.userPoolRegion,
        REACT_APP_AWS_USER_POOLS_ID: prodApp.userPoolId,
        REACT_APP_AWS_USER_POOLS_CLIENT_ID: prodApp.userPoolClientId,
      },
      commands: deployWebCommands,
    }));

    // Add permissions for S3 and CloudFront
    const policyStatement = new iam.PolicyStatement({
      actions: [
        's3:ListAllMyBuckets',
        's3:ListBucket',
        's3:ListObjectsV2',
        's3:PutObject',
        's3:DeleteObject',
        's3:GetObject',
      ],
      resources: ['arn:aws:s3:::*'],
    });

    const cloudfrontPolicyStatement = new iam.PolicyStatement({
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
    });

    // Add these policies to the pipeline role
    pipeline.buildPipeline();
    const pipelineRole = pipeline.pipeline.role;
    pipelineRole.addToPrincipalPolicy(policyStatement);
    pipelineRole.addToPrincipalPolicy(cloudfrontPolicyStatement);
  }
}