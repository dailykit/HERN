import React, { useState } from 'react'
import { TunnelHeader, Loader } from '@dailykit/ui'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import {
   ORGANIZATION_PAYMENT_INFO,
   CREATE_ORDER_TRANSACTION,
   REGISTER_PACKAGING,
   CART_ITEMS_FOR_REGISTERING,
} from '../../graphql'
import { TunnelContainer } from '../../../components'
import useOrganizationBalanceInfo from '../../hooks/useOrganizationBalance'

import StripeBalance from './StripeBalance'
import PaymentDetails from './PaymentDetails'
import { Banner } from '../../../../../shared/components'

export default function CartTunnel({ close }) {
   const [balanceChecked, setBalanceChecked] = useState(false)

   const [createTransaction, { loading: transactionLoading }] = useMutation(
      CREATE_ORDER_TRANSACTION,
      {
         onError: error => {
            toast.error(error.message)
            console.log(error)
         },
         onCompleted: () => {
            toast.success('Order received!')
            close(2)
            close(1)
         },
      }
   )

   const [registerPackaging] = useMutation(REGISTER_PACKAGING, {
      onError: error => {
         toast.error(error.message)
         console.log(error)
      },
      onCompleted: () => {
         toast.success('Packaging registered in inventory!')
      },
   })

   const handleBalanceCheck = () => {
      setBalanceChecked(checked => !checked)
   }

   const {
      data: { organizationPurchaseOrders_purchaseOrder: org = [] } = {},
      loading,
   } = useQuery(ORGANIZATION_PAYMENT_INFO, {
      fetchPolicy: 'network-only',
      onError: error => {
         console.log(error)
         toast.error(error.message)
      },
   })

   const {
      data: {
         organizationPurchaseOrders_purchaseOrderItem: cartItems = [],
      } = {},
   } = useQuery(CART_ITEMS_FOR_REGISTERING, {
      fetchPolicy: 'network-only',
      onError: error => {
         console.log(error)
         toast.error(error.message)
      },
   })

   const handlePayment = () => {
      // add other payment checked here.
      if (!balanceChecked) return toast.error('Please select a payment method.')

      // later object will be Array of multiple payment methods selected by the user.

      createTransaction({
         variables: {
            objects: {
               chargeAmount: org[0]?.netChargeAmount,
               connectedAccountId: org[0]?.organization?.stripeAccountId,
               purchaseOrderId: org[0]?.id,
               // if the selceted method is balance then 'BALANCE', default is 'CARD'
               type: 'BALANCE',
            },
         },
      })

      // also create a local copy with supplier info, packaging info and a purchaseOrdetItem entry for local management in dailyos.

      const objects = cartItems.map(item => ({
         name:
            item.packaging.packagingCompanyBrand.packagingCompany.supplierName,
         mandiSupplierId:
            item.packaging.packagingCompanyBrand.packagingCompany.id,
         packagings: {
            data: {
               name: item.packaging.packagingName,
               mandiPackagingId: item.packaging.id,
               unitQuantity:
                  item.packaging.packagingPurchaseOptions[0]?.quantity,
               minOrderValue:
                  item.packaging.packagingPurchaseOptions[0]?.quantity,
               assets: item.packaging.assets,
               length: item.packaging.length,
               width: item.packaging.width,
               height: item.packaging.height,
               gusset: item.packaging.gusset,
               thickness: item.packaging.thickness,
               LWHUnit: item.packaging.LWHUnit,
               loadVolume: item.packaging.loadVolume,
               loadCapacity: item.packaging.loadCapacity,
               purchaseOrderItems: {
                  data: {
                     orderQuantity: (item.quantity * item.multiplier).toFixed(
                        3
                     ),
                     mandiPurchaseOrderItemId:
                        item.packaging.purchaseOrderItems &&
                        item.packaging.purchaseOrderItems.length
                           ? item.packaging.purchaseOrderItems[0].id
                           : null,
                  },
                  on_conflict: {
                     constraint:
                        'purchaseOrderItem_mandiPurchaseOrderItemId_key',
                     update_columns: ['orderQuantity', 'packagingId'],
                  },
               },
               packagingSpecification: {
                  data: {
                     mandiPackagingId: item.packaging.id,
                     innerWaterResistant:
                        item.packaging.packagingSpecification
                           .innerWaterResistant,
                     outerWaterResistant:
                        item.packaging.packagingSpecification
                           .outerWaterResistant,
                     recyclable:
                        item.packaging.packagingSpecification.recyclable,
                     compostable:
                        item.packaging.packagingSpecification.compostable,
                     fdaCompliant:
                        item.packaging.packagingSpecification.fdaCompliant,
                     innerGreaseResistant:
                        item.packaging.packagingSpecification
                           .innerGreaseResistant,
                     outerGreaseResistant:
                        item.packaging.packagingSpecification
                           .outerGreaseResistant,
                     packagingMaterial: Object.values(
                        item.packaging.packagingSpecification.packagingMaterial
                           .materials
                     ).join(', '),
                  },
                  on_conflict: {
                     constraint: 'packagingSpecifications_mandiPackagingId_key',
                     update_columns: [
                        'innerWaterResistant',
                        'outerWaterResistant',
                        'recyclable',
                        'compostable',
                        'fdaCompliant',
                        'innerGreaseResistant',
                        'outerGreaseResistant',
                        'packagingMaterial',
                     ],
                  },
               },
            },
            on_conflict: {
               constraint: 'packaging_mandiPackagingId_key',
               update_columns: [
                  'name',
                  'unitQuantity',
                  'minOrderValue',
                  'assets',
                  'length',
                  'width',
                  'height',
                  'gusset',
                  'thickness',
                  'LWHUnit',
                  'loadVolume',
                  'loadCapacity',
               ],
            },
         },
      }))

      registerPackaging({
         variables: {
            objects,
         },
      })
   }

   const {
      loading: balanceLoading,
      error,
      data: { available: availableBalance = [] } = {},
   } = useOrganizationBalanceInfo(org[0]?.organization?.stripeAccountId)

   if (error) {
      console.log(error)
      return toast.error(error.message)
   }

   if (loading || balanceLoading || transactionLoading) return <Loader />

   return (
      <>
         <TunnelHeader title="Purchase Orders" close={() => close(2)} />
         <Banner id="inventory-app-packaging-hub-products-payment-tunnel-top" />
         <Wrapper>
            <h2>Pay via:</h2>

            <StripeBalance
               availableBalance={availableBalance.filter(
                  x => x.currency === 'usd'
               )}
               checked={balanceChecked}
               setChecked={handleBalanceCheck}
            />

            <PaymentDetails
               chargeAmount={org[0]?.netChargeAmount}
               handlePayment={handlePayment}
            />
         </Wrapper>
         <Banner id="inventory-app-packaging-hub-products-payment-tunnel-bottom" />
      </>
   )
}

const Wrapper = styled(TunnelContainer)`
   width: 50%;
   color: #555b6e;

   padding: 16px 4rem;

   h2 {
      font-size: 16px;
   }

   p {
      font-size: 14px;
      font-weight: 500;
   }
`
