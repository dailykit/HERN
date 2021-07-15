import React, { useState } from 'react'
import { Checkbox } from '@dailykit/ui'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { PriceTable, TableHead, TableBody, TableRow, TableCell } from './styled'
import QuantityHandler from './QuantityHandler'

import {
   ORGANIZATION_PURCHASE_ORDER,
   REGISTER_PURCHASE_ORDER,
   CREATE_PURCHASE_ORDER_ITEMS,
} from '../graphql'

export default function ProductPrice({ product }) {
   const { packagingPurchaseOptions } = product

   const [purchaseOptions, setPurchaseOptions] = useState(
      packagingPurchaseOptions.map(x => ({
         ...x,
         isSelected: false,
         multiplier: 0,
      })) || []
   )

   const calculateAmount = () =>
      purchaseOptions
         .reduce((acc, curr) => {
            const price = curr.isSelected
               ? curr.salesPrice * curr.multiplier
               : 0
            return acc + price
         }, 0)
         .toFixed(3)

   const [createPurchaseOrderItems] = useMutation(CREATE_PURCHASE_ORDER_ITEMS, {
      onError: error => {
         console.log(error)
         toast.error(error.message)
      },
      onCompleted: () => {
         const reset =
            packagingPurchaseOptions.map(x => ({
               ...x,
               isSelected: false,
               multiplier: 0,
            })) || []

         setPurchaseOptions(reset)
         toast.success('Purchase Order successfully created !')
      },
   })

   const checkout = orgId => {
      // create purchaseOrderItem for each purchaseOptions
      const objects = purchaseOptions
         .filter(opt => opt.isSelected && opt.multiplier > 0)
         .map(opt => {
            return {
               packagingId: product.id,
               packagingPurchaseOptionId: opt.id,
               purchaseOrderId: orgId,
               quantity: opt.quantity,
               multiplier: opt.multiplier,
               salesPrice: opt.salesPrice,
            }
         })

      if (!objects.length)
         return toast.error("you haven't selected any purchase options !")

      createPurchaseOrderItems({ variables: { objects } })
   }

   const [createPurchaseOrder] = useMutation(REGISTER_PURCHASE_ORDER, {
      onCompleted: data => {
         if (
            data &&
            Array.isArray(
               data.insert_organizationPurchaseOrders_purchaseOrder?.returning
            ) &&
            data.insert_organizationPurchaseOrders_purchaseOrder.returning[0]
               ?.id
         ) {
            const orgId =
               data.insert_organizationPurchaseOrders_purchaseOrder.returning[0]
                  ?.id
            checkout(orgId)
         }
      },
      onError: error => {
         console.log(error)
         toast.error(error.message)
      },
   })

   const [getPurchaseOrders] = useLazyQuery(ORGANIZATION_PURCHASE_ORDER, {
      fetchPolicy: 'network-only',
      onError: error => {
         console.log(error)
         toast.error(error.message)
      },

      onCompleted: data => {
         let orgId = null
         if (
            data &&
            Array.isArray(data.organizationPurchaseOrders_purchaseOrder) &&
            data.organizationPurchaseOrders_purchaseOrder[0]?.id
         ) {
            orgId = data.organizationPurchaseOrders_purchaseOrder[0].id
            checkout(orgId)
         } else {
            createPurchaseOrder()
         }
      },
   })

   const selectOption = index => {
      setPurchaseOptions(curr => {
         const newOptions = [...curr]
         newOptions[index].isSelected = !newOptions[index].isSelected

         if (newOptions[index].isSelected) {
            newOptions[index].multiplier += 1
         } else {
            newOptions[index].multiplier -= 1
         }

         return newOptions
      })
   }

   const incrementMultiplier = (index, e) => {
      e.stopPropagation()
      setPurchaseOptions(curr => {
         const newOptions = [...curr]

         if (!newOptions[index].isSelected) return

         newOptions[index].multiplier += 1

         return newOptions
      })
   }

   const decrementMultiplier = (index, e) => {
      e.stopPropagation()

      setPurchaseOptions(curr => {
         const newOptions = [...curr]

         if (!newOptions[index].isSelected) return
         if (newOptions[index].multiplier === 0) {
            newOptions[index].isSelected = false
            return newOptions
         }

         newOptions[index].multiplier -= 1

         return newOptions
      })
   }

   return (
      <Wrapper>
         <h3>Available Packages</h3>
         <PriceTable>
            <TableHead>
               <TableRow>
                  <TableCell />
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price Per Unit</TableCell>
                  <TableCell>No. of Units</TableCell>
                  <TableCell align="right">Total Price</TableCell>
               </TableRow>
            </TableHead>
            <TableBody>
               {purchaseOptions.map((opt, index) => (
                  <TableRow
                     key={opt.id}
                     onClick={() => selectOption(index)}
                     isSelected={opt.isSelected}
                  >
                     <TableCell>
                        <Checkbox
                           id="label"
                           checked={opt.isSelected}
                           onChange={() => selectOption(index)}
                        />
                     </TableCell>
                     <TableCell>
                        {opt.quantity} {opt.unit}
                     </TableCell>
                     <TableCell>$ {opt.salesPrice}</TableCell>
                     <TableCell>
                        {opt.isSelected ? (
                           <QuantityHandler
                              onInc={e => incrementMultiplier(index, e)}
                              onDec={e => decrementMultiplier(index, e)}
                              value={opt.multiplier}
                           />
                        ) : null}
                     </TableCell>
                     <TableCell align="right">
                        {opt.isSelected ? (
                           <span>
                              {(opt.multiplier * opt.salesPrice).toFixed(3)} $
                           </span>
                        ) : null}
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </PriceTable>

         <ActionButton onClick={getPurchaseOrders}>
            ADD TO PURCHASE ORDER
            <span style={{ marginLeft: '16px' }}>({calculateAmount()} $)</span>
         </ActionButton>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   margin-top: 39px;
   h3 {
      font-size: 16px;
      line-height: 19px;
      color: #555b6e;
   }
`

const ActionButton = styled.button`
   margin-top: 16px;
   width: 100%;
   height: 48px;
   cursor: pointer;
   border: 0;

   background: linear-gradient(180deg, #28c1f7 -4.17%, #00a7e1 100%);
   color: #fff;
`
