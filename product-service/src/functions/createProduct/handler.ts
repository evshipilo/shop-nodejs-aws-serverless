import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, allowHeaders as headers } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { yupObject as verify } from '@libs/validate';

const { DynamoDB } = require('aws-sdk');
const TableName = process.env.TABLE_NAME;
const uuid = require('uuid');
const db = new DynamoDB.DocumentClient()

export const createProduct: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event): Promise<any> => {
  await verify.isValid(event.body).then(async (isValid) => {
    if (!isValid) {
      console.log('Product data is invalid', event.body);
      return formatJSONResponse({
        response: 'Product data is invalid',
        statusCode: 400,
        headers,
      });
    }

    const { title, description, price, count } = event.body;

    console.log(
      `POST request: {title: ${title}, description: ${description}, price: ${price}, count: ${count}`
    );

    try {
      const item = { id: uuid.v1(), title, description, price, count };

      console.log('db.put', item)

      await db.put({
        TableName,
        Item: item,
      }).promise();

      return formatJSONResponse({ statusCode: 200, response: item, headers });
    } catch (e) {
      console.error('Error during database request executing', e);

      return formatJSONResponse({
        response: 'Error during database request executing',
        statusCode: 500,
        headers,
      });
    }
  });
};

export const main = middyfy(createProduct);
