import { useSubscription } from '@apollo/react-hooks'
import { isEmpty } from 'lodash'
import React, { useContext } from 'react'
import { InlineLoader } from '../../../../shared/components'
import { useOrder } from '../../context'
import { QUERIES } from '../../graphql'
import { StyledStat } from '../ProcessSachet/styled'
import { SachetWrapper } from './styled'
import { BrandContext } from '../../../../App'

const SachetBar = ({ openOrderSummaryTunnel }) => {
   const { state } = useOrder()
   const [isLoading, setIsLoading] = React.useState(true)
   const [sachet, setSachet] = React.useState({})
   const [brandContext, setBrandContext] = useContext(BrandContext)

   const { error } = useSubscription(QUERIES.ORDER.SACHET.MULTIPLE, {
      skip: !state?.sachet?.id || !state?.current_product?.id,
      variables: {
         id: { _eq: state?.sachet?.id },
         parentCartItemId: { _eq: state?.current_product?.id },
         levelType: { _eq: 'orderItemSachet' },
         cart: {
            brandId: {
               _in: brandContext.brandId,
            },
            locationId: { _in: brandContext.locationId },
         },
      },
      onSubscriptionData: async ({
         subscriptionData: { data: { sachets = [] } = {} },
      }) => {
         if (!isEmpty(sachets)) {
            const [node] = sachets
            setSachet(node)
         }
         setIsLoading(false)
      },
   })

   if (isLoading) return <div />
   if (error) {
      setIsLoading(false)
   }
   return (
      <SachetWrapper onClick={() => openOrderSummaryTunnel(1)}>
         <section>
            <h4>{sachet.displayName.split('->').pop().trim()}</h4>
            <StyledStat status={sachet.status}>{sachet.status}</StyledStat>
         </section>
         <section>
            <section>
               <span>Supplier Item</span>
               <span>{sachet?.supplierItem?.supplierItemName}</span>
            </section>
            <section>
               <span>Processing Name</span>
               <span>{sachet.processingName}</span>
            </section>
            <section>
               <span>Quantity</span>
               <span>
                  {sachet.displayUnitQuantity}
                  {sachet.displayUnit}
               </span>
            </section>
         </section>
      </SachetWrapper>
   )
}

export default SachetBar
