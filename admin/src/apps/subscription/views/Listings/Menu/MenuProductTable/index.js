import React, { useState } from 'react'
import {
   Flex,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabs,
   Text,
   Filler,
   IconButton,
} from '@dailykit/ui'
import moment from 'moment'
import { toast } from 'react-toastify'
import { useSubscription } from '@apollo/react-hooks'
import TableOptions from './tableOptions'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { ErrorState, InlineLoader } from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import {
   MENU_PRODUCT_BY_SUBSCRIPTION,
   MENU_PRODUCT_BY_SUBSCRIPTION_OCCURRENCE,
} from '../../../../graphql/subscriptions'
import {
   PublishIcon,
   UnPublishIcon,
} from '../../../../../products/assets/icons'
const MenuProductTables = () => {
   return (
      <>
         <Flex padding="4px 32px">
            <Flex>
               <Text as="h2">Menu Product</Text>
            </Flex>
            <Flex>
               <HorizontalTabs>
                  <HorizontalTabList>
                     <HorizontalTab>Occurences</HorizontalTab>
                     <HorizontalTab>Subscription</HorizontalTab>
                  </HorizontalTabList>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        <MenuProductOccurenceTable />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <MenuProductSubscriptionTable />
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            </Flex>
         </Flex>
      </>
   )
}
const MenuProductOccurenceTable = () => {
   const tableRef = React.useRef()
   const [productOccurenceData, setProductOccurenceData] = useState([])
   const { loading: subsLoading, error: subsError } = useSubscription(
      MENU_PRODUCT_BY_SUBSCRIPTION_OCCURRENCE,
      {
         onSubscriptionData: ({ subscriptionData }) => {
            const newData =
               subscriptionData.data.subscription_subscriptionOccurence_product.map(
                  each => {
                     each.fulfillmentDate = moment(
                        each.subscriptionOccurence.fulfillmentDate
                     ).format('DD-MM-YYYY')
                     each.servingSize =
                        each.subscriptionOccurence.subscriptionServing.servingSize
                     each.title =
                        each.subscriptionOccurence.subscriptionTitle.title
                     each.ItemCount =
                        each.subscriptionOccurence.subscriptionItemCount.count
                     each.productName =
                        each.productOption?.product?.name || 'N/A'
                     return each
                  }
               )
            setProductOccurenceData(newData)
         },
      }
   )
   const dataLoaded = () => {
      tableRef.current.table.setGroupBy('productCategory')
   }
   console.log('productOccurenceData', productOccurenceData)
   const columns = [
      {
         title: 'Product Name',
         field: 'productName',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Serving Size',
         field: 'servingSize',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Add On Price',
         field: 'addOnPrice',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Add On Label',
         field: 'addOnLabel',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Plan Title',
         field: 'title',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Serving Size',
         field: 'servingSize',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Item Count',
         field: 'ItemCount',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Product Category',
         field: 'productCategory',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Fulfillment Date',
         field: 'fulfillmentDate',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Visibility',
         field: 'isVisible',
         formatter: reactFormatter(<BooleanIcon />),
         headerTooltip: true,
         width: 85,
      },
      {
         title: 'Availability',
         field: 'isAvailable',
         formatter: reactFormatter(<BooleanIcon />),
         headerTooltip: true,
         width: 85,
      },
      {
         title: 'Single Select',
         field: 'isSingleSelect',
         formatter: reactFormatter(<BooleanIcon />),
         headerTooltip: true,
         width: 85,
      },
   ]
   if (subsLoading && !subsError) {
      return <InlineLoader />
   }
   if (subsError) {
      toast.error('Failed to fetch Recipes!')
      logger(subsError)
      return <ErrorState />
   }
   if (productOccurenceData.length == 0) {
      return <Filler message="Data not available" />
   }
   return (
      <>
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={productOccurenceData}
            options={TableOptions}
            dataLoaded={dataLoaded}
         />
      </>
   )
}
const MenuProductSubscriptionTable = () => {
   const tableRef = React.useRef()
   const [productSubscriptionData, setProductSubscriptionData] = useState([])
   const { loading: subsLoading, error: subsError } = useSubscription(
      MENU_PRODUCT_BY_SUBSCRIPTION,
      {
         onSubscriptionData: ({ subscriptionData }) => {
            const newData =
               subscriptionData.data.subscription_subscriptionOccurence_product.map(
                  each => {
                     each.servingSize =
                        each.subscription.subscriptionServing.servingSize
                     each.title = each.subscription.subscriptionTitle.title
                     each.ItemCount =
                        each.subscription.subscriptionItemCount.count
                     each.productName =
                        each.productOption?.product?.name || 'N/A'
                     return each
                  }
               )
            setProductSubscriptionData(newData)
         },
      }
   )
   const dataLoaded = () => {
      tableRef.current.table.setGroupBy('productCategory')
   }
   console.log('productSubscriptionData', productSubscriptionData)
   const columns = [
      {
         title: 'Product Name',
         field: 'productName',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Serving Size',
         field: 'servingSize',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Add On Price',
         field: 'addOnPrice',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Add On Label',
         field: 'addOnLabel',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Plan Title',
         field: 'title',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Serving Size',
         field: 'servingSize',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Item Count',
         field: 'ItemCount',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Product Category',
         field: 'productCategory',
         headerFilter: true,
         headerTooltip: true,
      },
      {
         title: 'Visibility',
         field: 'isVisible',
         formatter: reactFormatter(<BooleanIcon />),
         headerTooltip: true,
         width: 85,
      },
      {
         title: 'Availability',
         field: 'isAvailable',
         formatter: reactFormatter(<BooleanIcon />),
         headerTooltip: true,
         width: 85,
      },
      {
         title: 'Single Select',
         field: 'isSingleSelect',
         formatter: reactFormatter(<BooleanIcon />),
         headerTooltip: true,
         width: 85,
      },
   ]
   if (subsLoading && !subsError) {
      return <InlineLoader />
   }
   if (subsError) {
      toast.error('Failed to fetch Recipes!')
      logger(subsError)
      return <ErrorState />
   }
   if (productSubscriptionData.length == 0) {
      return <Filler message="Data not available" />
   }
   return (
      <>
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={productSubscriptionData}
            options={TableOptions}
            dataLoaded={dataLoaded}
         />
      </>
   )
}
function BooleanIcon({ cell }) {
   const data = cell.getData()
   return (
      <Flex
         container
         width="100%"
         justifyContent="space-between"
         alignItems="center"
      >
         <IconButton type="ghost">
            {data.isPublished ? <PublishIcon /> : <UnPublishIcon />}
         </IconButton>
      </Flex>
   )
}
export default MenuProductTables
