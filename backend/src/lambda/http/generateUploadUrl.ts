import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {generateUploadUrl} from '../../businessLogic/todos'
import { getUserId } from '../../lambda/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const userId= getUserId(event)
  const url =await generateUploadUrl(todoId,userId)
  logger.info('url: ', url)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(
      {
        "uploadUrl": url
      }
    )
  }
}
