import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { Item } from '../models/Item'
import {ItemUpdate} from '../models/ItemUpdate'
import { createLogger } from '../utils/logger'
const logger = createLogger('DataLayer')
export class ItemsAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly itemsTable = process.env.ITEMS_TABLE,
    private readonly bucketName= process.env.ITEMS_IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.INDEX_NAME) {
  }

  async getAllItems(): Promise<Item[]> {
  
    logger.info('Getting all Items ')
    const result = await this.docClient.scan({
      TableName: this.itemsTable
    }).promise()
  // const result=  await this.docClient
  // .query({
  //   TableName: this.itemsTable,
  //   IndexName: this.indexName
  //   // KeyConditionExpression: 'userId = :paritionKey',
  //   // ExpressionAttributeValues: {
  //   //   ':paritionKey': userId
  //   // }
  // })
  // .promise()
  logger.info('Total item count',result.Items.length)
    const items = result.Items
    return items as Item[]
  }
  async getMyItems(userId: string): Promise<Item[]> {
  
    logger.info('Getting all Items for userId ',userId)
    // const result = await this.docClient.scan({
    //   TableName: this.itemsTable
    // }).promise()
  const result=  await this.docClient
  .query({
    TableName: this.itemsTable,
    IndexName: this.indexName,
    KeyConditionExpression: 'userId = :paritionKey',
    ExpressionAttributeValues: {
      ':paritionKey': userId
    }
  })
  .promise()
  logger.info('Total item count',result.Items.length)
    const items = result.Items
    return items as Item[]
  }

  async createItem(item: Item): Promise<Item> {
    logger.info('Create new item',item)
  await this.docClient.put({
      TableName: this.itemsTable,
      Item: {
        ...item
        //,
       // attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${item.itemId}.png`
    }}).promise()
 

    return item
  }

  async updateItem(item: ItemUpdate,itemId:string,userId:string): Promise<ItemUpdate> {
    logger.info('Update item',item)
    await this.docClient.update(
      {
        
        TableName: this.itemsTable,
        Key: { "userId":userId, "itemId":itemId},
        UpdateExpression: "set title = :title, info=:info, #statefield=:state, price=:price",
        ExpressionAttributeValues:{
            ":title":item.title,
            ":info":item.info,
            ":state":item.state,
            ":price":item.price
        }
        ,
        ExpressionAttributeNames:{
           "#statefield": "state"
           },
        ReturnValues: "UPDATED_NEW"
      }
    ).promise()
    return item
  }
  async deleteItem(itemId: string,userId: string): Promise<{}> {
    logger.info('delete item itemId: ',itemId)
    await this.docClient.delete({
      TableName:this.itemsTable,
      Key: { "userId":userId, "itemId":itemId}
  }).promise()
    return {}
  }
  async generateUploadUrl(itemId: string,userId: string){
    logger.info('Generate Upload url for itemId: ',itemId)
    const url = await this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: `${itemId}.png`,
      Expires: this.urlExpiration
    })
    await this.docClient.update({
      TableName: this.itemsTable,
      Key: { userId, itemId},
      UpdateExpression: "set imgUrl=:URL",
      ExpressionAttributeValues: {
        ":URL": url.split("?")[0]
      },
      ReturnValues: "UPDATED_NEW"
      })
      .promise();
      logger.info('Url Generated: ',url)
      return url;
    
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
