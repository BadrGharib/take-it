import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, patchItem,getMyItems } from '../api/items-api'
import Auth from '../auth/Auth'
import { Item } from '../types/Item'

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  items: Item[]
  loadingItems: boolean,
  isAllItem:boolean
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    items: [],
    loadingItems: true,
    isAllItem:true
  }

  // handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   this.setState({ newItemName: event.target.value })
  // }

  onEditButtonClick = (itemId: string,pos:number) => {
    this.props.history.push(`/items/${itemId}/edit`)
    this.props.history.push({
      pathname: `/items/${itemId}/edit`,
      state: { ...this.state.items[pos] }
    })
  }

  onItemCreate = async () => {
    this.props.history.push(`/items/add`)
    // try {
    //   const dueDate = this.calculateDueDate()
    //   const newItem = await createItem(this.props.auth.getIdToken(), {
    //     name: this.state.newItemName,
    //     dueDate
    //   })
    //   this.setState({
    //     items: [...this.state.items, newItem],
    //     newItemName: ''
    //   })
    // } catch {
    //   alert('Item creation failed')
    // }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        items: this.state.items.filter(item => item.itemId != itemId)
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  // onItemCheck = async (pos: number) => {
  //   try {
  //     const item = this.state.items[pos]
  //     debugger;
  //     await patchItem(this.props.auth.getIdToken(), item.itemId, {
  //       title: item.title,
  //       info: item.info,
  //       state: !item.state,
  //       price:item.price
  //     })
  //     this.setState({
  //       items: update(this.state.items, {
  //         [pos]: { state: { $set: !item.state } }
  //       })
  //     })
  //   } catch {
  //     alert('Item Update failed')
  //   }
  // }
  handelAllItemsCliked=async()=>{
   this.setState({isAllItem:true})
   await this.getAllItems()
  }
  handelYourItemCliked=async()=>{
    this.setState({isAllItem:false})
    await this.getMyItems()
  }

  async componentDidMount() {
   await this.getAllItems()
  }
  getAllItems=async()=>{
    try {
      this.setState({
        items:[],
        loadingItems: true
      })
      const items = await getItems(this.props.auth.getIdToken())
      debugger;
      this.setState({
        items,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }
  getMyItems=async()=>{
    try {
      this.setState({
        items:[],
        loadingItems: true
      })
      const items = await getMyItems(this.props.auth.getIdToken())
      debugger;
      this.setState({
        items,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Sell Anything</Header>
        
        {this.renderCreateItemInput()}
        <div style={{display:'flex',justifyContent:'center',alignContent:'center'}}>
          <Button.Group>
            <Button positive={this.state.isAllItem?true:false} onClick={this.handelAllItemsCliked}>All Items</Button>
            <Button.Or />
            <Button positive={this.state.isAllItem?false:true}  onClick={this.handelYourItemCliked}>Your Items</Button>
          </Button.Group>
        </div>
        
        {this.renderItems()}
      </div>
    )
  }

  renderCreateItemInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
        <Button onClick={this.onItemCreate} primary>Add New Item</Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderItems() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return this.renderItemsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading ITEMS
        </Loader>
      </Grid.Row>
    )
  }

  renderItemsList() {
    return (
      <Grid padded>
        {this.state.items.map((item, pos) => {
          debugger;
          return (
            <Grid.Row key={item.itemId}>
              <Grid.Column width={1} verticalAlign="middle">
                {
                  item.state ?
                  <Icon name="dont" />
                  :
                  <Icon name="shopping cart" />
                }
                {/* <Checkbox
                  onChange={() => this.onItemCheck(pos)}
                  checked={item.state}
                /> */}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {item.title}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                {`${item.price} $`}
              </Grid.Column>
              <Grid.Column width={this.state.isAllItem ?6:4} verticalAlign="middle">
                {item.info}
              </Grid.Column>
              {item.imgUrl && (
                <Image src={item.imgUrl} size="small" wrapped />
              )}
              {
                this.state.isAllItem ===false 
                &&
                <>
                <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(item.itemId,pos)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onItemDelete(item.itemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              </>
              }
              
              
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
