import type { AWS } from '@serverless/typescript';
import 'dotenv/config';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  useDotenv: true,
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
        Resource: [`arn:aws:s3:::${process.env.BUCKET_NAME}`],
      },
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: [`arn:aws:s3:::${process.env.BUCKET_NAME}/*`],
      },
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: {
          'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
        },
      },
    ],
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      BUCKET_NAME: process.env.BUCKET_NAME,
      SQS_URL: { Ref: 'catalogItemsQueue' },
    },
  },
  resources: {
    Resources: {
      productsUploadBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: process.env.BUCKET_NAME,
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
          Bucket: process.env.BUCKET_NAME,
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  AWS: '*',
                },
                Action: ['*'],
                Resource: [
                  `arn:aws:s3:::${process.env.BUCKET_NAME}`,
                  `arn:aws:s3:::${process.env.BUCKET_NAME}/*`,
                ],
              },
            ],
          },
        },
      },
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: process.env.SQS_NAME,
        },
      },
      catalogItemsQueuePolicy: {
        Type: 'AWS::SQS::QueuePolicy',
        Properties: {
          Queues: [{ Ref: 'catalogItemsQueue' }],
          PolicyDocument: {
            Statement: [
              {
                Action: ['sqs:*'],
                Effect: 'Allow',
                Resource: '*',
              },
            ],
          },
        },
      },
    },
    Outputs: {
      ImportServiceSQSarn: {
        Value: { 'Fn::GetAtt': ['catalogItemsQueue', 'Arn'] },
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
