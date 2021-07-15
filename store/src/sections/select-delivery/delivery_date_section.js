import React from 'react'
import { useRouter } from 'next/router'
import { isEmpty } from 'lodash'
import tw, { styled, css } from 'twin.macro'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { useDelivery } from './state'
import { CheckIcon } from '../../assets/icons'
import { Loader, HelperBar } from '../../components'
import { OCCURENCES_BY_SUBSCRIPTION } from '../../graphql'
import { formatDate, getRoute } from '../../utils'

export const DeliveryDateSection = () => {
   const router = useRouter()
   const { addToast } = useToasts()
   const { state, dispatch } = useDelivery()
   const [occurences, setOccurences] = React.useState([])
   const [fetchOccurences, { loading }] = useLazyQuery(
      OCCURENCES_BY_SUBSCRIPTION,
      {
         onCompleted: ({ subscription = {} }) => {
            if (subscription.occurences.length > 0) {
               setOccurences(subscription.occurences)
            }
         },
         onError: error => {
            addToast(error.message, {
               appearance: 'error',
            })
         },
         fetchPolicy: 'cache-and-network',
      }
   )

   React.useEffect(() => {
      if (Object.keys(state.delivery.selected).length > 0) {
         fetchOccurences({
            variables: {
               id: state.delivery.selected.id,
               where: {
                  subscriptionOccurenceView: {
                     isValid: { _eq: true },
                     isVisible: { _eq: true },
                  },
               },
            },
         })
      }
   }, [state.delivery.selected, fetchOccurences])

   const occurenceSelection = occurence => {
      const dateIndex = occurences.findIndex(node => node.id === occurence.id)
      const skipList = occurences
         .slice(0, dateIndex)
         .map(occurence => occurence.id)
      dispatch({ type: 'SET_DATE', payload: occurence })
      dispatch({ type: 'SET_SKIP_LIST', payload: skipList })
   }

   if (loading) return <Loader inline />
   if (Object.keys(state.delivery.selected).length === 0)
      return (
         <>
            <HelperBar type="info">
               <HelperBar.SubTitle>
                  Select a delivery day to get started
               </HelperBar.SubTitle>
            </HelperBar>
         </>
      )
   if (isEmpty(occurences)) {
      ;<HelperBar type="warning">
         <HelperBar.SubTitle>
            No dates are available for delivery on this address.
         </HelperBar.SubTitle>
         <HelperBar.Button
            onClick={() => router.push(getRoute('/get-started/select-plan'))}
         >
            Select Plan
         </HelperBar.Button>
      </HelperBar>
   }
   return (
      <DeliveryDates>
         {occurences.map(occurence => (
            <DeliveryDate
               key={occurence.id}
               onClick={() => occurenceSelection(occurence)}
               className={`${
                  occurence.id === state.delivery_date.selected?.id && 'active'
               }`}
            >
               <DeliveryDateLeft>
                  <CheckIcon
                     size={18}
                     css={[
                        tw`stroke-current`,
                        occurence.id === state.delivery_date.selected?.id
                           ? tw`text-green-700`
                           : tw`text-gray-400`,
                     ]}
                  />
               </DeliveryDateLeft>
               <label css={tw`w-full cursor-pointer`}>
                  {formatDate(occurence.fulfillmentDate, {
                     year: 'numeric',
                     month: 'short',
                     day: 'numeric',
                  })}
               </label>
            </DeliveryDate>
         ))}
      </DeliveryDates>
   )
}

const DeliveryDates = styled.ul`
   ${tw`
      grid 
      gap-2
      sm:grid-cols-2 
      md:grid-cols-3 
   `}
`

const DeliveryDateLeft = styled.aside(
   () => css`
      width: 48px;
      height: 48px;
      ${tw`h-full mr-2 flex flex-shrink-0 items-center justify-center`}
      &.active {
         svg {
            ${tw`text-green-700`}
         }
      }
   `
)

const DeliveryDate = styled.li`
   height: 48px;
   ${tw`cursor-pointer flex items-center border capitalize text-gray-700 rounded overflow-hidden border-gray-300 hover:(border-2 border-green-700)`}
   &.invalid {
      opacity: 0.6;
      position: relative;
      :after {
         top: 0;
         left: 0;
         content: '';
         width: 100%;
         height: 100%;
         position: absolute;
      }
   }
   :hover svg {
      ${tw`text-green-700`}
   }
   &.active {
      ${tw`border-2 border-green-700`}
   }
`
