import { formatJSONResponse, allowHeaders as headers } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { S3Event} from 'aws-lambda';
import * as AWS from 'aws-sdk';
import csv from 'csv-parser';

export const importFileParser = async (event: S3Event) => {
  console.log('importFileParser run', JSON.stringify(event.Records));

  const BucketName = process.env.BUCKET_NAME;
  const SQS_URL = process.env.SQS_URL;
  const s3 = new AWS.S3({ region: 'eu-central-1' });
  const sqs = new AWS.SQS();

  let status = 200;

  try {
    for (const record of event.Records) {
      const key = record.s3.object.key;
      console.log('RECORD---------', record);
      console.log('BucketName--------', BucketName);
      console.log('key-------', key);
      const s3Stream = s3
        .getObject({
          Bucket: BucketName,
          Key: key,
        })
        .createReadStream();
      await new Promise((resolve, reject) => {
        console.log('s3Stream------');

        s3Stream
          .pipe(csv())
          .on('data', async(data) => {
            console.log('DATA-----------:', data);
            let res = await sqs
            .sendMessage({
              QueueUrl: SQS_URL,
              MessageBody: JSON.stringify(data),
            })
            .promise();
        console.log('SENDED!!!', res);
          })
          .on('error', (error) => {
            status = 500;
            console.log('error-----------', error);
            reject('ERROR: ' + error);
          })
          .on('end', async () => {
            console.log('Parsed-----------');

            await s3
              .copyObject({
                Bucket: BucketName,
                CopySource: `${BucketName}/${key}`,
                Key: key.replace('uploaded', 'parsed'),
              })
              .promise();

            console.log('Copied-----------');

            await s3
              .deleteObject({
                Bucket: BucketName,
                Key: key,
              })
              .promise();

            console.log('Deleted-----------');

            resolve('parsed!');
          });
      });
    }
  } catch (error) {
    console.log('Stream error', error);
    status = 500;
  }

  return formatJSONResponse({
    response: status === 500 ? 'Error' : 'Done',
    statusCode: status,
    headers,
  });
};

export const main = middyfy(importFileParser);
