import React, {useRef, useState} from 'react';
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {ACTIVE_EVENTS_WEBHOOKS, DELETE_WEBHOOK_EVENT } from '../../../../graphql';
import {logger}  from '../../../../../../shared/utils'
import {Flex, Text, ButtonGroup, ComboButton, PlusIcon, useTunnel, Spacer, Dropdown, TextButton} from '@dailykit/ui';
import { toast } from 'react-toastify'
import AddWebHook from '../../../../tunnels/addWebhookTunnel';
import options from '../../../tableOptions'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useWebhook } from '../state';
import {DeleteIcon} from '../../../../../../shared/assets/icons'
// third party imports
import { useTranslation } from 'react-i18next'
import { Wrapper } from './styled'
const address = 'apps.developer.views.listings.webhookslisting.'



const WebhookListing = ()=>{

    const { t } = useTranslation()

    const {state, dispatch} = useWebhook()

    // Mutation for deleting webhook
    const [deleteWebhook, {loading: deletingWebhookLoading}] = useMutation(DELETE_WEBHOOK_EVENT);

    const [tunnels, openTunnel, closeTunnel] = useTunnel(2)

    const tableRef = useRef()

    const [webhookEvents, setWebhookEvents] = useState([])

    const [groupByState, setGroupByState] = useState({'groups': [localStorage.getItem('tabulator-webhook_table-group')]})

    

    // Query to fetch active webhook events
    const { data, loading, error } = useSubscription(ACTIVE_EVENTS_WEBHOOKS, {
       onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
          const eventsData = data.developer_webhookUrl_events.map(item=>{
             const newData = {
                "id": item.id,
                "eventLabel": item.availableWebhookEvent.label,
                "url": item.webhookUrl.urlEndpoint,
                "advanceConfig": item.advanceConfig,
                "headers": item.headers
             }
             return newData
          })
         setWebhookEvents(eventsData)
       },
      })

    if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   

    const webhookUrl_eventsCount = webhookEvents?.length


   const rowClick = (e, cell) => {

      const { id } = cell._cell.row.data
      const webhookUrl_EventLabel = cell._cell.row.data.eventLabel
      const webhookUrlEndpoint = cell._cell.row.data.url
      const advanceConfig = cell._cell.row.data.advanceConfig
      const headers = cell._cell.row.data.headers
      const headers_list = []
      for (const header in headers){
         headers_list.push({
            'id': header,
            'key': header,
            'value': headers[header]
         })
      }
      const payload = {
         "webhookUrl_EventId": id,
         "webhookUrl_EventLabel": webhookUrl_EventLabel,
         "webhookUrlEndpoint":webhookUrlEndpoint,
         "advanceConfig": advanceConfig,
         "headers": headers_list
      }
      dispatch({type:'SET_WEBHOOK_DETAILS', payload:payload})
      dispatch({type:'SET_DELETE_FUNCTION', payload:deleteEvent})

   }

    
    // To delete Webhook
    function deleteEvent(eventId){
        deleteWebhook({
            variables:{
                "eventId":eventId
            },
            onCompleted : (data) => {
                console.log('request completed')
                toast.success('webhook successfully deleted')
                console.log(data)
            },
            onError : (error) =>{

                toast.error('Something went wrong')
                logger(error)
            }
        })
    }

    const columns = [
       
      {
         title: 'Events',
         field: 'eventLabel',
         headerFilter: true,
         hozAlign: 'left',
         resizable:true,
         headerSort:true,
         frozen: true,
         cssClass: 'rowClick',
         cellClick: (e, cell) => {
            rowClick(e, cell)
         },
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
               deleteEvent(cell._cell.row.data.id)
               dispatch({type:'SET_WEBHOOK_DETAILS', payload:{
                  webhookDetails: {
                     "webhookUrl_EventId":undefined,
                     "webhookUrl_EventLabel": undefined,
                     "webhookUrlEndpoint":undefined,
                     "advanceConfig":undefined
                  },
                  deleteFunction:undefined
               }})
            }
            
         },
         cssClass: 'rowClick',
         headerTooltip: true
      },
      {
         title: 'Url',
         field: 'url',
         headerFilter: true,
         hozAlign: 'left',
         resizable:true,
         headerSort:true,
         cssClass: 'rowClick',
         headerTooltip: true
      }
   ]

   const groupByOptions = [
      { id: 1, title: 'Events', payload: 'eventLabel' },
      { id: 2, title: 'Url', payload: 'url' },
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
      const webhookGroup = localStorage.getItem(
         'tabulator-webhook_table-group'
      )
      const webhookGroupParse =
         webhookGroup !== undefined &&
         webhookGroup !== null &&
         webhookGroup.length !== 0
            ? JSON.parse(webhookGroup)
            : null
      tableRef.current.table.setGroupBy(
         webhookGroupParse !== null && webhookGroupParse.length > 0
            ? webhookGroupParse
            : []
      )

      tableRef.current.table.setGroupHeader(function (
         value,
         count,
         data1,
         group
      ) {
         let newHeader
         console.log('group header', group._group.field)
         switch (group._group.field) {
            case 'eventLabel':
               newHeader = 'Events'
               break
            case 'url':
               newHeader = 'Endpoint Urls'
               break
            default:
               break
         }
         return `${newHeader} - ${value} || ${count} Webhooks`
      })
   }

   const clearWebhookPersistance = () => {
      localStorage.removeItem('tabulator-webhook_table-group')
      tableRef.current.table.setGroupBy([])
   }

    return (
       <Wrapper>
            <AddWebHook tunnels={tunnels} openTunnel={openTunnel} closeTunnel={closeTunnel} />
                  <Flex container alignItems="center" justifyContent="space-between">
                     <Flex container height="80px" alignItems="center">
                        <Text as="h2">
                        {/* {t(address.concat('webhook'))} */}
                        Webhooks
                           (
                           {webhookUrl_eventsCount || '...'})
                        </Text>
                        {/* <Tooltip identifier="coupon_list_heading" /> */}
                     </Flex>
                     <ButtonGroup>
                        <ComboButton type="solid" 
                        onClick={()=>openTunnel(1)}
                        >
                           <PlusIcon color="#fff" />
                           Add Webhook
                        </ComboButton>
                     </ButtonGroup>
                  </Flex>
                  <ActionBar
                     title="webhook"
                     groupByOptions={groupByOptions}
                     handleGroupBy={handleGroupBy}
                     clearPersistance={clearWebhookPersistance}
                  />
                  {Boolean(webhookEvents) && (
                     <ReactTabulator
                     ref={tableRef}
                        columns={columns}
                        dataLoaded={dataLoaded}
                        data={webhookEvents}
                        options={{
                           ...options,
                           placeholder: 'No Webhooks Available Yet !',
                           persistenceID : 'webhooks_table',
                           reactiveData: true,
                           selectable: true,
                        }}
                        
                        className = 'developer-webhooks'
                     />
                  )}
        </Wrapper>

    )

}

const ActionBar = ({
   title,
   groupByOptions,
   handleGroupBy,
   clearPersistance})=>{
   
      const defaultIDs = () => {
         let arr = []
         const webhookGroup = localStorage.getItem(
            'tabulator-webhook_table-group'
         )
         const webhookGroupParse =
            webhookGroup !== undefined &&
            webhookGroup !== null &&
            webhookGroup.length !== 0
               ? JSON.parse(webhookGroup)
               : null
         if (webhookGroupParse !== null) {
            console.log(webhookGroupParse, "yo")
            webhookGroupParse.forEach(x => {
               const foundGroup = groupByOptions.find(y => y.payload == x)
               arr.push(foundGroup.id)
            })
         }
         return arr.length == 0 ? [] : arr
      }

      const selectedOption = option => {
         localStorage.setItem(
            'tabulator-webhook_table-group',
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
                     Clear Persistence
                  </TextButton>
         </Flex>
      )
}

export default WebhookListing

