import React, { useRef, useState, useEffect, useContext } from 'react'
import moment from 'moment'
import { toast } from 'react-toastify'
import {
   Text,
   Loader,
   Flex,
   IconButton,
   Spacer,
   Dropdown,
   ButtonGroup,
   TextButton,
   Collapsible,
   DropdownButton,
} from '@dailykit/ui'
import { useSubscription, useQuery, useMutation } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { useLocation } from 'react-router-dom'
import { StyledWrapper } from './styled'
import { HeadingTile } from '../../../components'
import BrandContext from '../../../context/Brand'
import {
   CUSTOMERS_COUNT,
   TOTAL_REVENUE,
   CUSTOMERS_LISTING,
   CUSTOMERS_LISTING_2,
   CUSTOMER_ARCHIVED,
   UNIQUE_SUBSCRIPTION_FILTER_VALUES,
} from '../../../graphql'
import {
   Tooltip,
   InlineLoader,
   InsightDashboard,
   Banner,
} from '../../../../../shared/components'
import { DeleteIcon } from '../../../../../shared/assets/icons'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { currencyFmt, logger } from '../../../../../shared/utils'
import options from '../../tableOptions'
import rRuleDay from '../../../Utils/rruleToText'
import { TrueIcon, FalseIcon } from '../../../assets'

const CustomerListing = () => {
   const location = useLocation()
   const [context, setContext] = useContext(BrandContext)
   const { addTab, tab } = useTabs()
   const { tooltip } = useTooltip()
   const tableRef = useRef(null)
   const [customersList, setCustomersList] = useState(undefined)
   const [customerCount, setCustomerCount] = useState(0)
   const [revenue, setRevenue] = useState(0)
   // const [groups, setGroups] = useState(['subscriber'])
   const [uniqueSubscriptionFilterValues, setUniqueSubscriptionFilterValues] =
      useState({})
   const groupByOptions = [
      { id: 1, title: 'Plan Title', payLoad: 'planTitle' },
      { id: 2, title: 'Serving Size', payLoad: 'servings' },
      { id: 3, title: 'Delivery Day', payLoad: 'deliveryDay' },
      { id: 4, title: 'Subscriber', payLoad: 'subscriber' },
      { id: 5, title: 'Sub. Cancelled', payLoad: 'isSubscriptionCancelled' },
   ]
   // Subscription
   const { loading, error1 } = useSubscription(TOTAL_REVENUE, {
      variables: {
         brandId: context.brandId,
      },
      onSubscriptionData: data => {
         setRevenue(
            data?.subscriptionData?.data?.ordersAggregate?.aggregate?.sum
               ?.amountPaid || 0
         )
      },
   })
   const { customerCountLoading, error2 } = useSubscription(CUSTOMERS_COUNT, {
      variables: {
         brandId: context.brandId,
      },
      onSubscriptionData: data => {
         setCustomerCount(
            data?.subscriptionData?.data?.customers_aggregate?.aggregate
               ?.count || 0
         )
      },
   })
   if (error1 || error2) {
      toast.error('Something went wrong !')
      logger(error1 || error2)
   }

   // Mutation
   const [deleteCustomer] = useMutation(CUSTOMER_ARCHIVED, {
      onCompleted: () => {
         toast.success('Customer deleted!')
      },
      onError: error => {
         toast.error('Could not delete!')
      },
   })
   // Query
   const { loading: listloading } = useQuery(CUSTOMERS_LISTING_2, {
      variables: {
         brandId: context.brandId,
         order_by: [
            { isSubscriber: 'desc' },
            { isSubscriberTimeStamp: 'desc' },
            { created_at: 'desc' },
            { subscriptionTitle: { title: 'desc_nulls_last' } },
            { subscriptionServing: { servingSize: 'desc_nulls_last' } },
            { subscriptionItemCount: { count: 'desc_nulls_last' } },
         ],
      },
      onCompleted: ({
         brandCustomers = {},
         uniqueDeliveryDays,
         uniqueItemCounts,
         uniqueServings,
         uniqueTitles,
      }) => {
         const result = brandCustomers.map(customer => {
            return {
               keycloakId: customer.keycloakId,
               name: customer?.customer.platform_customer?.fullName,
               phone:
                  customer?.customer.platform_customer?.phoneNumber || 'N/A',
               email: customer?.customer.email || 'N/A',
               source: customer.customer.source || 'N/A',
               planTitle: customer?.subscriptionTitle?.title || 'N/A',
               servings: customer?.subscriptionServing?.servingSize || 'N/A',
               itemCount: customer?.subscriptionItemCount?.count ?? 'N/A',
               refSent: '20',
               paid:
                  customer?.orders_aggregate?.aggregate?.sum?.amountPaid || 0,
               orders: customer?.orders_aggregate?.aggregate?.count || 0,
               discounts:
                  customer?.orders_aggregate?.aggregate?.sum?.discount || 0,
               subscriber: customer.isSubscriber,
               deliveryDay: rRuleDay(customer?.subscription?.rrule),
               signUpOn: customer.created_at,
               subscribedOn: customer.updated_at,
               isSubscriptionCancelled: customer.isSubscriptionCancelled,
            }
         })
         setUniqueSubscriptionFilterValues({
            uniqueDeliveryDays: uniqueDeliveryDays.map(rDay => {
               rDay[rRuleDay(rDay.rrule)] = rRuleDay(rDay.rrule)
               delete rDay.rrule
               return rDay
            }),
            uniqueItemCounts: uniqueItemCounts,
            uniqueServings: uniqueServings,
            uniqueTitles: uniqueTitles,
         })

         setCustomersList(result)
      },
      onError: error => {
         toast.error('Something went wrong !')
         logger(error)
      },
   })
   useEffect(() => {
      if (!tab) {
         addTab('Customers', location.pathname)
      }
   }, [addTab, tab])

   // Handler
   const deleteHandler = (e, Customer) => {
      e.stopPropagation()
      if (
         window.confirm(
            `Are you sure you want to delete Customer - ${Customer.name}?`
         )
      ) {
         deleteCustomer({
            variables: {
               keycloakId: Customer.keycloakId,
            },
         })
      }
   }

   const rowClick = (e, cell) => {
      const { keycloakId, name } = cell._cell.row.data
      const param = `${location.pathname}/${keycloakId}`
      addTab(name, param)
   }
   const DeleteButton = () => {
      return (
         <IconButton type="ghost">
            <DeleteIcon color="#FF5A52" />
         </IconButton>
      )
   }
   const EmailFormatter = ({ cell }) => {
      return (
         <>
            <Flex width="250px" className="colHover">
               <Text as="text2">{cell._cell.value}</Text>
               <Flex container justifyContent="space-between">
                  <Text as="p">
                     {moment(cell._cell.row.data.signUpOn).calendar()}
                  </Text>
                  <Spacer xAxis size="10px" />
               </Flex>
            </Flex>
         </>
      )
   }
   const SubscriberFormatter = ({ cell }) => {
      return (
         <>
            <Text as="text2">
               {cell._cell.value ? <TrueIcon /> : <FalseIcon />}
            </Text>
            {cell._cell.value ? (
               <Text as="p">
                  {moment(cell._cell.row.data.subscribedOn).calendar()}
               </Text>
            ) : (
               <Text as="p"></Text>
            )}
         </>
      )
   }
   const tableLoaded = () => {
      const customerGroup = localStorage.getItem(
         'tabulator-customer_table-group'
      )
      const customerGroupParse =
         customerGroup !== undefined &&
         customerGroup !== null &&
         customerGroup.length !== 0
            ? JSON.parse(customerGroup)
            : null
      tableRef.current.table.setGroupBy(
         !!customerGroupParse && customerGroupParse.length > 0
            ? customerGroupParse
            : 'subscriber'
      )
      tableRef.current.table.setGroupHeader(function (
         value,
         count,
         data1,
         group
      ) {
         let [totalOrders, totalPaid] = [0, 0]
         const foo = (group, col) => {
            let total = 0
            if (group.groupList.length != 0) {
               group.groupList.forEach(each => (total += foo(each, col)))
            } else {
               group.rows.forEach(row => (total += row.data[col]))
            }
            return total
         }
         totalOrders = foo(group._group, 'orders')
         totalPaid = foo(group._group, 'paid')
         const avg = parseFloat(totalPaid / totalOrders).toFixed(2)
         let newHeader
         switch (group._group.field) {
            case 'subscriber':
               newHeader = 'Subscriber'
               break
            case 'deliveryDay':
               newHeader = 'Delivery Day'
               break
            case 'servings':
               newHeader = 'Servings'
               break
            case 'planTitle':
               newHeader = 'Plan'
               break
            case 'isSubscriptionCancelled':
               newHeader = 'Subscription Cancelled'
            default:
               break
         }
         return `${newHeader} - ${value} || ${count} Customers || No. of Orders ${totalOrders} || Total Paid ${totalPaid} || Average ${avg}`
      })
   }
   const emailAccessor = (value, data, type, params, column, row) => {
      return `${value} ${moment(data.created_at).calendar()}`
   }
   const signupAccessor = (value, data, type, params, column, row) => {
      return `${moment(value).calendar()}`
   }
   const clearHeaderFilter = () => {
      tableRef.current.table.clearHeaderFilter()
   }
   const downloadCsvData = () => {
      tableRef.current.table.download('csv', 'customers_table.csv')
   }

   const downloadPdfData = () => {
      tableRef.current.table.downloadToTab('pdf', 'customers_table.pdf')
   }

   const downloadXlsxData = () => {
      tableRef.current.table.download('xlsx', 'customers_table.xlsx')
   }
   const clearCustomerPersistence= () =>
      {
         localStorage.removeItem('tabulator-customer_table-columns')
         localStorage.removeItem('tabulator-customer_table-sort')
         localStorage.removeItem('tabulator-customer_table-filter') 
         localStorage.removeItem('tabulator-customer_table-group')
      }
   const defaultIDS = () => {
      let arr = []
      const customerGroup = localStorage.getItem(
         'tabulator-customer_table-group'
      )
      const customerGroupParse =
         customerGroup !== undefined &&
         customerGroup !== null &&
         customerGroup.length !== 0
            ? JSON.parse(customerGroup)
            : null
      if (customerGroupParse !== null) {
         customerGroupParse.forEach(x => {
            const foundGroup = groupByOptions.find(y => y.payLoad == x)
            arr.push(foundGroup.id)
         })
      }
      return arr.length == 0 ? [4] : arr
   }
   const columns = [
      {
         title: 'Email',
         field: 'email',
         headerFilter: true,
         frozen: true,
         hozAlign: 'left',
         width: 300,
         formatter: reactFormatter(<EmailFormatter />),
         cssClass: 'rowClick',
         cellClick: (e, cell) => {
            rowClick(e, cell)
         },
         headerTooltip: function (column) {
            const identifier = 'customer_listing_email_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Action',
         field: 'action',
         headerHorzAlign: 'center',
         frozen: true,
         hozAlign: 'center',      
         cellClick: (e, cell) => {
            e.stopPropagation()
            deleteHandler(e, cell._cell.row.data)
         },
         formatter: reactFormatter(<DeleteButton />),
         
         titleFormatter: function (cell) {
            cell.getElement().style.textAlign = 'center'
            return '' + cell.getValue()
         },
         width: 100,
      }, 
      {
         title: 'Personal Contact',
         columns: [
            {
               title: 'Customer Name',
               field: 'name',
               headerFilter: true,
               hozAlign: 'left',
               width: 150,
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_name_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
            },
            {
               title: 'Phone',
               field: 'phone',
               hozAlign: 'right',
               titleFormatter: function (cell) {
                  cell.getElement().style.textAlign = 'right'
                  return '' + cell.getValue()
               },
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_phone_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
               width: 150,
            },
         ],
      },
      {
         title: 'Subscription Details',
         columns: [
            {
               title: 'Plan',
               field: 'planTitle',
               hozAlign: 'left',
               headerFilter: true,
               width: 150,
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_plan_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
            },
            {
               title: 'Serving Size',
               field: 'servings',
               hozAlign: 'right',
               headerFilter: 'number',
               headerFilterPlaceholder: 'Equal to',
               headerFilterFunc: '=',
               width: 120,
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_serving_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
            },
            {
               title: 'Item Count',
               field: 'itemCount',
               hozAlign: 'right',
               headerFilter: 'number',
               headerFilterPlaceholder: 'Equal to',
               headerFilterFunc: '=',
               width: 120,
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_item_count_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
            },

            {
               title: 'Subscriber',
               field: 'subscriber',
               hozAlign: 'left',
               width: 150,
               formatter: reactFormatter(<SubscriberFormatter />),
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_subscriber_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
            },
            {
               title: 'Sub. Cancelled',
               field: 'isSubscriptionCancelled',
               hozAlign: 'left',
               width: 150,
               headerTooltip: function (column) {
                  const identifier =
                     'customer_listing_is_subscription_cancelled_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
            },
            {
               title: 'delivery Day',
               field: 'deliveryDay',
               hozAlign: 'left',
               // editor: 'select',
               headerFilter: true,
               headerFilterParams: {
                  values: {
                     // ...uniqueSubscriptionFilterValues.uniqueDeliveryDays,
                     male: 'Male',
                     female: 'Female',
                     '': '',
                  },
               },
               width: 200,
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_delivery_day_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
            },
            {
               title: 'Source',
               field: 'source',
               hozAlign: 'left',
               width: 150,
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_source_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
            },
         ],
      },
      {
         title: 'Pricing and order',
         columns: [
            {
               width: 80,
               title: 'Total Paid',
               field: 'paid',
               hozAlign: 'right',
               titleFormatter: function (cell) {
                  return '' + cell.getValue()
               },
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_paid_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
               formatter: cell => currencyFmt(Number(cell.getValue()) || 0),
            },
            {
               title: 'Total Orders',
               field: 'orders',
               hozAlign: 'right',
               titleFormatter: function (cell) {
                  cell.getElement().style.textAlign = 'right'
                  return '' + cell.getValue()
               },
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_orders_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
               width: 80,
            },
            {
               title: 'Discounts availed',
               field: 'discounts',
               hozAlign: 'right',
               titleFormatter: function (cell) {
                  cell.getElement().style.textAlign = 'right'
                  return '' + cell.getValue()
               },
               headerTooltip: function (column) {
                  const identifier = 'customer_listing_discount_column'
                  return (
                     tooltip(identifier)?.description ||
                     column.getDefinition().title
                  )
               },
               width: 80,
               formatter: cell => currencyFmt(Number(cell.getValue()) || 0),
            },
         ],
      },
      
      {
         title: 'Created',
         field: 'signUpOn',
         titleDownload: 'Sign up at',
         visible: false,
         download: true,
         accessorParams: {},
         accessor: signupAccessor,
      },
      {
         title: 'Created',
         field: 'subscribedOn',
         visible: false,
         download: true,
         titleDownload: 'Subscribed on',
         accessorParams: {},
         accessor: signupAccessor,
      },
   ]

   if (loading || customerCountLoading || listloading) return <InlineLoader />
   return (
      <StyledWrapper>
         <Banner id="crm-app-customers-listing-top" />
         <Flex
            container
            alignItems="center"
            justifyContent="space-between"
            padding="32px 0 0 0"
         >
            <HeadingTile title="Total Customers" value={customerCount} />
            <HeadingTile
               title="Total Revenue generated"
               value={currencyFmt(revenue)}
            />
         </Flex>

         <Flex
            container
            height="80px"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex
               container
               as="header"
               width="25%"
               alignItems="center"
               justifyContent="space-between"
             >
               <Text as="title">
                  Customers(
                  {customerCount})
               </Text>
               <Tooltip identifier="customer_list_heading" />
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
                  width="80%"
                  alignItems="center"
                  justifyContent="flex-end"
               >
                  <TextButton
                     onClick={() => {
                        clearCustomerPersistence ()
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

               <Spacer size="15px" xAxis />
               <Text as="text1">Group By:</Text>
               <Spacer size="5px" xAxis />
               <Dropdown
                  type="multi"
                  variant="revamp"
                  disabled={true}
                  defaultIds={defaultIDS()}
                  options={groupByOptions}
                  searchedOption={() => {}}
                  selectedOption={value => {
                     localStorage.setItem(
                        'tabulator-customer_table-group',
                        JSON.stringify(value.map(x => x.payLoad))
                     )
                     tableRef.current.table.setGroupBy(
                        value.map(x => x.payLoad)
                     )
                  }}
                  typeName="groupBy"
               />
               
            </Flex>         
               <Flex
                   container
                   as="header"
                   width="20%"
                   alignItems="center"
                   justifyContent="flex-end"
               >
                  <ButtonGroup align="left">
                  <TextButton
                     type="ghost"
                     size="sm"
                     onClick={() => clearHeaderFilter()}
                  >
                     Clear All Filter
                  </TextButton>
               </ButtonGroup>
               </Flex>
            </Flex>
         </Flex>
         <Spacer size="30px" />
         {Boolean(customersList) && (
            <ReactTabulator
               columns={columns}
               data={customersList}
               dataLoaded={tableLoaded}
               options={{
                  ...options,
                  placeholder: 'No Customers Available Yet !',
                  columnHeaderVertAlign: 'bottom',
                  persistenceID : 'customer_table'
               }}
               ref={tableRef}
               className="crmCustomerTable"
            />
         )} 
         <InsightDashboard
            appTitle="CRM App"
            moduleTitle="Customer Listing"
            showInTunnel={false}
         />
         <Banner id="crm-app-customers-listing-bottom" />
      </StyledWrapper>
   )
}
export default CustomerListing
