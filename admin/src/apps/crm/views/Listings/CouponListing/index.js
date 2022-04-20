import React, { useState, useEffect, useRef } from 'react'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { toast } from 'react-toastify'
import { useLocation } from 'react-router-dom'
import {
   Text,
   ButtonGroup,
   IconButton,
   ComboButton,
   PlusIcon,
   Flex,
   Form,
   DropdownButton,
   TextButton,
   Spacer,
   Tunnels,
   Tunnel,
   useTunnel,
} from '@dailykit/ui'
import {
   COUPON_LISTING,
   COUPON_TOTAL,
   UPDATE_COUPON,
   CREATE_COUPON,
   DELETE_COUPON,
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
import { currencyFmt, logger, randomSuffix } from '../../../../../shared/utils'
import options from '../../tableOptions'
import CreateCoupon from '../../../../../shared/CreateUtils/crm/createCoupon'

const CouponListing = () => {
   const location = useLocation()
   const { addTab, tab } = useTabs()
   const { tooltip } = useTooltip()
   const [coupons, setCoupons] = useState(undefined)
   const tableRef = useRef()
   const [couponTunnels, openCouponTunnel, closeCouponTunnel] = useTunnel(1)

   // Subscription
   const { loading: listLoading, error } = useSubscription(COUPON_LISTING, {
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.coupons.map(coupon => {
            return {
               id: coupon.id,
               code: coupon.code,
               used: 'N/A',
               rate: 'N/A',
               amount: 'N/A',
               active: coupon.isActive,
               duration: 'N/A',
               isvalid: coupon.isCouponValid.status,
            }
         })
         setCoupons(result)
      },
   })

   const { data: couponTotal, loading } = useSubscription(COUPON_TOTAL)

   // Mutation
   const [updateCouponActive] = useMutation(UPDATE_COUPON, {
      onCompleted: () => {
         toast.info('Coupon Updated!')
      },
      onError: error => {
         toast.error('Something went wrong !')
         logger(error)
      },
   })
   const [createCoupon] = useMutation(CREATE_COUPON, {
      variables: {
         object: {
            code: `coupon-${randomSuffix()}`,
            visibilityCondition: {
               data: {},
            },
         },
      },
      onCompleted: data => {
         addTab(data.createCoupon.code, `/crm/coupons/${data.createCoupon.id}`)
         toast.success('Coupon created!')
      },
      onError: error => {
         toast.error('Something went wrong !')
         logger(error)
      },
   })

   if (error) {
      toast.error('Something went wrong here !')
      logger(error)
   }

   useEffect(() => {
      if (!tab) {
         addTab('Coupons', location.pathname)
      }
   }, [addTab, tab])

   const toggleHandler = (toggle, id, isvalid) => {
      const val = !toggle
      if (val && !isvalid) {
         toast.error(`Coupon should be valid!`)
      } else {
         updateCouponActive({
            variables: {
               id: id,
               set: {
                  isActive: val,
               },
            },
         })
      }
   }

   const ToggleButton = ({ cell }) => {
      const rowData = cell._cell.row.data
      return (
         <Form.Group>
            <Form.Toggle
               name={`coupon_active${rowData.id}`}
               onChange={() =>
                  toggleHandler(rowData.active, rowData.id, rowData.isvalid)
               }
               value={rowData.active}
            />
         </Form.Group>
      )
   }

   const DeleteButton = () => {
      return (
         <IconButton type="ghost">
            <DeleteIcon color="#FF5A52" />
         </IconButton>
      )
   }

   const [deleteCoupon] = useMutation(DELETE_COUPON, {
      onCompleted: () => {
         toast.success('Coupon deleted!')
      },
      onError: error => {
         console.log(error)
         toast.error('Could not delete!')
      },
   })

   // Handler
   const deleteHandler = (e, coupon) => {
      e.stopPropagation()
      if (
         window.confirm(
            `Are you sure you want to delete Coupon - ${coupon.code}?`
         )
      ) {
         deleteCoupon({
            variables: {
               id: coupon.id,
            },
         })
      }
   }

   const rowClick = (e, cell) => {
      const { id, code } = cell._cell.row.data
      const param = `${location.pathname}/${id}`
      const tabTitle = code
      addTab(tabTitle, param)
   }

   const columns = [
      {
         title: 'Coupon Code',
         field: 'code',
         headerFilter: true,
         hozAlign: 'left',
         frozen: true,
         cssClass: 'rowClick',
         width: 300,
         cellClick: (e, cell) => {
            rowClick(e, cell)
         },
         headerTooltip: function (column) {
            const identifier = 'coupon_listing_code_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         cssClass: 'colHover',
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
         title: 'Used',
         field: 'used',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'coupon_listing_used_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 100,
      },
      {
         title: 'Conversion Rate',
         field: 'rate',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'coupon_listing_conversion_rate_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 200,
      },
      {
         title: 'Amount Spent',
         field: 'amount',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'coupon_listing_amount_spent_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         formatter: cell => currencyFmt(Number(cell.getValue()) || 0),
         width: 150,
      },
      {
         title: 'Active',
         field: 'active',
         formatter: reactFormatter(<ToggleButton />),
         hozAlign: 'center',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'center'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'coupon_listing_active_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 100,
      },
   ]
   const downloadCsvData = () => {
      tableRef.current.table.download('csv', 'coupons_table.csv')
   }

   const downloadPdfData = () => {
      tableRef.current.table.downloadToTab('pdf', 'coupons_table.pdf')
   }

   const downloadXlsxData = () => {
      tableRef.current.table.download('xlsx', 'coupons_table.xlsx')
   }
   const clearCouponsPersistence = () => {
      localStorage.removeItem('tabulator-coupons_table-columns')
      localStorage.removeItem('tabulator-coupons_table-sort')
      localStorage.removeItem('tabulator-coupons_table-filter')
   }

   if (loading || listLoading) return <InlineLoader />
   return (
      <StyledWrapper>
         <Banner id="crm-app-coupons-listing-top" />
         <Tunnels tunnels={couponTunnels}>
            <Tunnel layer={1} size="md">
               <CreateCoupon close={closeCouponTunnel} />
            </Tunnel>
         </Tunnels>
         <Flex
            container
            height="80px"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
            padding="32px 0 0 0"
         >
            <Flex
               container
               as="header"
               width="25%"
               alignItems="center"
               justifyContent="space-between"
            >
               <Text as="h2">
                  Coupons(
                  {couponTotal?.couponsAggregate?.aggregate?.count || '...'})
               </Text>
               <Tooltip identifier="coupon_list_heading" />
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
                  width="73%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <TextButton
                     onClick={() => {
                        clearCouponsPersistence()
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
                  width="27%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <ButtonGroup>
                     <ComboButton
                        type="solid"
                        onClick={() => openCouponTunnel(1)}
                     >
                        <PlusIcon />
                        Create Coupon
                     </ComboButton>
                  </ButtonGroup>
               </Flex>
            </Flex>
         </Flex>
         <Spacer size="20px" />
         {Boolean(coupons) && (
            <ReactTabulator
               columns={columns}
               data={coupons}
               options={{
                  ...options,
                  placeholder: 'No Coupons Available Yet !',
                  persistenceID: 'coupons_table',
               }}
               ref={tableRef}
               className="crm-coupons"
            />
         )}
         <InsightDashboard
            appTitle="CRM App"
            moduleTitle="Coupon Listing"
            showInTunnel={false}
         />
         <Banner id="crm-app-coupons-listing-bottom" />
      </StyledWrapper>
   )
}

export default CouponListing
