import * as uuid from 'uuid'

import { Item } from '../models/Item'
import {ItemUpdate} from '../models/ItemUpdate'
import { ItemsAccess } from '../dataLayer/itemsAccess'
import { CreateItemRequest } from '../requests/CreateItemRequest'
import {UpdateItemRequest} from '../requests/UpdateItemRequest'

 
const itemAccess = new ItemsAccess()

export async function getMyItems(userId: string): Promise<Item[]> {
 // const userId = getUserId(jwtToken)
  return itemAccess.getMyItems(userId)
}
export async function getAllItems(): Promise<Item[]> {
  // const userId = getUserId(jwtToken)
   return itemAccess.getAllItems()
 }

export async function createItem(
    itemRequest: CreateItemRequest,
    userId: string
): Promise<Item> {

  const itemId = uuid.v4()
  //const userId = getUserId(jwtToken)

  return await itemAccess.createItem({
    itemId:itemId,
    userId: userId,
    title: itemRequest.title,
    createdAt:new Date().toISOString(),
    info:itemRequest.info,
    price:itemRequest.price,
   // imgUrl:itemRequest.imgUrl,
    state:false
   // description: createGroupRequest.description,
    //timestamp: new Date().toISOString()
  })
}
export async function updateItem(
  itemRequest: UpdateItemRequest,
  itemId: string,
  userId:string
): Promise<ItemUpdate> {

    return await itemAccess.updateItem({
      title: itemRequest.title,
      info:itemRequest.info,
      price:itemRequest.price,
      state:itemRequest.state
    },itemId,userId)

}

export async function deleteItem(itemId: string,userId: string): Promise<{}> {
  // const userId = getUserId(jwtToken)
   return itemAccess.deleteItem(itemId,userId)
 }
 export async function generateUploadUrl(itemId: string,userId: string) {
  // const userId = getUserId(jwtToken)
   return itemAccess.generateUploadUrl(itemId,userId)
 }
