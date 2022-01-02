import * as apigateway from '@aws-cdk/aws-apigateway';
import * as certificate from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as iam from '@aws-cdk/aws-iam';
// import * as route53 from '@aws-cdk/aws-route53';
// import * as targets from '@aws-cdk/aws-route53-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import { Construct, Stack, StackProps } from '@aws-cdk/core';


export type StackStage = 'staging' | 'prod';

interface WiFiSwitcherStackProps extends StackProps {
  readonly api: apigateway.RestApi;
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
    const fqdn = this.node.tryGetContext('FQDN');
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
        {
          customOriginSource: {
            domainName: `${props.api.restApiId}.execute-api.${this.region}.${this.urlSuffix}`,
          },
          behaviors: [
            {
              pathPattern: `${props.api.deploymentStage.stageName}/*`,
              allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
              forwardedValues: {
                headers: ['Content-Type', 'Accept', 'Accept-Encoding', 'Accept-Language', 'Authorization', 'Origin'],
                queryString: true,
              },
              defaultTtl: cdk.Duration.seconds(0),
              maxTtl: cdk.Duration.seconds(0),
              minTtl: cdk.Duration.seconds(0),
            },
          ],
        },
      ],
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
     * デプロイ
    **/
    new s3deploy.BucketDeployment(this, 's3-deploy', {
      sources: [s3deploy.Source.asset('./web/build/')],
      destinationBucket: this.webBucket,
      distribution: this.distribution,
    });

    // CloudFrontのアクセスURLを出力
    new cdk.CfnOutput(this, 'UiCloudFrontUrl', {
      value: `https://${this.distribution.distributionDomainName}/`,
    });
    new cdk.CfnOutput(this, 'UiAccessUrl', {
      value: `https://${fqdn}/`,
    });
  }
}