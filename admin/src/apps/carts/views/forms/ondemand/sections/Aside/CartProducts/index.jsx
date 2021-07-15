import React from 'react'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { LoyaltyPoints, Coupon } from '../../../../../../components'
import { Filler, Flex, Form, IconButton, Spacer, Text } from '@dailykit/ui'

import { useManual } from '../../../state'
import { buildImageUrl } from '../../../../../../utils'
import { MUTATIONS } from '../../../../../../graphql'
import { currencyFmt, logger } from '../../../../../../../../shared/utils'
import { DeleteIcon } from '../../../../../../../../shared/assets/icons'
import EmptyIllo from '../../../../../../assets/svgs/EmptyIllo'
import EditPrice from '../../../../../../components/EditPrice'

const CartProducts = () => {
   const {
      cart,
      billing,
      products,
      customer,
      tunnels,
      loyaltyPoints,
   } = useManual()

   console.log('products', products)

   return (
      <section>
         <Text as="text2">Products({products.aggregate.count})</Text>
         <Spacer size="8px" />
         {products.aggregate.count > 0 ? (
            <Styles.Cards>
               {products.nodes.map(product => (
                  <ProductCard key={product.id} product={product} cart={cart} />
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
               <span>Item Total</span>
               <span>{currencyFmt(billing?.itemTotal)}</span>
            </Styles.Bill>
            <Styles.Bill>
               <span>Delivery Price</span>
               <span>{currencyFmt(billing?.deliveryPrice)}</span>
            </Styles.Bill>
            <Styles.Bill>
               <span>Tax</span>
               <span>{currencyFmt(billing?.tax)}</span>
            </Styles.Bill>
            <Styles.Bill>
               <span>Wallet Amount Used</span>
               <span>{currencyFmt(billing?.walletAmountUsed)}</span>
            </Styles.Bill>
            <Styles.Bill>
               <span>Loyalty Points Used </span>
               <span>{billing?.loyaltyPointsUsed}</span>
            </Styles.Bill>
            <Styles.Bill>
               <span>Discount</span>
               <span>{currencyFmt(billing?.discount)}</span>
            </Styles.Bill>
            <Styles.Bill>
               <span>Total Price</span>
               <span>{currencyFmt(billing?.totalPrice)}</span>
            </Styles.Bill>
         </section>
      </section>
   )
}

export default CartProducts

const ProductCard = ({ product, cart }) => {
   const [remove] = useMutation(MUTATIONS.CART.ITEM.DELETE, {
      onCompleted: () => toast.success('Successfully deleted the product.'),
      onError: () => toast.error('Failed to delete the product.'),
   })

   console.log('Product: ', product)

   return (
      <Styles.Card>
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

         <Flex container alignItems="center" justifyContent="space-between">
            <Flex as="main" container flexDirection="column">
               <Text as="text2">{product.name}</Text>
               <EditPrice product={product} />

               <Spacer size="2px" />
               {product.childs.map(item => (
                  <>
                     <Flex alignItems="center" justifyContent="space-between">
                        <div
                           style={{
                              width: '240px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                           }}
                        >
                           {item.comboProductComponent && (
                              <Text
                                 as="text2"
                                 title={`${item.comboProductComponent.linkedProduct.name} (${item.comboProductComponent.label})`}
                              >
                                 {item.comboProductComponent.linkedProduct.name}{' '}
                                 ({item.comboProductComponent.label})
                              </Text>
                           )}
                        </div>
                        <div>
                           {item.customizableProductComponent && (
                              <Text as="text2">
                                 {item.customizableProductComponent.fullName
                                    .split('-')[1]
                                    .trim()}
                              </Text>
                           )}
                        </div>
                        <div style={{ marginLeft: '8px' }}>
                           <Text as="text2" style={{ color: '#808080' }}>
                              {item.productOption.label}
                              <EditPrice product={item} />
                           </Text>
                        </div>

                        {item.childs.some(op => op.modifierOption) && (
                           <div style={{ marginLeft: '16px' }}>
                              <Text as="subtitle">Modifiers</Text>
                              {item.childs.map(option => (
                                 <>
                                    <Text
                                       as="text2"
                                       style={{ color: '#808080' }}
                                    >
                                       {option.modifierOption?.name}
                                    </Text>
                                    <EditPrice product={option} />
                                 </>
                              ))}
                           </div>
                        )}
                     </Flex>
                  </>
               ))}
            </Flex>

            {cart?.paymentStatus === 'PENDING' && (
               <IconButton
                  size="sm"
                  type="ghost"
                  onClick={() => remove({ variables: { id: product.id } })}
               >
                  <DeleteIcon color="#ec3333" />
               </IconButton>
            )}
         </Flex>
      </Styles.Card>
   )
}
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
