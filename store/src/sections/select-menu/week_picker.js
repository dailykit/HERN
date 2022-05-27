import React from 'react'
import moment from 'moment'
import { useRouter } from 'next/router'
import classNames from 'classnames'

import { useMenu } from './state'
import { Loader } from '../../components'
import { getRoute } from '../../utils'
import { useTranslation } from '../../context'

export const WeekPicker = ({ isFixed }) => {
   const router = useRouter()
   const { state, dispatch } = useMenu()
   const { t } = useTranslation()
   if (state.isOccurencesLoading) return <Loader inline />
   if (!state?.week?.id) return null
   if (isFixed) {
      return (
         <span className="hern-select-menu__week-picker">
            <span className="hern-select-menu__week-date">
               {moment(state?.week?.fulfillmentDate)
                  .weekday(1)
                  .format('ddd MMM D')}
               &nbsp;-&nbsp;
               {moment(state?.week?.fulfillmentDate)
                  .add(7, 'day')
                  .weekday(0)
                  .format('ddd MMM D')}
            </span>
         </span>
      )
   }
   console.log('state occurence', state.occurences)
   return (
      <ul className="hern-select-menu__week-picker__list">
         {state.occurences.map(occurence => (
            <li
               className={classNames(
                  'hern-select-menu__week-picker__list-item',
                  {
                     'hern-select-menu__week-picker__list-item--active':
                        state.week?.fulfillmentDate ===
                        occurence.fulfillmentDate,
                  }
               )}
               key={occurence.id}
               onClick={() => {
                  router.push(`/menu?d=${occurence.fulfillmentDate}`)
                  dispatch({ type: 'SET_WEEK', payload: occurence })
               }}
            >
               {moment(occurence?.fulfillmentDate)
                  .weekday(1)
                  .format('ddd MMM D')}
               &nbsp;-&nbsp;
               {moment(occurence?.fulfillmentDate)
                  .add(7, 'day')
                  .weekday(0)
                  .format('ddd MMM D')}
            </li>
         ))}
      </ul>
   )
}
