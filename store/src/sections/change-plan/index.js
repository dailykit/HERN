import React from 'react'
import { useUser } from '../../context'
import { useToasts } from 'react-toast-notifications'
import { useConfig } from '../../lib'
import { Plans } from '../../sections/select-plan'
import { useRouter } from 'next/router'
import {
   AddressSection,
   DeliveryDateSection,
   DeliveryProvider,
   DeliverySection,
   useDelivery,
} from '../../sections/select-delivery'
import { BRAND } from '../../graphql'
import { useMutation } from '@apollo/react-hooks'
import { getRoute, isClient, useThemeStyle } from '../../utils'
import { Button } from '../../components'

export const ChangePlan = () => {
   return (
      <DeliveryProvider>
         <ChangePlanSection />
      </DeliveryProvider>
   )
}

const ChangePlanSection = () => {
   const router = useRouter()
   const { user, isAuthenticated, isLoading } = useUser()
   const { addToast } = useToasts()
   const { brand } = useConfig()
   const { state, dispatch } = useDelivery()

   const [selectedPlanId, setSelectedPlanId] = React.useState(null)
   const themeColor = useThemeStyle('color')
   React.useEffect(() => {
      if (!isAuthenticated && !isLoading) {
         isClient && localStorage.setItem('landed_on', location.href)
         router.push(getRoute('/'))
      }
   }, [isAuthenticated, isLoading])

   React.useEffect(() => {
      dispatch({ type: 'RESET' })
   }, [selectedPlanId])

   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onCompleted: () => {
         addToast('Successfully changed plan.', {
            appearance: 'success',
         })
         router.push(getRoute(`/account/profile`))
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   const handleSubmit = () => {
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: { _eq: user?.keycloakId },
               brandId: { _eq: brand.id },
            },
            _set: {
               subscriptionId: state.delivery.selected.id,
               subscriptionAddressId: state.address.selected.id,
            },
         },
      })
   }

   const handlePlanClick = planId => {
      // TODO: don't allow user to select their current plan
      addToast('Plan Selected!', { appearance: 'success' })
      setSelectedPlanId(planId)
   }

   const isValid = () => {
      if (Object.keys(state.delivery.selected).length === 0) return false
      if (Object.keys(state.address.selected).length === 0) return false
      if (Object.keys(state.delivery_date.selected).length === 0) return false
      if (state.address.error) return false
      return true
   }

   return (
      <>
         <h2
            className="hern-change-plan__heading"
            style={useThemeStyle('color')}
         >
            Change Plan
         </h2>
         <Plans handlePlanClick={handlePlanClick} />
         {!!selectedPlanId && (
            <div className="hern-change-plan__other-info">
               <AddressSection />
               <h3
                  className="hern-change-plan__section-title"
                  style={themeColor}
               >
                  Delivery Day
               </h3>
               <DeliverySection planId={selectedPlanId} />
               <h3
                  className="hern-change-plan__section-title"
                  style={themeColor}
               >
                  Select your first delivery date
               </h3>
               <DeliveryDateSection />
               <div className="hern-change-plan__continue-btn-wrapper">
                  <Button onClick={handleSubmit} disabled={!isValid()}>
                     Continue
                  </Button>
               </div>
            </div>
         )}
      </>
   )
}
