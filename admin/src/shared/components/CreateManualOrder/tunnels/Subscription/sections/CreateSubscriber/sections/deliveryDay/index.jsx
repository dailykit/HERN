import React from 'react'
import { rrulestr } from 'rrule'
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

export const SelectDeliveryDay = () => {
   const { customer } = useManual()
   const { itemCount, address, deliveryDay, dispatch } = useSub()
   const [days, setDays] = React.useState([])
   const [isDaysLoading, setIsDaysLoading] = React.useState(true)
   const [isDaysEmpty, setIsDaysEmpty] = React.useState(false)
   const [hasDaysError, setHasDaysError] = React.useState(false)
   useQuery(QUERIES.SUBSCRIPTION.ITEM_COUNT, {
      skip: !itemCount.selected?.id || !address.selected?.zipcode,
      variables: {
         id: itemCount.selected?.id,
         isDemo: customer?.isDemo,
         zipcode: address.selected?.zipcode,
      },
      onCompleted: ({ itemCount: count = {} } = {}) => {
         if (count?.subscriptions?.length === 0) {
            setIsDaysEmpty(true)
            setIsDaysLoading(false)
            setHasDaysError(false)
            setDays([])
            return
         }
         setDays(
            count?.subscriptions?.map(node => ({
               id: node.id,
               rrule: node.rrule,
               zipcode: node.zipcodes?.[0] || {},
            })) || []
         )
         setIsDaysEmpty(false)
         setIsDaysLoading(false)
         setHasDaysError(false)
      },
      onError: error => {
         logger(error)
         setIsDaysLoading(false)
         setHasDaysError(true)
         toast.error('Failed to fetch delivery days, please try again!')
      },
   })
   if (!itemCount.selected?.id)
      return (
         <>
            <Text as="text1">Select Delivery Day</Text>
            <Spacer size="8px" />
            <Filler
               height="160px"
               illustration={<EmptyIllo />}
               message="Please add an address to select delivery day!"
            />
         </>
      )
   if (isDaysLoading)
      return (
         <>
            <Text as="text1">Select Delivery Day</Text>
            <Spacer size="8px" />
            <InlineLoader />
         </>
      )
   if (hasDaysError)
      return (
         <>
            <Text as="text1">Select Delivery Day</Text>
            <Spacer size="8px" />
            <Filler
               height="160px"
               illustration={<EmptyIllo />}
               message="Failed to fetch delivery days, please try again!"
            />
         </>
      )
   if (isDaysEmpty)
      return (
         <>
            <Text as="text1">Select Delivery Day</Text>
            <Spacer size="8px" />
            <Filler
               height="160px"
               illustration={<EmptyIllo />}
               message="No delivery days available at this location."
            />
         </>
      )
   return (
      <>
         <Text as="text1">Select Delivery Day</Text>
         <Spacer size="8px" />
         <Styles.Days>
            {days.map(day => (
               <Styles.Day
                  key={day.id}
                  className={`${
                     day.id === deliveryDay.selected?.id ? 'active' : ''
                  }`}
                  onClick={() =>
                     dispatch({ type: 'SET_DELIVERY_DAY', payload: day })
                  }
               >
                  {rrulestr(day.rrule).toText()}
               </Styles.Day>
            ))}
         </Styles.Days>
         {days.length > 0 && <Spacer size="24px" />}
      </>
   )
}

const Styles = {
   Days: styled.ul`
      display: grid;
      grid-gap: 14px;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
   `,
   Day: styled.li`
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
