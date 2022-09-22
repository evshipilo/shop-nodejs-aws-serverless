import { formatJSONResponse, allowHeaders as headers } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as AWS from 'aws-sdk';

export const importProductsFile = async (event) => {
console.log('importProductsFile run');

const BucketName = process.env.BUCKET_NAME;
const s3 = new AWS.S3({ region: 'eu-west-1' });

  try{ 
    const signedUrl = await s3.getSignedUrl('putObject', {
    Bucket: BucketName,
    Key: `uploaded/${event.queryStringParameters.name}`,
    Expires: 60,
    ContentType: 'text/csv',
  });

  console.log('event.queryStringParameters.name:', event.queryStringParameters.name);
  console.log('BucketName:', BucketName);
  console.log('signedUrl:', signedUrl);


  return formatJSONResponse({
    response: signedUrl,
    statusCode: 200,
    headers,
  });
}
  catch(e){
    console.log('Error', e);

    return formatJSONResponse({
      response: `Error: ${e}`,
      statusCode: 500,
      headers,
    });
  }

 
};

export const main = middyfy(importProductsFile);
