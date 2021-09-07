import React from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'
import tw, { styled } from 'twin.macro'

import { useMenu } from './state'
import { Loader } from '../../components'
import { getRoute } from '../../utils'

export const WeekPicker = ({ isFixed }) => {
   const router = useRouter()
   const { state, dispatch } = useMenu()

   if (state.isOccurencesLoading) return <Loader inline />
   if (!state?.week?.id) return null
   if (isFixed) {
      return (
         <span
            css={tw`h-16 flex items-center justify-center text-base text-center md:text-lg text-indigo-800`}
         >
            Showing menu of:&nbsp;
            {moment(state?.week?.fulfillmentDate)
               .weekday(1)
               .format('ddd MMM D')}
            &nbsp;-&nbsp;
            {moment(state?.week?.fulfillmentDate)
               .add(7, 'day')
               .weekday(0)
               .format('ddd MMM D')}
         </span>
      )
   }
   return (
      <Occurences>
         {state.occurences.map(occurence => (
            <Occurence
               key={occurence.id}
               onClick={() => {
                  router.push(`/menu?d=${occurence.fulfillmentDate}`)
                  dispatch({ type: 'SET_WEEK', payload: occurence })
               }}
               className={
                  state.week?.fulfillmentDate === occurence.fulfillmentDate
                     ? 'active'
                     : ''
               }
            >
               {moment(occurence?.fulfillmentDate)
                  .weekday(1)
                  .format('ddd MMM D')}
               &nbsp;-&nbsp;
               {moment(occurence?.fulfillmentDate)
                  .add(7, 'day')
                  .weekday(0)
                  .format('ddd MMM D')}
            </Occurence>
         ))}
      </Occurences>
   )
}
const Occurences = styled.ul`
   height: 64px;
   max-width: 980px;
   ${tw`px-2 w-full mx-auto overflow-x-auto flex items-center justify-between space-x-4`}
   &::after, &::before {
      content: '';
   }
`
const Occurence = styled.li`
   ${tw`flex-shrink-0 px-3 rounded-full border cursor-pointer`}
   &.active {
      ${tw`bg-green-200 text-green-700`}
   }
`
