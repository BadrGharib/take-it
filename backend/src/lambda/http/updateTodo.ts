import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import {updateTodo} from '../../businessLogic/todos'
import { getUserId } from '../../lambda/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateTodos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId= getUserId(event)
  const newTodo = await updateTodo(updatedTodo, todoId,userId)
  logger.info('updated todo: ', newTodo)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      newTodo
    })
  }

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
 // return undefined
}
