import { useQuery } from '@apollo/react-hooks'
import React from 'react'
import { useToasts } from 'react-toast-notifications'
import tw, { styled } from 'twin.macro'
import { CloseIcon } from '../assets/icons'
import { useUser } from '../context'
import { ZIPCODE_AVAILABILITY } from '../graphql'
import { Loader } from './loader'

const AddressList = ({ closeTunnel, onSelect }) => {
   const { user } = useUser()
   const { addToast } = useToasts()

   const addresses = user?.platform_customer?.addresses || []

   const [availableZipcodes, setAvailableZipcodes] = React.useState([])

   const { loading } = useQuery(ZIPCODE_AVAILABILITY, {
      fetchPolicy: 'network-only',
      variables: {
         subscriptionId: {
            _eq: user?.subscriptionId,
         },
         zipcode: {},
      },
      onCompleted: ({ subscription_zipcode = [] }) => {
         if (subscription_zipcode.length) {
            setAvailableZipcodes(subscription_zipcode.map(z => z.zipcode))
         }
      },
      onError: error => {
         addToast('Something went wrong', { appearance: 'error' })
         console.log('checkZipcodeValidity -> zipcode -> error', error)
      },
   })

   const selectAddress = address => {
      if (availableZipcodes.includes(address.zipcode)) {
         onSelect(address)
      }
   }

   if (loading) return <Loader />
   return (
      <Styles.Wrapper>
         <Styles.ListHeader>
            <Styles.Heading>Available Addresses</Styles.Heading>
            <button tw="rounded-full border-2 border-green-400 h-6 w-8 flex items-center justify-center">
               <CloseIcon
                  size={16}
                  tw="stroke-current text-green-400"
                  onClick={closeTunnel}
               />
            </button>
         </Styles.ListHeader>
         {addresses.map(address => (
            <div
               css={[
                  tw`border border-gray-300 border-2 p-2 mb-2 rounded-sm cursor-pointer hover:border-green-500`,
                  !availableZipcodes.includes(address.zipcode) &&
                     tw`text-gray-400 cursor-not-allowed hover:border-gray-300`,
               ]}
               onClick={() => selectAddress(address)}
            >
               <p>{address?.line1}</p>
               <p>{address?.line2}</p>
               <p>{address?.city}</p>
               <p>{address?.state}</p>
               <p>{address?.country}</p>
               <p>{address?.zipcode}</p>
            </div>
         ))}
      </Styles.Wrapper>
   )
}

export default AddressList

const Styles = {
   Wrapper: styled.div`
      padding: 16px;
   `,
   ListHeader: styled.div`
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
   `,
   Heading: styled.h3`
      color: gray;
   `,
}
