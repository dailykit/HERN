import React from 'react'
import { useUser } from '../context'
import classNames from 'classnames'

export const UserAddressList = ({ onAddressSelect }) => {
   const { user } = useUser()
   const [selectedAddressId, setSelectedAddressId] = React.useState(null)

   const addresses = user?.platform_customer?.addresses || []

   const onAddressClick = address => {
      onAddressSelect({
         ...address,
         latitude: address.lat,
         longitude: address.lng,
      })
      setSelectedAddressId(address?.id)
   }
   if (!user?.keycloakId) {
      return null
   }
   return (
      <div className="hern-user-address-lists">
         {addresses.map(address => {
            const addressClasses = classNames(
               'hern-user-address-list__address',
               {
                  'hern-user-address-list__address--active':
                     selectedAddressId === address?.id,
               }
            )
            return (
               <div
                  key={address?.id}
                  className={addressClasses}
                  onClick={() => {
                     onAddressClick(address)
                  }}
               >
                  <label>{address?.label}</label>
                  <span>{address?.line1}</span>
                  <span>{address?.line2}</span>
                  <div>
                     <span>{address?.state} </span>
                     <span>
                        {address?.country}
                        {', '}
                     </span>
                     <span>{address?.zipcode}</span>
                  </div>
               </div>
            )
         })}
      </div>
   )
}
{
   /* <address
                  key={address?.id}
                  className={addressClasses}
                  tabIndex={1}
                  onClick={() => selectAddress(address)}
               >
                  <div className="hern-address-list__address-landmark">
                     {address?.landmark}
                  </div>
                  <p>{address?.line1}</p>
                  <p>{address?.line2}</p>
                  <span>{address?.city} </span>
                  <span>{address?.state} </span>
                  <span>
                     {address?.country}
                     {', '}
                  </span>
                  <span>{address?.zipcode}</span>
               </address> */
}
