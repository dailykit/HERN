import React, { useContext } from 'react'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Flex, Filler } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'

import { List } from '../styled'
import { SachetItem } from './sachet_item'
import { useConfig, useOrder } from '../../../context'
import { useAccess } from '../../../../../shared/providers'
import {
   Tooltip,
   DragNDrop,
   InlineLoader,
} from '../../../../../shared/components'
import { useDnd } from '../../../../../shared/components/DragNDrop/useDnd'
import { QUERIES } from '../../../graphql'
import { BrandContext } from '../../../../../App'

const address = 'apps.order.views.order.'

const Sachets = () => {
   const { t } = useTranslation()
   const { state: config } = useConfig()
   const { initiatePriority } = useDnd()
   const { isSuperUser } = useAccess()
   const { state } = useOrder()
   const [brandContext, setBrandContext] = useContext(BrandContext)


   const { loading, data: { sachets = [] } = {} } = useSubscription(
      QUERIES.ORDER.SACHET.MULTIPLE,
      {
         skip: !state?.current_product?.id,
         variables: {
            where: {
               parentCartItemId: { _eq: state?.current_product?.id },
               levelType: { _eq: 'orderItemSachet' },
               cart: {
                  brandId: {
                     _in: brandContext.brandId
                  }, locationId: {
                     _in: brandContext.locationId
                  }
               }
            },
         },
      }
   )

   React.useEffect(() => {
      if (!loading && !isEmpty(sachets)) {
         initiatePriority({
            data: sachets,
            tablename: 'cartItem',
            schemaname: 'order',
         })
      }
   }, [loading, sachets])

   if (loading) return <InlineLoader />
   return (
      <>
         <List.Head>
            <Flex container alignItems="center">
               <span>{t(address.concat('ingredients'))}</span>
               <Tooltip identifier="order_details_mealkit_column_ingredient" />
            </Flex>
            <Flex container alignItems="center">
               <span>{t(address.concat('supplier item'))}</span>
               <Tooltip identifier="order_details_mealkit_column_supplier_item" />
            </Flex>
            <Flex container alignItems="center">
               <span>{t(address.concat('processing'))}</span>
               <Tooltip identifier="order_details_mealkit_column_processing" />
            </Flex>
            <Flex container alignItems="center">
               <span>{t(address.concat('quantity'))}</span>
               <Tooltip identifier="order_details_mealkit_column_quantity" />
            </Flex>
         </List.Head>
         <List.Body>
            {!isEmpty(sachets) ? (
               <DragNDrop
                  list={sachets}
                  droppableId="sachetItems"
                  tablename="cartItem"
                  schemaname="order"
               >
                  {sachets
                     ?.filter(
                        node =>
                           isSuperUser ||
                           node.stationId === config?.current_station?.id
                     )
                     ?.map(item => (
                        <SachetItem item={item} key={item.id} />
                     ))}
               </DragNDrop>
            ) : (
               <Filler message="There are no sachets linked to this product." />
            )}
         </List.Body>
      </>
   )
}

export default Sachets
