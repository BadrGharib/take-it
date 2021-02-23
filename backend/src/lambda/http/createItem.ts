import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateItemRequest } from '../../requests/CreateItemRequest'
import {createItem} from '../../businessLogic/itemsBussinesLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('CreateItem')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newItem: CreateItemRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item
  logger.info('Processing event: ', event)
  const userId= getUserId(event)

  const item = await createItem(newItem, userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}