import { useQuery } from '@apollo/react-hooks'
import classNames from 'classnames'
import React from 'react'
import { useToasts } from 'react-toast-notifications'
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
      <div className="hern-address-list">
         <div className="hern-address-list__header">
            <h3 className="hern-address-list__heading">Available Addresses</h3>
            <button className="hern-address-list__close-btn">
               <CloseIcon
                  size={16}
                  color=" rgba(52,211,153,1)"
                  stroke="currentColor"
                  onClick={closeTunnel}
               />
            </button>
         </div>
         {addresses.map(address => {
            const isNotClickable = !availableZipcodes.includes(address.zipcode)
            const addressClasses = classNames('hern-address-list__address', {
               'hern-address-list__address--not-clickable': isNotClickable,
            })
            return (
               <address
                  key={address.id}
                  className={addressClasses}
                  onClick={() => selectAddress(address)}
               >
                  <p>{address?.line1}</p>
                  <p>{address?.line2}</p>
                  <p>{address?.city}</p>
                  <p>{address?.state}</p>
                  <p>{address?.country}</p>
                  <p>{address?.zipcode}</p>
               </address>
            )
         })}
      </div>
   )
}

export default AddressList
