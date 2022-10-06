import type { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>

export const formatJSONResponse = (data: Record<string, unknown>) => {
  return {
    body: JSON.stringify(data.response),
    headers: data.headers,
    statusCode: data.statusCode as number,
  }
}

export const allowHeaders = {
  'Access-Control-Allow-Origin': '*',
};
