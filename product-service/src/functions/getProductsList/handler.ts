import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, allowHeaders as headers } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

const { DynamoDB } = require('aws-sdk');
const TableName = process.env.TABLE_NAME;
const db = new DynamoDB.DocumentClient()

export const getProductsList: ValidatedEventAPIGatewayProxyEvent<
  never
> = async (): Promise<any> => {
  try {
    const products = await db
    .scan({
      TableName,
    })
    .promise()

    console.log('Products from DB:', products)
    
    return formatJSONResponse({ response: products.Items, statusCode: 200, headers });
  } catch (e) {
    console.error('Error during database request executing:', e);

    return formatJSONResponse({ response: 'Error during database request executing', statusCode: 500, headers });
  }
};

export const main = middyfy(getProductsList);
