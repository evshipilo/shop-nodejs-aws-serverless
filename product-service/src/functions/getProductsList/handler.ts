import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, allowHeaders as headers } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import productList from '@mocks/productList.json';

export const getProductsList: ValidatedEventAPIGatewayProxyEvent<
  never
> = async (): Promise<any> => {
  try {
    return formatJSONResponse({ response: productList, statusCode: 200, headers });
  } catch (e) {
    return formatJSONResponse({ response: 'Product list not found', statusCode: 404, headers });
  }
};

export const main = middyfy(getProductsList);
