import { formatJSONResponse, allowHeaders as headers } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

 const { DynamoDB } = require('aws-sdk');
 const TableName = process.env.TABLE_NAME;
 const db = new DynamoDB.DocumentClient()

export const deleteItemsFromDB = async () => {

  try {

    console.log('deleteItemsFromDB ---------')
    
    const products = await db
    .scan({
      TableName,
    })
    .promise()

    console.log('get all products from DB----', products);
    

    for(const prod of products.Items){

      console.log('delete product----', prod); 

      await db.delete({
        TableName,
        Key: {id: prod.id},
      }).promise();

      console.log('deleted----');
      
    }

    return formatJSONResponse({ response: 'Deleted siccessfully', statusCode: 200, headers });

    }catch(e){
      console.log('error----', e);
      return formatJSONResponse({ response: 'Error', statusCode: 500, headers });
    }

};

export const main = middyfy(deleteItemsFromDB);
