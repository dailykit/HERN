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
import { Banner, Tooltip } from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { CREATE_WALLET_TXN } from '../../../../graphql/mutations'
import validators from '../../../validators'

const WalletTxnTunnel = ({ closeWalletTxnTunnel, walletId }) => {
   const [amount, setAmount] = React.useState({
      value: 10,
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

   const [createTxn, { loading }] = useMutation(CREATE_WALLET_TXN, {
      onCompleted: () => {
         toast.success('Transaction created!')
         closeWalletTxnTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const handleCreateTxn = () => {
      console.log({ amount, type, walletId })
      if (loading || !amount.meta.isValid || !walletId) return
      createTxn({
         variables: {
            object: {
               amount: parseFloat(amount.value),
               type,
               walletId,
            },
         },
      })
   }

   const handleBlur = ({ name, value }) => {
      switch (name) {
         case 'amount': {
            const { isValid, errors } = validators.amount(value)
            setAmount({
               ...amount,
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
            title="Wallet Transaction"
            close={() => closeWalletTxnTunnel(1)}
            tooltip={<Tooltip identifier="customer_wallet_txn_tunnelHeader" />}
            right={{
               title: 'Create',
               action: handleCreateTxn,
            }}
         />
         <Banner id="crm-app-customers-customer-details-wallet-txn-tunnel-top" />
         <Flex padding="16px">
            <Text as="subtitle">Type</Text>
            <RadioGroup
               options={options}
               active={'credit'}
               onChange={option => setType(option.title.toUpperCase())}
            />
            <Spacer size="24px" />
            <Form.Group>
               <Form.Label htmlFor="amount" title="amount">
                  Amount*
               </Form.Label>
               <Form.Number
                  id="amount"
                  name="amount"
                  onChange={e =>
                     setAmount({ ...amount, value: e.target.value.trim() })
                  }
                  onBlur={e => handleBlur(e.target)}
                  value={amount.value}
                  placeholder="Enter amount"
                  hasError={amount.meta.isTouched && !amount.meta.isValid}
               />
               {amount.meta.isTouched &&
                  !amount.meta.isValid &&
                  amount.meta.errors.map((error, index) => (
                     <Form.Error justifyContent="center" key={index}>
                        {error}
                     </Form.Error>
                  ))}
            </Form.Group>
         </Flex>
         <Banner id="crm-app-customers-customer-details-wallet-txn-tunnel-bottom" />
      </>
   )
}

export default WalletTxnTunnel
