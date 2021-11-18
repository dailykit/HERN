import React, {useRef, useState} from 'react';
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {Flex, Text, ButtonGroup, ComboButton, PlusIcon, useTunnel, Spacer, Dropdown, TextButton, Toggle, Form} from '@dailykit/ui';
import {GET_ALL_API_KEYS, DELETE_API_KEY, UPDATE_API_KEY} from '../../../../graphql'
import {logger}  from '../../../../../../shared/utils'
import { toast } from 'react-toastify'
import {StyledWrapper} from './styled'
import { Loader } from '@dailykit/ui';
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import options from '../../../tableOptions'
import {DeleteIcon} from '../../../../assets/icons'
import {AddApiKeyTunnel} from '../../../Forms/ApiKey/tunnels';
import { useApiKey } from '../state';
import {PublishIcon, UnPublishIcon} from '../../../../assets/icons'


const ApiKeyListing = ()=>{

    const {state, dispatch} = useApiKey()

    const [apiKeys, setApiKeys] = useState([])

    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

    const tableRef = useRef()

    const [groupByState, setGroupByState] = useState({'groups': [localStorage.getItem('tabulator-apiKey_table-group')]})

    const [deleteApiKey, {loading: deletingApiKeyLoading}] = useMutation(DELETE_API_KEY);

    const { data, loading, error } = useSubscription(GET_ALL_API_KEYS, {
        onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
           const apiKeyData = data.developer_apiKey.map(item=>{
              const newData = {
                 "apiKey": item.apiKey,
                 "canAddProducts": item.canAddProducts,
                 "canUpdateProducts": item.canUpdateProducts,
                 "activationStatus": !item.isDeactivated,
                 "created_at": item.created_at,
                 "updated_at": item.updated_at,
                 "label": item.label
              }
              return newData
           })
          setApiKeys(apiKeyData)
        },
       })
 
     if (error) {
       toast.error('Something went wrong')
       logger(error)
    }

    const apiKeysCount = apiKeys?.length

    const rowClick = (e, cell) => {

      const details = {
         "label": cell._cell.row.data.label,
         "apiKey": cell._cell.row.data.apiKey,
         "activationStatus":cell._cell.row.data.activationStatus
      }
      const permissions = [
         {"canAddProducts": {"label": "Add Products", value: cell._cell.row.data.canAddProducts}},
         {"canUpdateProducts": {"label": "Update Products", value: cell._cell.row.data.canUpdateProducts}}
      ]
      dispatch({type:'SET_API_KEY_SELECTED', payload:true})
      dispatch({type:'SET_API_KEY_DETAILS', payload:details})
      dispatch({type:'SET_API_KEY_PERMISSIONS', payload:permissions})
      dispatch({type:'SET_API_KEY_DELETE_FUNCTION', payload:deleteApiKey})

   }

    const columns = [
       
        {
           title: 'Label',
           field: 'label',
           headerFilter: true,
           hozAlign: 'left',
           resizable:true,
           cellClick: (e, cell) => {
            rowClick(e, cell)
         },
           headerSort:true,
           headerTooltip: true
        },
        {
            title: 'Api Key',
            field: 'apiKey',
            headerFilter: true,
            hozAlign: 'left',
            resizable:true,
            cellClick: (e, cell) => {
               rowClick(e, cell)
            },
            headerSort:true,
            headerTooltip: true
         },
        {
           title: 'Action',
           field: 'Action',
           hozAlign: 'center',
           resizable:true,
           formatter:reactFormatter(<DeleteIcon />),
           cellClick: (e, cell) => {
              if (window.confirm("Are you sure you wan to delete this webhook ?")){
                deleteApiKey({
                    variables: {
                        "apiKey": cell._cell.row.data.apiKey
                    }
                })
                dispatch({type:'SET_API_KEY_SELECTED', payload:false})
              }
           },
           headerTooltip: true
        },
        {
            title: 'Active',
            field: 'activationStatus',
            headerFilter: true,
            hozAlign: 'center',
            resizable:true,
            width: 100,
            formatter: reactFormatter(<StatusIcon />),
            headerSort:true,
            headerTooltip: true,
            editor: true
        }
     ]

    const groupByOptions = [
        { id: 1, title: 'Active', payload: 'activationStatus' }
    ]

    const handleGroupBy = value => {
        setGroupByState(
           {
              groups: value,
           }
        )
        tableRef.current.table.setGroupBy(value)
    }

    const dataLoaded = () => {
        const apiKeyGroup = localStorage.getItem(
           'tabulator-apiKey_table-group'
        )
        const apiKeyGroupParse =
           apiKeyGroup !== undefined &&
           apiKeyGroup !== null &&
           apiKeyGroup.length !== 0
              ? JSON.parse(apiKeyGroup)
              : null
        tableRef.current.table.setGroupBy(
           apiKeyGroupParse !== null && apiKeyGroupParse.length > 0
              ? apiKeyGroupParse
              : []
        )
  
        tableRef.current.table.setGroupHeader(function (
           value,
           count,
           data1,
           group
        ) {
           let newHeader
           switch (group._group.field) {
              case 'activationStatus':
                 newHeader = 'Active'
                 break
              default:
                 break
           }
           return `${newHeader} - ${value} || ${count} Api Keys`
        })
    }

    const clearApiKeyPersistance = () => {
        localStorage.removeItem('tabulator-apiKey_table-group')
        tableRef.current.table.setGroupBy([])
        setGroupByState(
           {
              groups: [],
           }
        )
     }

     if (deletingApiKeyLoading){
        return <Loader />
     }


    return (
        <>
        <StyledWrapper>
        <AddApiKeyTunnel tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} />
            
                <Flex container alignItems="center" justifyContent="space-between">
                     <Flex container height="80px" alignItems="center">
                        <Text as="h2">
                        {/* {t(address.concat('apiKeys'))} */}
                        Api Keys
                           (
                           {apiKeysCount || '...'})
                        </Text>
                        {/* <Tooltip identifier="coupon_list_heading" /> */}
                     </Flex>
                     <ButtonGroup>
                        <ComboButton type="solid" 
                        onClick={()=>openTunnel(1)}
                        >
                           <PlusIcon color="#fff" />
                           Add Api Key
                        </ComboButton>
                     </ButtonGroup>
                  </Flex>
                  <ActionBar
                     title="apiKey"
                     groupByOptions={groupByOptions}
                     handleGroupBy={handleGroupBy}
                     clearPersistance={clearApiKeyPersistance}
                  />
                  <Spacer size="40px" />
                  {apiKeys? (
                     <ReactTabulator
                     ref={tableRef}
                        columns={columns}
                        dataLoaded={dataLoaded}
                        data={apiKeys}
                        options={{
                           ...options,
                           maxHeight: "75%",
                           placeholder: 'No Api Key Available Yet !',
                           persistenceID : 'apiKey_table',
                           reactiveData: true,
                           selectable: true,
                        }}
                        
                        className = 'developer-apiKey'
                     />
                  ):<Loader/>}
            </StyledWrapper>
        </>
    )
}


const ActionBar = ({
    title,
    groupByOptions,
    handleGroupBy,
    clearPersistance})=>{
    
       const defaultIDs = () => {
          let arr = []
          const apiKeyGroup = localStorage.getItem(
             'tabulator-apiKey_table-group'
          )
          const apiKeyGroupParse =
             apiKeyGroup !== undefined &&
             apiKeyGroup !== null &&
             apiKeyGroup.length !== 0
                ? JSON.parse(apiKeyGroup)
                : null
          if (apiKeyGroupParse !== null) {
             apiKeyGroupParse.forEach(x => {
                const foundGroup = groupByOptions.find(y => y.payload == x)
                arr.push(foundGroup.id)
             })
          }
          return arr.length == 0 ? [] : arr
       }
 
       const selectedOption = option => {
          localStorage.setItem(
             'tabulator-apiKey_table-group',
             JSON.stringify(option.map(val => val.payload))
          )
          const newOptions = option.map(x => x.payload)
          handleGroupBy(newOptions)
       }
 
       const searchedOption = option => console.log(option)
 
       return (
          <Flex container alignItems="center">
             <Text as="text1">Group By:</Text>
             <Spacer size="30px" xAxis />
             <Dropdown
                type="multi"
                variant="revamp"
                disabled={true}
                options={groupByOptions}
                searchedOption={searchedOption}
                selectedOption={selectedOption}
                defaultIds={defaultIDs()}
                typeName="cuisine"
             />
             <TextButton
                      onClick={() => {
                         clearPersistance()
                      }}
                      type="ghost"
                      size="sm"
                   >
                      Clear
                   </TextButton>
          </Flex>
       )
 }

 const StatusIcon = ({cell})=>{
   const data = cell.getData()
   return (
      <>
         {data.activationStatus==true ? <PublishIcon /> : <UnPublishIcon />}
      </>
   
   )
}

 const ToggleCheck = ({cell, apiKeys, setApiKeys, updateApiKey, type}) => {
   const apiKey = cell._cell.row.data.apiKey
   const toggleName = type + "-" + apiKey
   var value
   if (type=="activationStatus"){
      value = cell._cell.row.data.activationStatus
   }
   if (type=="canAddProducts"){
      value = cell._cell.row.data.canAddProducts
   }
   if (type=="canUpdateProducts"){
      value = cell._cell.row.data.canUpdateProducts
   }

   return (
      <>
         <Form.Group>
            <Form.Toggle
            name={toggleName}
            onChange={e => {
               const newApiKeys = apiKeys.map(item=>{
                  if (item.apiKey==apiKey){
                     if (type=="activationStatus"){
                        item.activationStatus = !item.activationStatus
                     }
                     if (type=="canAddProducts"){
                        item.canAddProducts = !item.canAddProducts
                     }
                     if (type=="canUpdateProducts"){
                        item.canUpdateProducts = !item.canUpdateProducts
                     }
                     
                     updateApiKey({
                        variables: {
                           "apiKey": item.apiKey,
                           "canAddProducts":item.canAddProducts,
                           "canUpdateProducts": item.canUpdateProducts,
                           "isDeactivated": !item.activationStatus
                        }
                     })
                  }
                  return item
               })
               setApiKeys(newApiKeys)
            }}
            value={value}
            size={40}
            >
            </Form.Toggle>
         </Form.Group>
      </>
   )
 }


export default ApiKeyListing