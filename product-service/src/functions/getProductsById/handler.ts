import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, allowHeaders as headers } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import productList from '@mocks/productList.json';

import schema from './schema';

export const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
): Promise<any> => {
  try {
    const { productId } = event.pathParameters;
    const productItem = productList.find((el) => el.id === productId);
    console.log('productItem',productItem)
    console.log('productId',productId)
    if (!productItem) {
      throw new Error();
    }
    return formatJSONResponse({ response: productItem, statusCode: 200, headers });
  } catch (e) {
    return formatJSONResponse({ response: 'Product not found', statusCode: 404, headers });
  }
};

export const main = middyfy(getProductsById);
