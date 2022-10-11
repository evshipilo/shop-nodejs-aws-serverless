import { APIGatewayTokenAuthorizerHandler, APIGatewayAuthorizerResult } from 'aws-lambda';
import { middyfy } from '@libs/lambda';

const basicAuthorizer: APIGatewayTokenAuthorizerHandler = async (event) => {
console.log('basicAuthorizer event-----', event);

  if (event.type !== 'TOKEN' || !event.hasOwnProperty('authorizationToken') || !event.authorizationToken) {
    throw new Error('authorization error');
  }

  try {
    const { authorizationToken } = event || {};

    const encodedCreds = authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');

    const [login, password] = buff.toString('utf-8').split(':');
    console.log(`username: ${login} and password: ${password}`);

    const storedUserPassword = process.env.PASSWORD;
    const storedUserLogin = process.env.LOGIN;
    console.log('stored password ----- ', storedUserPassword, 'login', storedUserLogin);

    const effect = storedUserPassword !== password || storedUserLogin !== login ? 'Deny' : 'Allow';

    console.log('effect-----', effect);

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    console.log('policy-----', policy);

    return policy;
  } catch(e){
    throw new Error('authorization error', e);
  }
};

function generatePolicy(
  principalId: string,
  resource: string,
  effect: 'Allow' | 'Deny' = 'Allow'
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}

export const main = middyfy(basicAuthorizer);
