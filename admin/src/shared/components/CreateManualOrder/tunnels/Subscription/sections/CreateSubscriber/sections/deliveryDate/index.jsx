import React from 'react'
import moment from 'moment'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { useQuery } from '@apollo/react-hooks'
import { Text, Spacer, Filler } from '@dailykit/ui'

import { useSub } from '../../state'
import { QUERIES } from '../../../../../../graphql'
import { useManual } from '../../../../../../state'
import { logger } from '../../../../../../../../utils'
import { InlineLoader } from '../../../../../../../InlineLoader'
import EmptyIllo from '../../../../../../../../assets/illustrations/EmptyIllo'

export const SelectDeliveryDate = () => {
   const { deliveryDay, deliveryDate, dispatch } = useSub()
   const { loading, error, data: { occurences = [] } = {} } = useQuery(
      QUERIES.SUBSCRIPTION.OCCURENCE.LIST,
      {
         skip: !deliveryDay.selected?.id,
         variables: {
            includeCustomers: false,
            where: {
               subscriptionId: { _eq: deliveryDay.selected?.id },
               subscriptionOccurenceView: {
                  isValid: { _eq: true },
                  isVisible: { _eq: true },
               },
            },
         },
      }
   )
   if (!deliveryDay.selected?.id)
      return (
         <>
            <Text as="text1">Select Delivery Date</Text>
            <Spacer size="8px" />
            <Filler
               height="160px"
               illustration={<EmptyIllo />}
               message="Please select a delivery day to continue!"
            />
         </>
      )
   if (loading)
      return (
         <>
            <Text as="text1">Select Delivery Date</Text>
            <Spacer size="8px" />
            <InlineLoader />
         </>
      )
   if (error) {
      logger(error)
      toast.error('Failed to fetch delivery days, please try again!')
      return (
         <>
            <Text as="text1">Select Delivery Date</Text>
            <Spacer size="8px" />
            <Filler
               height="160px"
               illustration={<EmptyIllo />}
               message="Failed to fetch delivery days, please try again!"
            />
         </>
      )
   }
   if (occurences.length === 0)
      return (
         <>
            <Text as="text1">Select Delivery Date</Text>
            <Spacer size="8px" />
            <Filler
               height="160px"
               illustration={<EmptyIllo />}
               message="No delivery dates are available for selected delivery day."
            />
         </>
      )
   return (
      <>
         <Text as="text1">Select Delivery Date</Text>
         <Spacer size="8px" />
         <Styles.Dates>
            {occurences.map(occurence => (
               <Styles.Date
                  key={occurence.id}
                  className={`${
                     occurence.id === deliveryDate.selected?.id ? 'active' : ''
                  }`}
                  onClick={() =>
                     dispatch({ type: 'SET_DELIVERY_DATE', payload: occurence })
                  }
               >
                  {moment(occurence.fulfillmentDate).format('MMM DD, YYYY')}
               </Styles.Date>
            ))}
         </Styles.Dates>
         {occurences.length > 0 && <Spacer size="24px" />}
      </>
   )
}

const Styles = {
   Dates: styled.ul`
      display: grid;
      grid-gap: 14px;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
   `,
   Date: styled.li`
      padding: 14px;
      cursor: pointer;
      list-style: none;
      border-radius: 2px;
      border: 1px solid #ebebeb;
      :hover {
         border-color: #5d41db;
      }
      &.active {
         border-color: #5d41db;
      }
   `,
}
