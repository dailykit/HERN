import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonTile, Flex, Form, Spacer, TunnelHeader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { useTabs } from '../../providers'
import validator from '../validator'
import { Banner, Tooltip } from '../../components'
import {
   INSERT_SUBSCRIPTION,
   INSERT_SUBSCRIPTIONS,
} from '../../../apps/subscription/graphql'

const CreateSubscription = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [subscription, setSubscription] = React.useState([
      {
         subscriptionName: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createSubscription, { loading }] = useMutation(INSERT_SUBSCRIPTIONS, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.insert_subscription_subscriptionTitle.returning.map(
                  separateTab => {
                     addTab(
                        separateTab.title,
                        `/subscription/subscriptions/${separateTab.id}`
                     )
                  }
               )
            }
         }
         console.log('The input contains:', input)
         setSubscription([
            {
               subscriptionName: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Subscription!')
         closeTunnel(14)
      },
      onError: () =>
         toast.success('Failed to create the Subscription, please try again!'),
   })

   const createSubscriptionHandler = () => {
      try {
         const objects = subscription.filter(Boolean).map(subscription => ({
            title: `${subscription.subscriptionName.value}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         console.log('pas9ygy0U8::::::', objects)
         createSubscription({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedSubscription = subscription
      const { name, value } = e.target
      if (name === `subscriptionName-${i}`) {
         const subscriptionNameIs = updatedSubscription[i].subscriptionName
         const subscriptionNameMeta =
            updatedSubscription[i].subscriptionName.meta

         subscriptionNameIs.value = value
         subscriptionNameMeta.isTouched = true
         subscriptionNameMeta.errors = validator.text(value).errors
         subscriptionNameMeta.isValid = validator.text(value).isValid
         setSubscription([...updatedSubscription])
         console.log('Subscription Name::::', subscription)
      }
   }
   console.log('subscription :>> ', subscription)

   // const onBlur = (e, i) => {
   //    const { name, value } = e.target
   //    if (name === `subscriptionName-${i}` && name === `subscriptionAuthor-${i}`) {
   //       const subscriptionInstant = subscription[i]

   //       setSubscription([
   //          ...subscription,
   //          {
   //             ...subscriptionInstant,
   //             subscriptionName: {
   //                ...subscriptionInstant.subscriptionName,
   //                meta: {
   //                   ...subscriptionInstant.subscriptionName.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //             subscriptionAuthor: {
   //                ...subscriptionInstant.subscriptionAuthor,
   //                meta: {
   //                   ...subscriptionInstant.subscriptionAuthor.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //          },
   //       ])
   //    }
   // }

   const save = type => {
      setClick(type)
      let subscriptionValid = true
      subscription.map(subscription => {
         subscriptionValid = subscription.subscriptionName.meta.isValid
         subscriptionValid = subscriptionValid && true
         return subscriptionValid
      })

      if (subscriptionValid === true) {
         return createSubscriptionHandler()
      }
      return toast.error('Subscription Name and Author is required!')
   }
   const close = () => {
      setSubscription([
         {
            subscriptionName: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
         },
      ])
      closeTunnel(14)
   }
   return (
      <>
         <TunnelHeader
            title="Add Subscription"
            right={{
               action: () => {
                  save('save')
               },
               title: loading && click === 'save' ? 'Saving...' : 'Save',
               // disabled: types.filter(Boolean).length === 0,
            }}
            extraButtons={[
               {
                  action: () => {
                     save('SaveAndOpen')
                  },
                  title:
                     loading && click === 'SaveAndOpen'
                        ? 'Saving...'
                        : 'Save & Open',
               },
            ]}
            close={close}
            tooltip={<Tooltip identifier="create_subscription_tunnelHeader" />}
         />
         <Banner id="subscription-app-subscription-create-subscription-tunnel-top" />
         <Flex padding="16px">
            {subscription.map((subscription, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`subscriptionName-${i}`}
                        title={`subscriptionName-${i}`}
                     >
                        Subscription Name*
                     </Form.Label>
                     <Form.Text
                        id={`subscriptionName-${i}`}
                        name={`subscriptionName-${i}`}
                        value={subscription.subscriptionName.value}
                        placeholder="Enter subscription name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `subscriptionName-${i}`)}
                        hasError={
                           !subscription.subscriptionName.meta.isValid &&
                           subscription.subscriptionName.meta.isTouched
                        }
                     />
                     {subscription.subscriptionName.meta.isTouched &&
                        !subscription.subscriptionName.meta.isValid &&
                        subscription.subscriptionName.meta.errors.map(
                           (error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           )
                        )}
                  </Form.Group>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Subscription"
               onClick={() =>
                  setSubscription([
                     ...subscription,
                     {
                        subscriptionName: {
                           value: null,
                           meta: {
                              isValid: false,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     },
                  ])
               }
            />
         </Flex>
         <Spacer xAxis size="24px" />
         <Banner id="subscription-app-subscription-create-subscription-tunnel-bottom" />
      </>
   )
}

export default CreateSubscription
