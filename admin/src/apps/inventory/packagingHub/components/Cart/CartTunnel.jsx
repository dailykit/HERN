import React, { useMemo } from 'react'
import {
   TunnelHeader,
   Loader,
   Table,
   TableHead,
   TableBody,
   TableRow,
   TableCell,
   IconButton,
   TextButton,
} from '@dailykit/ui'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import { TunnelContainer } from '../../../components'
import { FlexContainer } from '../../../views/Forms/styled'
import QuantityHandler from '../QuantityHandler'

import {
   CART_ITEMS,
   REMOVE_CART_ITEM,
   CHANGE_CART_ITEM_QUANTITY,
   ORGANIZATION_PURCHASE_ORDER,
} from '../../graphql'
import { DeleteIcon } from '../../../assets/icons'
import { Banner } from '../../../../../shared/components'

export default function CartTunnel({ close, open }) {
   const {
      loading,
      data: { organizationPurchaseOrders_purchaseOrderItem: items = [] } = {},
      refetch,
   } = useQuery(CART_ITEMS, {
      fetchPolicy: 'network-only',
      onError: error => {
         toast.error(error.message)
         console.log(error)
      },
   })

   return (
      <>
         <TunnelHeader title="Purchase Orders" close={() => close(1)} />
         <Banner id="inventory-app-packaging-hub-products-cart-tunnel-top" />
         <TunnelContainer>
            {loading ? (
               <Loader />
            ) : (
               <Content open={open} items={items} refresh={refetch} />
            )}
         </TunnelContainer>
         <Banner id="inventory-app-packaging-hub-products-cart-tunnel-bottom" />
      </>
   )
}

function Content({ items, refresh, open }) {
   const [deleteCartItem, { loading }] = useMutation(REMOVE_CART_ITEM, {
      onCompleted: () => {
         toast.success('product removed')
         refresh()
      },
      onError: error => {
         toast.error(error.message)
      },
   })

   const [changeQuantity] = useMutation(CHANGE_CART_ITEM_QUANTITY, {
      onCompleted: data => {
         const {
            update_organizationPurchaseOrders_purchaseOrderItem: {
               affected_rows,
            },
         } = data

         if (affected_rows > 0) refresh()
      },
      onError: error => {
         toast.error(error.message)
      },
   })

   const handleDelete = ({ id }) => {
      deleteCartItem({ variables: { id } })
   }

   const handleItemIncrement = ({ id }) => {
      changeQuantity({ variables: { id, quantity: +1 } })
   }

   const handleItemDecrement = ({ id, multiplier }) => {
      if (multiplier === 1)
         return toast.error(
            'Quantity cannot be 0. Use the delete button instead.'
         )
      changeQuantity({ variables: { id, quantity: -1 } })
   }

   if (loading) return <Loader />

   return (
      <Wrapper>
         {items && items.length ? (
            <>
               <h2>{items.length} items</h2>
               <br />
               <Table>
                  <TableHead>
                     <TableRow>
                        <TableCell>Packaging Item</TableCell>
                        <TableCell>Package</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Total Price</TableCell>
                        <TableCell />
                     </TableRow>
                  </TableHead>
                  <TableBody>
                     {items.map(item => (
                        <TableRow key={item.id}>
                           <TableCell>
                              <FlexContainer style={{ alignItems: 'center' }}>
                                 {Array.isArray(
                                    item.packaging?.assets?.images
                                 ) && item.packaging.assets.images.length ? (
                                    <>
                                       <img
                                          src={
                                             item.packaging?.assets?.images[0]
                                                .url
                                          }
                                          alt=""
                                          height="48px"
                                          style={{ margin: '20px 8px' }}
                                       />
                                       <span style={{ width: '8px' }} />
                                    </>
                                 ) : null}

                                 <div>
                                    <h1>{item.packaging.packagingName}</h1>
                                    <p>
                                       by{' '}
                                       <span style={{ color: '#00A7E1' }}>
                                          {
                                             item.packaging
                                                .packagingCompanyBrand?.name
                                          }
                                       </span>
                                    </p>
                                 </div>
                              </FlexContainer>
                           </TableCell>
                           <TableCell>
                              <p style={{ margin: 0, fontSize: '14px' }}>
                                 {item.quantity} units
                                 <Pillar />$ {item.salesPrice}
                              </p>
                           </TableCell>
                           <TableCell>
                              <QuantityHandler
                                 value={item.multiplier}
                                 onInc={() => handleItemIncrement(item)}
                                 onDec={() => handleItemDecrement(item)}
                              />
                           </TableCell>
                           <TableCell>$ {item.netChargeAmount}</TableCell>
                           <TableCell>
                              <IconButton
                                 type="ghost"
                                 onClick={() => handleDelete(item)}
                              >
                                 <DeleteIcon color="#FF5A52" />
                              </IconButton>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
               <Calculator items={items} open={open} />
            </>
         ) : (
            <h1>Your Cart is empty. Go buy something !</h1>
         )}
      </Wrapper>
   )
}

function Calculator({ items, open }) {
   const totalPrice = useMemo(() => {
      const price = items.reduce((acc, curr) => {
         const currentPrice = curr.netChargeAmount

         return acc + currentPrice
      }, 0)

      return price.toFixed(3)
   }, [items])

   const { data, loading } = useQuery(ORGANIZATION_PURCHASE_ORDER, {
      fetchPolicy: 'network-only',
      onError: error => {
         toast.error(error.message)
         console.log(error)
      },
   })

   const handleCheckout = () => {
      const { organizationPurchaseOrders_purchaseOrder: org } = data

      if (org[0].netChargeAmount === +totalPrice) {
         open(2)
      } else {
         toast.error('Error! Please try again.')
      }
   }

   if (loading) return <Loader />

   return (
      <Wrapper style={{ backgroundColor: '#F3F3F3' }}>
         <PriceBox>
            <h2>
               Total Payable:{' '}
               <span style={{ marginLeft: '3rem' }}>$ {totalPrice}</span>
            </h2>

            <TextButton
               style={{ width: '100%', marginTop: '14px' }}
               type="solid"
               onClick={handleCheckout}
            >
               Proceed To Pay
            </TextButton>
         </PriceBox>
      </Wrapper>
   )
}

const PriceBox = styled.div`
   width: 30%;
   padding: 24px;
`

const Wrapper = styled.div`
   width: 100%;
   color: #555b6e;

   h1,
   h2 {
      font-size: 16px;
   }

   p {
      font-size: 12px;
      margin-top: 4px;
   }
`

const Pillar = styled.span`
   margin: 0 8px;
   border: 1px solid #ececec;
`
