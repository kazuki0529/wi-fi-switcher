import * as apigateway from '@aws-cdk/aws-apigatewayv2';
import * as certificate from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';
import { ARecord, PublicHostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { Construct, Stack, StackProps } from '@aws-cdk/core';


export type StackStage = 'staging' | 'prod';

interface WiFiSwitcherStackProps extends StackProps {
  readonly api: apigateway.HttpApi;
  readonly stage: StackStage;
  readonly table: dynamo.Table;
}

export class WiFiSwitcherStack extends Stack {
  public readonly webBucket: s3.Bucket;
  public readonly distribution: cloudfront.CloudFrontWebDistribution;

  constructor(
    scope: Construct, id: string,
    props: WiFiSwitcherStackProps,
  ) {
    super(scope, id, props);

    /**
     * Webコンテンツのリリース先バケット
    **/
    this.webBucket = new s3.Bucket(this, 'web-bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });
    /**
     * CloudFrontを経由しないアクセスは拒否りたいので、OAIを作成する
    **/
    const oai = new cloudfront.OriginAccessIdentity(this, 'web-oai', {
      comment: 's3 access.',
    });
    /**
     * 作成したOAIからのアクセスを許可するポリシー
    **/
    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:GetObject'],
      principals: [new iam.CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      resources: [
        this.webBucket.bucketArn + '/*',
      ],
    });
    this.webBucket.addToResourcePolicy(policy);


    /**
     * CloudFront
    **/
    const hostedZoneId = this.node.tryGetContext('ZONE_ID');
    const zoneName = this.node.tryGetContext('ZONE_NAME');
    const domain = `${(props.stage === 'staging') ? 'dev.': ''}${zoneName}`;
    const fqdn = `game-play.home.${domain}`;
    const certArn = this.node.tryGetContext('CERT_ARN');
    const cert = certArn
      ? certificate.Certificate.fromCertificateArn(this, 'CertificateForTheDomain', certArn)
      : undefined;
    this.distribution = new cloudfront.CloudFrontWebDistribution(this, 'cfn-distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: this.webBucket,
            originAccessIdentity: oai,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      geoRestriction: cloudfront.GeoRestriction.allowlist('JP'),
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      viewerCertificate: cert
        ? cloudfront.ViewerCertificate.fromAcmCertificate(cert, {
          aliases: [fqdn],
        })
        : {
          aliases: [],
          props: {
            cloudFrontDefaultCertificate: true,
          },
        },
    });

    /**
     * Route53へAレコードへ登録
     */
    if (hostedZoneId && zoneName && fqdn) {
      const zone = PublicHostedZone.fromHostedZoneAttributes(
        this,
        'register-public-host-zone',
        {
          hostedZoneId,
          zoneName,
        },
      );
      new ARecord(this, 'register-a-record', {
        zone,
        recordName: fqdn,
        target: RecordTarget.fromAlias(
          new CloudFrontTarget(this.distribution),
        ),
      });
    }

    /**
     * Switcher用のIAMロール作成
     */
    const switcher = new iam.User(this, 'switcher-user', {});
    props.table.grantReadData(switcher);

    // CloudFrontのアクセスURLを出力
    new cdk.CfnOutput(this, 'UiCloudFrontUrl', {
      value: `https://${this.distribution.distributionDomainName}/`,
    });
    new cdk.CfnOutput(this, 'UiAccessUrl', {
      value: `https://${fqdn}/`,
    });
  }
}