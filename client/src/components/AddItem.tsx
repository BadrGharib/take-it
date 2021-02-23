import * as React from 'react'
import { Form, Button, Input, Label, Checkbox } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile,createItem,patchItem } from '../api/items-api'
import {Location} from 'history'
import {Item} from '../types/Item'


enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface AddItemProps {
//   match: {
//     params: {
//       todoId: string
//     }
//   }
  auth: Auth,
  location:Location<unknown>
}

interface AddItemState {
  file: any
  uploadState: UploadState,
  title: string,
  info: string,
  price: string,
  selectedItem: any
  state:boolean
}

export class AddItem extends React.PureComponent<
  AddItemProps,
  AddItemState
> {
  state: AddItemState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    title: '',
    info: '',
    price: '',
    selectedItem: '',
    state:false
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }
  handelTitleChange=(e: React.ChangeEvent<HTMLInputElement>)=>{
    this.setState({title:e.target.value})
  }
  handelInfoChange=(e: React.FormEvent<HTMLTextAreaElement>,data:any)=>{
    this.setState({info:data.value})
    
  }
  handelPriceChange=(e: React.ChangeEvent<HTMLInputElement>)=>{
    this.setState({price:e.target.value})
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    if(this.state.selectedItem ===''){
      await this.addNewItem()
    }
    else{
        await this.UpdateItem()
    }

    
  }
  addNewItem= async()=>{
    try {
        if (!this.state.file) {
          alert('File should be selected')
          return
        }
  
        this.setUploadState(UploadState.FetchingPresignedUrl)
        debugger;
        const newItem= await createItem(this.props.auth.getIdToken(),{
          title: this.state.title,
          info: this.state.info,
          price: this.state.price
        } )
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newItem.itemId)
  
        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)
  
        alert('new Item Added Successfully!')
      } catch (e) {
        alert('Could not upload a file: ' + e.message)
      } finally {
        this.setUploadState(UploadState.NoUpload)
      }

  }
  UpdateItem= async()=>{
    try {
        this.setUploadState(UploadState.FetchingPresignedUrl)
       
        if (this.state.file) {
            const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.state.selectedItem.itemId)
            this.setUploadState(UploadState.UploadingFile)
            await uploadFile(uploadUrl, this.state.file)
          }
    
        
        await patchItem(this.props.auth.getIdToken(),this.state.selectedItem.itemId,{
          title: this.state.title,
          info: this.state.info,
          price: this.state.price,
          state:this.state.state
        } )

       

        alert('Item Updated Successfully!')
      } catch (e) {
        alert('Could update item: ' + e.message)
      } finally {
        this.setUploadState(UploadState.NoUpload)
      }
      
}

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }
  async componentDidMount() {
    try {
        debugger;
     if(this.props.location.state){
         try {
            let cItem=this.convertToItem(this.props.location.state)
            this.setState({selectedItem:cItem,title:cItem.title,price:cItem.price,info:cItem.info,state:cItem.state})
         } catch (error) {
             
         }
        

     }
    
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }
  
  
   convertToItem=(data: unknown): Item =>{
    type Types = "string" | "number" | "boolean";
    const keyValidators: Record<keyof Item, Types> = {
        itemId: "string",
        title: "string",
        createdAt: "string",
        info: "string",
        price: "string",
        imgUrl: "string",
        state:"boolean"
    }
    if (typeof data === 'object' && data !== null) {
      let maybeA = data as Item
      for (const key of Object.keys(keyValidators) as Array<keyof Item>) {
        if (typeof maybeA[key] !== keyValidators[key]) {
          throw new Error('data is not an Item');
        }
      }
      return maybeA;
    }
    throw new Error('data is not an Item');
  
  }
  onItemCheck = async () => {
    this.setState((currentState)=>({state:!currentState.state}))
  }


  render() {
      const {selectedItem}=this.state
    return (
      <div>
        <h1>{selectedItem===''?'Create New Item':'Update Item'}</h1>

        <Form onSubmit={this.handleSubmit}>
        <Form.Input onChange={this.handelTitleChange} value={this.state.title} fluid label='title' placeholder='title' />
        <Form.Field >
          <Input labelPosition='right' type='text' placeholder='Amount'>
            <Label basic>$</Label>
            <input value={this.state.price} onChange={this.handelPriceChange} />
         </Input>
        </Form.Field>
        <Form.TextArea value={this.state.info} onChange={this.handelInfoChange} label='About' placeholder='Tell us more about your item ...' />
        <Form.Field style={{display:'flex'}} >
            {
         selectedItem !=='' 
         &&
             <>
                <span style={{marginRight:'5px'}}>Sold</span>
                <Checkbox
                    onChange={this.onItemCheck}
                    checked={this.state.state}
                    />
             </>
            }
        </Form.Field>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>


          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Updating data</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          {this.state.selectedItem===''?'Add':'Update'}
        </Button>
      </div>
    )
  }
}
