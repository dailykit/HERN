import React, { useState, useEffect, useRef } from 'react'
import { useSubscription, useMutation, useQuery } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'
import {
   Text,
   ButtonGroup,
   IconButton,
   PlusIcon,
   Tunnels,
   Tunnel,
   useTunnel,
   Flex,
   ComboButton,
   Form,
   Spacer,
   DropdownButton,
   TextButton,
} from '@dailykit/ui'
import {
   CAMPAIGN_LISTING,
   CAMPAIGN_TOTAL,
   CAMPAIGN_ACTIVE,
   DELETE_CAMPAIGN,
} from '../../../graphql'
import { StyledWrapper } from './styled'
import { DeleteIcon } from '../../../../../shared/assets/icons'
import {
   Tooltip,
   InlineLoader,
   InsightDashboard,
   Banner,
} from '../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { logger } from '../../../../../shared/utils'
import options from '../../tableOptions'
import CreateCampaign from '../../../../../shared/CreateUtils/crm/createCampaign'

const CampaignListing = () => {
   const location = useLocation()
   const { addTab, tab } = useTabs()
   const { tooltip } = useTooltip()
   const [campaign, setCampaign] = useState(undefined)
   const tableRef = useRef()
   const [tunnels, openTunnel, closeTunnel] = useTunnel()
   // Subscription
   const { loading: listLoading, error1 } = useSubscription(CAMPAIGN_LISTING, {
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.campaigns.map(campaign => {
            return {
               id: campaign.id,
               name: campaign.metaDetails.title,
               type: campaign.type,
               active: campaign.isActive,
               isvalid: campaign.isCampaignValid.status,
            }
         })
         setCampaign(result)
      },
   })

   const {
      data: campaignTotal,
      loading,
      error2,
   } = useSubscription(CAMPAIGN_TOTAL)

   if (error1 || error2) {
      toast.error('Something went wrong !')
      logger(error1 || error2)
   }

   // Mutation
   const [updateCampaignActive] = useMutation(CAMPAIGN_ACTIVE, {
      onCompleted: () => {
         toast.info('Coupon Updated!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   const [deleteCampaign] = useMutation(DELETE_CAMPAIGN, {
      onCompleted: () => {
         toast.success('Campaign deleted!')
      },
      onError: error => {
         console.log(error)
         toast.error('Could not delete!')
      },
   })

   useEffect(() => {
      if (!tab) {
         addTab('Campaign', location.pathname)
      }
   }, [addTab, tab])

   const toggleHandler = (toggle, id, isvalid) => {
      const val = !toggle
      if (val && !isvalid) {
         toast.error(`Campaign should be valid!`)
      } else {
         updateCampaignActive({
            variables: {
               campaignId: id,
               isActive: val,
            },
         })
      }
   }

   const DeleteButton = () => {
      return (
         <IconButton type="ghost">
            <DeleteIcon color="#FF5A52" />
         </IconButton>
      )
   }

   const ToggleButton = ({ cell }) => {
      const rowData = cell._cell.row.data
      return (
         <Form.Group>
            <Form.Toggle
               name={`campaign_active${rowData.id}`}
               onChange={() =>
                  toggleHandler(rowData.active, rowData.id, rowData.isvalid)
               }
               value={rowData.active}
            />
         </Form.Group>
      )
   }

   // Handler
   const deleteHandler = (e, Campaign) => {
      console.log(Campaign)
      e.stopPropagation()
      if (
         window.confirm(
            `Are you sure you want to delete Campaign - ${Campaign.name}?`
         )
      ) {
         deleteCampaign({
            variables: {
               campaignId: Campaign.id,
            },
         })
      }
   }

   const rowClick = (e, cell) => {
      const { id, name } = cell._cell.row.data
      const param = `${location.pathname}/${id}`
      const tabTitle = name
      addTab(tabTitle, param)
   }

   const columns = [
      {
         title: 'Campaign Name',
         field: 'name',
         headerFilter: true,
         hozAlign: 'left',
         frozen: true,
         width: 300,
         headerTooltip: function (column) {
            const identifier = 'campaign_listing_name_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         cssClass: 'colHover',
         cssClass: 'rowClick',
         cellClick: (e, cell) => {
            rowClick(e, cell)
         },
      },
      {
         title: 'Action',
         field: 'action',
         headerHorzAlign: 'center',
         frozen: true,
         cellClick: (e, cell) => {
            e.stopPropagation()
            deleteHandler(e, cell._cell.row.data)
         },
         formatter: reactFormatter(<DeleteButton />),
         hozAlign: 'center',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'center'
            return '' + cell.getValue()
         },
         width: 100,
      },
      {
         title: 'Campaign Type',
         field: 'type',
         headerFilter: true,
         hozAlign: 'left',
         width: 150,
         headerTooltip: function (column) {
            const identifier = 'campaign_listing_type_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Active',
         field: 'active',
         formatter: reactFormatter(<ToggleButton />),
         hozAlign: 'left',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'left'
            return '' + cell.getValue()
         },
         width: 150,
         headerTooltip: function (column) {
            const identifier = 'campaign_listing_active_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]
   const downloadCsvData = () => {
      tableRef.current.table.download('csv', 'campaign_table.csv')
   }

   const downloadPdfData = () => {
      tableRef.current.table.downloadToTab('pdf', 'campaign_table.pdf')
   }

   const downloadXlsxData = () => {
      tableRef.current.table.download('xlsx', 'campaign_table.xlsx')
   }
   const clearCampaignPersistence = () => {
      localStorage.removeItem('tabulator-campaign_table-columns')
      localStorage.removeItem('tabulator-campaign_table-sort')
      localStorage.removeItem('tabulator-campaign_table-filter')
   }

   if (listLoading || loading) return <InlineLoader />
   return (
      <StyledWrapper>
         <Banner id="crm-app-campaigns-listing-top" />
         <Flex
            container
            height="80px"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
            padding="15px 0 0 0"
         >
            <Flex
               container
               as="header"
               width="25%"
               alignItems="center"
               justifyContent="space-between"
            >
               <Text as="title">
                  Campaign(
                  {campaignTotal?.campaignsAggregate?.aggregate?.count || '...'}
                  )
               </Text>
               <Tooltip identifier="campaign_list_heading" />
            </Flex>
            <Flex
               container
               as="header"
               width="75%"
               alignItems="center"
               justifyContent="space-around"
            >
               <Flex
                  container
                  as="header"
                  width="72%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <TextButton
                     onClick={() => {
                        clearCampaignPersistence()
                     }}
                     type="ghost"
                     size="sm"
                  >
                     Clear Persistence
                  </TextButton>
                  <Spacer size="15px" xAxis />
                  <DropdownButton title="Download" width="150px">
                     <DropdownButton.Options>
                        <DropdownButton.Option
                           onClick={() => downloadCsvData()}
                        >
                           CSV
                        </DropdownButton.Option>
                        <DropdownButton.Option
                           onClick={() => downloadPdfData()}
                        >
                           PDF
                        </DropdownButton.Option>
                        <DropdownButton.Option
                           onClick={() => downloadXlsxData()}
                        >
                           XLSX
                        </DropdownButton.Option>
                     </DropdownButton.Options>
                  </DropdownButton>
               </Flex>
               <Flex
                  container
                  as="header"
                  width="28%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <ButtonGroup>
                     <ComboButton type="solid" onClick={() => openTunnel(1)}>
                        <PlusIcon />
                        Create Campaign
                     </ComboButton>
                  </ButtonGroup>
               </Flex>
            </Flex>
         </Flex>
         <Spacer size="20px" />
         {Boolean(campaign) && (
            <ReactTabulator
               columns={columns}
               data={campaign}
               options={{
                  ...options,
                  placeholder: 'No Campaigns Available Yet !',
                  persistenceID: 'campaign_table',
               }}
               ref={tableRef}
               className="crm-campaign"
            />
         )}
         <InsightDashboard
            appTitle="CRM App"
            moduleTitle="Campaign Listing"
            showInTunnel={false}
         />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <CreateCampaign close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="crm-app-campaigns-listing-bottom" />
      </StyledWrapper>
   )
}

export default CampaignListing
