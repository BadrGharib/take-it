import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateItemRequest } from '../../requests/UpdateItemRequest'
import {updateItem} from '../../businessLogic/itemsBussinesLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateItems')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const itemId = event.pathParameters.itemId
  const updatedItem: UpdateItemRequest = JSON.parse(event.body)
  const userId= getUserId(event)
  const newItem = await updateItem(updatedItem, itemId,userId)
  logger.info('updated item: ', newItem)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newItem
    })
  }

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
 // return undefined
}
