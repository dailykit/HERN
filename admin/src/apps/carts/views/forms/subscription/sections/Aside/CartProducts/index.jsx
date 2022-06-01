import React from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'
import { Filler, Flex, IconButton, Spacer, Tag, Text } from '@dailykit/ui'

import { useManual } from '../../../state'
import { MUTATIONS } from '../../../../../../graphql'
import { buildImageUrl } from '../../../../../../utils'
import EmptyIllo from '../../../../../../assets/svgs/EmptyIllo'
import { currencyFmt } from '../../../../../../../../shared/utils'
import { DeleteIcon } from '../../../../../../../../shared/assets/icons'
import { LoyaltyPoints, Coupon } from '../../../../../../components'
import { isEmpty } from 'lodash'

const CartProducts = () => {
   const {
      cart,
      billing,
      occurenceCustomer,
      products,
      customer,
      tunnels,
      loyaltyPoints,
      isCartValidByProductAvailability,
   } = useManual()

   const [remove] = useMutation(MUTATIONS.CART.ITEM.DELETE, {
      onCompleted: () => toast.success('Successfully deleted the product.'),
      onError: () => toast.error('Failed to delete the product.'),
   })

   // check availability of product in cart
   const isProductAvailable = product => {
      const selectedProductOption = product.product.productOptions.find(
         option => option.id === product.childs[0]?.productOption?.id
      )
      if (!isEmpty(selectedProductOption)) {
         return (
            product.product.isAvailable &&
            product.product.isPublished &&
            selectedProductOption.isAvailable &&
            selectedProductOption.isPublished
         )
      } else {
         return product.product.isAvailable && product.product.isPublished
      }
   }

   return (
      <section>
         <Text as="text2">
            Products({occurenceCustomer?.addedProductsCount || 0}
            {'/'}
            {occurenceCustomer?.addedProductsCount +
               occurenceCustomer.pendingProductsCount}
            )
         </Text>
         {occurenceCustomer?.itemCountValid && (
            <Text as="subtitle">Cart is full</Text>
         )}
         {!isCartValidByProductAvailability && (
            <span style={{ fontSize: '12px', color: '#f33737' }}>
               Some products in cart are not available
            </span>
         )}
         <Spacer size="8px" />
         {products.aggregate.count > 0 ? (
            <Styles.Cards>
               {products.nodes.map(product => (
                  <Styles.Card key={product.id}>
                     <aside>
                        {product.image ? (
                           <img
                              src={buildImageUrl('56x56', product.image)}
                              alt={product.name}
                           />
                        ) : (
                           <span>N/A</span>
                        )}
                     </aside>
                     <Flex container flexDirection="column">
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="space-between"
                        >
                           <Flex as="main" container flexDirection="column">
                              {product.addOnLabel && (
                                 <div>
                                    <Tag>{product.addOnLabel}</Tag>
                                    <Spacer size="4px" />
                                 </div>
                              )}
                              <Text as="text2">{product.name}</Text>
                              {Boolean(product.addOnPrice) && (
                                 <Text as="text3">
                                    Add On Price:{' '}
                                    {currencyFmt(product.addOnPrice)}
                                 </Text>
                              )}
                           </Flex>
                           {cart?.paymentStatus === 'PENDING' && (
                              <IconButton
                                 size="sm"
                                 type="ghost"
                                 onClick={() =>
                                    remove({ variables: { id: product.id } })
                                 }
                              >
                                 <DeleteIcon color="#ec3333" />
                              </IconButton>
                           )}
                        </Flex>
                        {!isProductAvailable(product) && (
                           <span style={{ color: '#f33737', fontSize: '12px' }}>
                              This product is not available
                           </span>
                        )}
                     </Flex>
                  </Styles.Card>
               ))}
            </Styles.Cards>
         ) : (
            <Filler
               height="160px"
               message="No products added yet!"
               illustration={<EmptyIllo />}
            />
         )}
         <Spacer size="16px" />
         <LoyaltyPoints loyaltyPoints={loyaltyPoints} />
         <Spacer size="16px" />
         <Coupon customer={customer} tunnels={tunnels} />
         <Spacer size="16px" />
         <section>
            <Text as="text2">Billing Details</Text>
            <Spacer size="8px" />
            <Styles.Bill>
               <Flex container flexDirection="column">
                  <span>{billing?.itemTotal?.label}</span>
                  <Text as="subtitle">
                     {parseText(billing?.itemTotal?.comment)}
                  </Text>
               </Flex>
               <span>{currencyFmt(billing?.itemTotal?.value)}</span>
            </Styles.Bill>
            <Styles.Bill>
               <Flex container flexDirection="column">
                  <span>{billing?.deliveryPrice?.label}</span>
                  <Text as="subtitle">
                     {parseText(billing?.deliveryPrice?.comment)}
                  </Text>
               </Flex>
               <span>{currencyFmt(billing?.deliveryPrice?.value)}</span>
            </Styles.Bill>
            {!billing?.isTaxIncluded && (
               <Styles.Bill>
                  <Flex container flexDirection="column">
                     <span>{billing?.subTotal?.label}</span>
                     <Text as="subtitle">
                        {parseText(billing?.subTotal?.comment)}
                     </Text>
                  </Flex>
                  <span>{currencyFmt(billing?.subTotal?.value)}</span>
               </Styles.Bill>
            )}
            {!!billing?.walletAmountUsed?.value && (
               <Styles.Bill>
                  <Flex container flexDirection="column">
                     <span>{billing?.walletAmountUsed?.label}</span>
                  </Flex>
                  <span>{currencyFmt(billing?.walletAmountUsed?.value)}</span>
               </Styles.Bill>
            )}
            {!!billing?.loyaltyPointsUsed?.value && (
               <Styles.Bill>
                  <Flex container flexDirection="column">
                     <span>{billing?.loyaltyPointsUsed?.label}</span>
                  </Flex>
                  <span>{currencyFmt(billing?.loyaltyPointsUsed?.value)}</span>
               </Styles.Bill>
            )}
            {!!billing?.discount?.value && (
               <Styles.Bill>
                  <Flex container flexDirection="column">
                     <span>{billing?.discount?.label}</span>
                  </Flex>
                  <span>{currencyFmt(billing?.discount?.value)}</span>
               </Styles.Bill>
            )}
            <Styles.Bill>
               <Flex container flexDirection="column">
                  <span>{billing?.totalPrice?.label}</span>
                  <Text as="subtitle">
                     {parseText(billing?.totalPrice?.comment)}
                  </Text>
               </Flex>
               <span>{currencyFmt(billing?.totalPrice?.value)}</span>
            </Styles.Bill>
         </section>
      </section>
   )
}

export default CartProducts

const parseText = (text = '') =>
   text.replace(/\{\{([^}]+)\}\}/g, () => {
      return currencyFmt(text.match(/\{\{([^}]+)\}\}/g)[0].slice(2, -2))
   })

const Styles = {
   Cards: styled.ul`
      overflow-y: auto;
      max-height: 264px;
   `,
   Card: styled.li`
      padding: 4px;
      display: grid;
      grid-gap: 8px;
      min-height: 56px;
      border-radius: 2px;
      background: #ffffff;
      border: 1px solid #ececec;
      grid-template-columns: auto 1fr;
      + li {
         margin-top: 8px;
      }
      aside {
         width: 56px;
         height: 56px;
         display: flex;
         background: #eaeaea;
         align-items: center;
         justify-content: center;
         > span {
            font-size: 14px;
            color: #ab9e9e;
         }
         > img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
         }
      }
   `,
   Bill: styled.section`
      display: flex;
      align-items: center;
      justify-content: space-between;
      > span {
         font-size: 14px;
      }
   `,
}
