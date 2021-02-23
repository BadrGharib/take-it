import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {deleteItem} from '../../businessLogic/itemsBussinesLogic'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteItem')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const itemId = event.pathParameters.itemId
  const userId= getUserId(event)
  await deleteItem(itemId,userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ })
  }
}
