import React, {useRef, useState} from 'react';
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {Flex, Text, ButtonGroup, ComboButton, PlusIcon, useTunnel, Spacer, Dropdown, TextButton, Toggle} from '@dailykit/ui';
import {GET_ALL_API_KEYS, DELETE_API_KEY} from '../../../graphql'
import {logger}  from '../../../../../shared/utils'
import { toast } from 'react-toastify'
import {StyledWrapper} from './styled'
import { Loader } from '@dailykit/ui';
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import options from '../../tableOptions'
import {DeleteIcon} from '../../../../../shared/assets/icons'
import '../../tableStyle.css'
import AddApiKeyTunnel from '../../../tunnels/addApiKeyTunnel';


export const ApiKeyListing = ()=>{

    const [apiKeys, setApiKeys] = useState([])

    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

    const [activationStatusChecked, setactivationStatusChecked] = useState(true)

    const [canAddProductsChecked, setcanAddProductsChecked] = useState(false)

    const [canUpdateProductsChecked, setcanUpdateProductsChecked] = useState(false)



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

    const delete_apiKey = (apiKey)=>{
        deleteApiKey({
            variables: {
                "apiKey": apiKey
            }
        })
    }

    const apiKeysCount = apiKeys?.length

    const columns = [
       
        {
           title: 'Label',
           field: 'label',
           headerFilter: true,
           hozAlign: 'left',
           resizable:true,
           headerSort:true,
           frozen: true,
           headerTooltip: true
        },
        {
            title: 'Api Key',
            field: 'apiKey',
            headerFilter: true,
            hozAlign: 'left',
            resizable:true,
            headerSort:true,
            frozen: true,
            headerTooltip: true
         },
        {
           title: 'Action',
           field: 'Action',
           hozAlign: 'center',
           resizable:true,
           frozen: true,
           formatter:reactFormatter(<DeleteIcon />),
           cellClick: (e, cell) => {
              if (window.confirm("Are you sure you wan to delete this webhook ?")){
                deleteApiKey({
                    variables: {
                        "apiKey": cell._cell.row.data.apiKey
                    }
                })
              }
              
           },
           cssClass: 'rowClick',
           headerTooltip: true
        },
        {
            title: 'Active',
            field: 'activationStatus',
            headerFilter: true,
            hozAlign: 'center',
            resizable:true,
            width: 100,
            formatter:reactFormatter(
                <Toggle
                checked={activationStatusChecked}
                setChecked={setactivationStatusChecked}
                />
            ),
            headerSort:true,
            headerTooltip: true
        },
        {
           title: 'Permissions',
           width: 300,
           hozAlign: 'center',
           columns: [
                {
                    title: 'Add Product',
                    field: 'canAddProducts',
                    headerFilter: true,
                    hozAlign: 'center',
                    resizable:true,
                    formatter:reactFormatter(
                        <Toggle
                        checked={canAddProductsChecked}
                        setChecked={setcanAddProductsChecked}
                        />
                    ),
                    headerSort:true,
                    headerTooltip: true
                },
                {
                    title: 'Update Product',
                    field: 'canUpdateProducts',
                    headerFilter: true,
                    hozAlign: 'center',
                    resizable:true,
                    formatter:reactFormatter(
                        <Toggle
                        checked={canUpdateProductsChecked}
                        setChecked={setcanUpdateProductsChecked}
                        />
                    ),
                    headerSort:true,
                    headerTooltip: true
                },
           ]
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


    return (
        <>
        <AddApiKeyTunnel tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} />
            <StyledWrapper>
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