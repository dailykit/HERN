import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   TunnelHeader,
   Flex,
   RadioGroup,
   Spacer,
   Form,
   Text,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { Tooltip, Banner } from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { CREATE_LOYALTY_POINT_TXN } from '../../../../graphql/mutations'
import validators from '../../../validators'

const LoyaltyPointsTxnTunnel = ({
   closeLoyaltyPointsTxnTunnel,
   loyaltyPointId,
}) => {
   const [points, setPoints] = React.useState({
      value: 100,
      meta: {
         isValid: true,
         isTouched: false,
         errors: [],
      },
   })
   const [type, setType] = React.useState('CREDIT')

   const options = [
      { id: 'credit', title: 'Credit' },
      { id: 'debit', title: 'Debit' },
   ]

   const [createTxn, { loading }] = useMutation(CREATE_LOYALTY_POINT_TXN, {
      onCompleted: () => {
         toast.success('Transaction created!')
         closeLoyaltyPointsTxnTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const handleCreateTxn = () => {
      console.log({ points, type, loyaltyPointId })
      if (loading || !points.meta.isValid || !loyaltyPointId) return
      createTxn({
         variables: {
            object: {
               points: parseFloat(points.value),
               type,
               loyaltyPointId,
            },
         },
      })
   }

   const handleBlur = ({ name, value }) => {
      switch (name) {
         case 'points': {
            const { isValid, errors } = validators.points(value)
            setPoints({
               ...points,
               meta: {
                  isValid,
                  errors,
                  isTouched: true,
               },
            })
         }
      }
   }

   return (
      <>
         <TunnelHeader
            title="Loyalty Points Transaction"
            close={() => closeLoyaltyPointsTxnTunnel(1)}
            tooltip={
               <Tooltip identifier="customer_loyalty_points_txn_tunnelHeader" />
            }
            right={{
               title: 'Create',
               action: handleCreateTxn,
            }}
         />
         <Banner id="crm-app-customers-customer-details-loyalty-point-txn-tunnel-top" />
         <Flex padding="16px">
            <Text as="subtitle">Type</Text>
            <RadioGroup
               options={options}
               active={'credit'}
               onChange={option => setType(option.title.toUpperCase())}
            />
            <Spacer size="24px" />
            <Form.Group>
               <Form.Label htmlFor="points" title="points">
                  Points*
               </Form.Label>
               <Form.Number
                  id="points"
                  name="points"
                  onChange={e =>
                     setPoints({ ...points, value: e.target.value.trim() })
                  }
                  onBlur={e => handleBlur(e.target)}
                  value={points.value}
                  placeholder="Enter points"
                  hasError={points.meta.isTouched && !points.meta.isValid}
               />
               {points.meta.isTouched &&
                  !points.meta.isValid &&
                  points.meta.errors.map((error, index) => (
                     <Form.Error justifyContent="center" key={index}>
                        {error}
                     </Form.Error>
                  ))}
            </Form.Group>
         </Flex>
         <Banner id="crm-app-customers-customer-details-loyalty-point-txn-tunnel-bottom" />
      </>
   )
}

export default LoyaltyPointsTxnTunnel
