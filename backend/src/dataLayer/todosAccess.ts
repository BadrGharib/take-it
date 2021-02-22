import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import {TodoUpdate} from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'
const logger = createLogger('DataLayer')
export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName= process.env.TODOS_IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly indexName = process.env.todoIdIndex) {
  }

  async getAllTodoss(userId: string): Promise<TodoItem[]> {
  
    logger.info('Getting all Todos for userId ',userId)
    // const result = await this.docClient.scan({
    //   TableName: this.todosTable
    // }).promise()
  const result=  await this.docClient
  .query({
    TableName: this.todosTable,
    IndexName: this.indexName,
    KeyConditionExpression: 'userId = :paritionKey',
    ExpressionAttributeValues: {
      ':paritionKey': userId
    }
  })
  .promise()
  logger.info('Total todo count',result.Items.length)
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Create new todo',todo)
  await this.docClient.put({
      TableName: this.todosTable,
      Item: {
        ...todo
        //,
       // attachmentUrl: `https://${this.bucketName}.s3.amazonaws.com/${todo.todoId}.png`
    }}).promise()
 

    return todo
  }

  async updateTodo(todo: TodoUpdate,todoId:string,userId:string): Promise<TodoUpdate> {
    logger.info('Update todo',todo)
    await this.docClient.update(
      {
        
        TableName: this.todosTable,
        Key: { "userId":userId, "todoId":todoId},
        UpdateExpression: "set #namefield = :name, dueDate=:dueDate, done=:done",
        ExpressionAttributeValues:{
            ":name":todo.name,
            ":dueDate":todo.dueDate,
            ":done":todo.done
        },
        ExpressionAttributeNames:{
           "#namefield": "name"
           },
        ReturnValues: "UPDATED_NEW"
      }
    ).promise()
    return todo
  }
  async deleteTodo(todoId: string,userId: string): Promise<{}> {
    logger.info('delete todo todoId: ',todoId)
    await this.docClient.delete({
      TableName:this.todosTable,
      Key: { "userId":userId, "todoId":todoId}
  }).promise()
    return {}
  }
  async generateUploadUrl(todoId: string,userId: string){
    logger.info('Generate Upload url for todoId: ',todoId)
    const url = await this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: `${todoId}.png`,
      Expires: this.urlExpiration
    })
    await this.docClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId},
      UpdateExpression: "set attachmentUrl=:URL",
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
