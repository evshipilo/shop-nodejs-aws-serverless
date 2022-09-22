import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: ['s3:ListBucket'],
        Resource: ['arn:aws:s3:::products-upload-bucket'],
      },
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: ['arn:aws:s3:::products-upload-bucket/*'],
      },
    ],
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      BUCKET_NAME: { Ref: 'productsUploadBucket' },
    },
  },
  resources: {
    Resources: {
      productsUploadBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'products-upload-bucket',
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
                AllowedOrigins: ['*'],
              },
            ],
          },
        },
      },
      productsUploadBucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          Bucket: 'products-upload-bucket',
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  AWS: '*',
                },
                Action: ['*'],
                Resource: [
                  'arn:aws:s3:::products-upload-bucket',
                  'arn:aws:s3:::products-upload-bucket/*',
                ],
              },
            ],
          },
        },
      },
    },
  },
  functions: { importProductsFile, importFileParser },
  package: { individually: true },
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
};

module.exports = serverlessConfiguration;
