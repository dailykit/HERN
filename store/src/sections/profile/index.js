import { useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import { Button, Form, Loader, ProfileSidebar, Spacer } from '../../components'
import { useUser } from '../../context'
import {
   BRAND,
   SUBSCRIPTION_PLAN,
   UPDATE_PLATFORM_CUSTOMER,
} from '../../graphql'
import { useConfig } from '../../lib'
import { getRoute, isClient } from '../../utils'
import * as moment from 'moment'

export const Profile = () => {
   const { isConfigLoading } = useConfig()
   const { settings } = useConfig()
   const { isLoading } = useUser()
   if (isConfigLoading || isLoading) return <Loader component />

   const isSubscriptionStore =
      settings?.availability?.['isSubscriptionAvailable']?.Subscription
         ?.isSubscriptionAvailable?.value ?? false
   return (
      <main className="hern-profile__main">
         <ProfileSidebar />
         <div>
            <ProfileForm />
            {isSubscriptionStore && <CurrentPlan />}
         </div>
      </main>
   )
}

const ProfileForm = () => {
   const { user } = useUser()
   const { configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')
   const { addToast } = useToasts()

   const [firstName, setFirstName] = useState(
      user?.platform_customer?.firstName
   )
   const [lastName, setLastName] = useState(user?.platform_customer?.lastName)

   const [updateCustomer] = useMutation(UPDATE_PLATFORM_CUSTOMER, {
      onCompleted: () => {
         addToast('User info updated succesfully !', {
            appearance: 'success',
         })
      },
      onError: error => {
         console.error(error)

         addToast('Failed to save!', {
            appearance: 'error',
         })
      },
   })
   React.useEffect(() => {
      setFirstName(user?.platform_customer?.firstName)
      setLastName(user?.platform_customer?.lastName)
   }, [user])

   const handleSubmit = async e => {
      e.preventDefault()
      if (user?.keycloakId) {
         await updateCustomer({
            variables: {
               keycloakId: user.keycloakId,
               _set: { firstName: firstName, lastName: lastName },
            },
         })
      }
   }
   return (
      <section className="hern-profile__profile-form">
         <header className="hern-profile__profile-form__header">
            <h2
               className="hern-profile__profile-form__header__title"
               style={{
                  color: `${theme.accent ? theme.accent : 'rgba(5,150,105,1)'}`,
               }}
            >
               Profile
            </h2>
         </header>
         <Form.Field>
            <Form.Label>Email</Form.Label>
            <Form.DisabledText value={user?.platform_customer?.email} />
         </Form.Field>
         <div className="hern-profile__profile-form__name">
            <Form.Field>
               <Form.Label>First Name</Form.Label>
               <Form.Text
                  type="text"
                  name="firstName"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
               />
            </Form.Field>
            <Form.Field>
               <Form.Label>Last Name</Form.Label>
               <Form.Text
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Enter your last name"
               />
            </Form.Field>
         </div>
         <Button
            onClick={handleSubmit}
            type="submit"
            disabled={!firstName?.length || !lastName?.length}
         >
            Submit
         </Button>
      </section>
   )
}

const CurrentPlan = () => {
   const router = useRouter()
   const { user } = useUser()
   const { addToast } = useToasts()
   const { brand, configOf } = useConfig()

   const theme = configOf('theme-color', 'Visual')

   const [plan, setPlan] = React.useState(null)
   const [isCancelFormVisible, setIsCancelFormVisible] = React.useState(false)
   const [reason, setReason] = React.useState('')
   const [isPauseFormVisible, setIsPauseFormVisible] = React.useState(false)
   const [startDate, setStartDate] = React.useState('')
   const [endDate, setEndDate] = React.useState('')
   const [isPlanPaused, setIsPlanPaused] = React.useState(false)

   React.useEffect(() => {
      if (user?.pausePeriod && Object.keys(user.pausePeriod).length) {
         const today = Date.now()
         const start = Date(user.pausePeriod.startDate)
         const end = Date(user.pausePeriod.endDate)
         if (today >= start && today <= end) {
            setIsPlanPaused(true)
         }
      }
   }, [user?.pausePeriod])

   const { loading } = useQuery(SUBSCRIPTION_PLAN, {
      skip: !(user.subscriptionId && user.brandCustomerId),
      variables: {
         subscriptionId: user.subscriptionId,
         brandCustomerId: user.brandCustomerId,
      },
      onCompleted: data => {
         if (data?.subscription_subscription?.length) {
            const [fetchedPlan] = data.subscription_subscription
            setPlan({
               name: fetchedPlan.subscriptionItemCount.subscriptionServing
                  .subscriptionTitle.title,
               itemCount: fetchedPlan.subscriptionItemCount.count,
               servings:
                  fetchedPlan.subscriptionItemCount.subscriptionServing
                     .servingSize,
            })
         }
      },
      onError: error => {
         console.log(error)
         addToast('Failed to fetch current plan!', { appearance: 'error' })
      },
   })

   const [updateBrandCustomer] = useMutation(BRAND.CUSTOMER.UPDATE, {
      onCompleted: () => {
         addToast('Successfully updated subscription status.', {
            appearance: 'success',
         })
         setIsCancelFormVisible(false)
         setIsPauseFormVisible(false)
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   const handleCancellation = e => {
      e.preventDefault()
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: { _eq: user?.keycloakId },
               brandId: { _eq: brand.id },
            },
            _set: {
               isSubscriptionCancelled: true,
               ...(reason && { subscriptionCancellationReason: reason }),
            },
         },
      })
   }

   const handleReactivation = () => {
      const isConfirmed =
         isClient &&
         window.confirm('Are you sure you want to reactivate subscription?')
      if (isConfirmed) {
         updateBrandCustomer({
            variables: {
               where: {
                  keycloakId: { _eq: user?.keycloakId },
                  brandId: { _eq: brand.id },
               },
               _set: {
                  isSubscriptionCancelled: false,
                  subscriptionCancellationReason: '',
               },
            },
         })
      }
   }

   const handlePausePlan = e => {
      e.preventDefault()
      if (startDate && endDate) {
         const start = new Date(startDate)
         const end = new Date(endDate)
         const now = moment().format('YYYY-MM-DD')
         if (moment(start).isBefore(now)) {
            return addToast('Start date is not valid!', { appearance: 'error' })
         } else if (moment(end).isBefore(now)) {
            return addToast('End date is not valid!', { appearance: 'error' })
         } else if (moment(end).isBefore(start)) {
            return addToast(
               'End date should be greater than or same as start date!',
               {
                  appearance: 'error',
               }
            )
         } else {
            updateBrandCustomer({
               variables: {
                  where: {
                     keycloakId: { _eq: user?.keycloakId },
                     brandId: { _eq: brand.id },
                  },
                  _set: {
                     pausePeriod: {
                        startDate,
                        endDate,
                     },
                  },
               },
            })
         }
      }
   }

   const clearPausePeriod = () => {
      updateBrandCustomer({
         variables: {
            where: {
               keycloakId: { _eq: user?.keycloakId },
               brandId: { _eq: brand.id },
            },
            _set: {
               pausePeriod: {},
            },
         },
      })
   }

   if (loading) return <Loader inline />
   if (user?.isSubscriptionCancelled)
      return (
         <div className="hern-profile_current-plan">
            <Button size="sm" onClick={handleReactivation}>
               Reactivate Subscription
            </Button>
         </div>
      )
   return (
      <div className="hern-profile__current-plan">
         <hr className="hern-profile__divider" />
         <Spacer size="xl" />
         <h4
            className="hern-profile__current-plan__heading"
            style={{
               color: `${theme.accent ? theme.accent : 'rgba(5,150,105,1)'}`,
            }}
         >
            Your current plan {isPlanPaused && `(PAUSED)`}
         </h4>
         <div className="hern-profile__current-plan__card">
            <div>
               <small className="hern-profile__current-plan__card__changeplan-key">
                  Name
               </small>
               <p className="hern-profile__current-plan__card__changeplan-value">
                  {plan?.name}
               </p>
            </div>
            <div>
               <small className="hern-profile__current-plan__card__changeplan-key">
                  Item Count
               </small>
               <p className="hern-profile__current-plan__card__changeplan-value">
                  {plan?.itemCount}
               </p>
            </div>
            <div>
               <small className="hern-profile__current-plan__card__changeplan-key">
                  Servings
               </small>
               <p className="hern-profile__current-plan__card__changeplan-value">
                  {plan?.servings}
               </p>
            </div>
         </div>
         <Button
            size="sm"
            theme={theme}
            onClick={() => router.push(getRoute(`/change-plan`))}
         >
            Change Plan
         </Button>
         <Spacer size="xl" />
         <hr className="hern-profile__divider" />
         <Spacer size="xl" />
         {isPauseFormVisible ? (
            <form
               className="hern-profile__pause-plan__form"
               onSubmit={handlePausePlan}
            >
               <div className="hern-profile__pause-plan__form__wrapper">
                  <Form.Field>
                     <Form.Label>Start Date*</Form.Label>
                     <Form.Text
                        type="date"
                        name="start-date"
                        onChange={e => setStartDate(e.target.value)}
                        value={startDate}
                        required
                     />
                  </Form.Field>
                  <Spacer xAxis />
                  <Form.Field>
                     <Form.Label>End Date*</Form.Label>
                     <Form.Text
                        type="date"
                        name="end-date"
                        onChange={e => setEndDate(e.target.value)}
                        value={endDate}
                        required
                     />
                  </Form.Field>
               </div>
               <Button variant="warn" size="sm" type="submit">
                  Yes! Pause my plan.
               </Button>

               <Spacer xAxis />
               <Button
                  variant="dull"
                  size="sm"
                  type="reset"
                  onClick={() => setIsPauseFormVisible(false)}
               >
                  No! I changed my mind.
               </Button>
            </form>
         ) : (
            <>
               {!!user?.pausePeriod && Object.keys(user.pausePeriod).length ? (
                  <div>
                     <p className="hern-profile__pause-period-details">
                        Plan pause interval starts from{' '}
                        <span>
                           {moment(user.pausePeriod.startDate).format(
                              'MMM Do YYYY'
                           )}
                        </span>{' '}
                        and ends on{' '}
                        <span>
                           {moment(user.pausePeriod.endDate).format(
                              'MMM Do YYYY'
                           )}
                        </span>
                     </p>
                     <Button size="sm" theme={theme} onClick={clearPausePeriod}>
                        Clear Pause Interval
                     </Button>
                  </div>
               ) : (
                  <Button
                     variant="warn"
                     size="sm"
                     theme={theme}
                     onClick={() => setIsPauseFormVisible(true)}
                  >
                     Pause Plan
                  </Button>
               )}
            </>
         )}
         <Spacer />
         {isCancelFormVisible ? (
            <form
               className="hern-profile__cancellation-form"
               onSubmit={handleCancellation}
            >
               <Form.Field>
                  <Form.Label>Reason(Optional)</Form.Label>
                  <Form.Text
                     type="text"
                     name="reason"
                     placeholder="Enter your reason"
                     onChange={e => setReason(e.target.value)}
                     value={reason}
                  />
               </Form.Field>
               <Button variant="warn" size="sm" type="submit">
                  Yes! Cancel my subscription.
               </Button>
               <Spacer xAxis size="xm" />
               <Button
                  variant="dull"
                  size="sm"
                  type="reset"
                  onClick={() => setIsCancelFormVisible(false)}
               >
                  No! I changed my mind.
               </Button>
            </form>
         ) : (
            <Button
               variant="danger"
               size="sm"
               theme={theme}
               onClick={() => setIsCancelFormVisible(true)}
            >
               Cancel Subscription
            </Button>
         )}
      </div>
   )
}
