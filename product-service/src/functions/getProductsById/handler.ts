import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, allowHeaders as headers } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const { DynamoDB } = require('aws-sdk');
const TableName = process.env.TABLE_NAME;
const db = new DynamoDB.DocumentClient();

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event): Promise<any> => {
  try {
    const { productId } = event.pathParameters;
    const params = {
      TableName,
      Key: {
        id: productId,
      },
    };
    console.log('productId', productId);
    const data = await db.get(params).promise();
    console.log('productItem', data.Item);
    if (!data.Item) {
      return formatJSONResponse({
        response: 'Product not found',
        statusCode: 404,
        headers,
      });
    }

    return formatJSONResponse({
      response: data.Item,
      statusCode: 200,
      headers,
    });
  } catch (e) {
    console.error('Error during database request executing', e);

    return formatJSONResponse({
      response: 'Error during database request executing',
      statusCode: 500,
      headers,
    });
  }
};

export const main = middyfy(getProductsById);
