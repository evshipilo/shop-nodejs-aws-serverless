import { middyfy } from '@libs/lambda';
import { SQSEvent } from 'aws-lambda';
import { Product } from 'src/models/product';

 const { DynamoDB, SNS } = require('aws-sdk');
 const uuid = require('uuid');

export const catalogBatchProcess = async (event: SQSEvent) => {

  const TableName = process.env.TABLE_NAME;
  const SNS_ARN = process.env.SNS_ARN

  const db = new DynamoDB.DocumentClient()
  const sns = new SNS({ region: 'eu-west-1' });

  try {

    console.log('catalogBatchProcess event ---------',event)

    for(const prod of event.Records){

      let result = prod.body.replace('\ufeff', '')

      const {count, price, title, description} = JSON.parse(result)

      const item: Product = {id: uuid.v1(), count: +count, price: +price, title, description};

      console.log('add product to db----', prod); 


      await db.put({
        TableName,
        Item: item,
      }).promise();

      console.log('added----', item);
    }

    sns.publish(
      {
        Subject: 'Products uploaded',
        Message: 'New products uploaded',
        TopicArn: SNS_ARN,
      },
      () => {
        console.log('Email send');
      }
    );

    }catch(e){
      console.log('error----', e);
    }

};

export const main = middyfy(catalogBatchProcess);
