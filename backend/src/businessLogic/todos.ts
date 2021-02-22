import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import {TodoUpdate} from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import {UpdateTodoRequest} from '../requests/UpdateTodoRequest'

 
const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
 // const userId = getUserId(jwtToken)
  return todoAccess.getAllTodoss(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  //const userId = getUserId(jwtToken)

  return await todoAccess.createTodo({
    todoId:itemId,
    userId: userId,
    name: createTodoRequest.name,
    createdAt:new Date().toISOString(),
    dueDate:createTodoRequest.dueDate,
    done:false,
   // description: createGroupRequest.description,
    //timestamp: new Date().toISOString()
  })
}
export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId:string
): Promise<TodoUpdate> {

    return await todoAccess.updateTodo({
      name: updateTodoRequest.name,
      dueDate:updateTodoRequest.dueDate,
      done:updateTodoRequest.done
    },todoId,userId)

}

export async function deleteTodo(todoId: string,userId: string): Promise<{}> {
  // const userId = getUserId(jwtToken)
   return todoAccess.deleteTodo(todoId,userId)
 }
 export async function generateUploadUrl(todoId: string,userId: string) {
  // const userId = getUserId(jwtToken)
   return todoAccess.generateUploadUrl(todoId,userId)
 }
