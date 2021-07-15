import React from 'react'
import { isEmpty, has } from 'lodash'
import { Loader } from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'

import { TOOLTIPS_BY_APP } from '../graphql'

const TooltipContext = React.createContext()

const initialState = {
   name: '',
   tooltips: [],
   showTooltip: false,
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_TOOLTIPS':
         return { ...state, tooltips: payload }
      case 'SET_APP':
         return { ...state, ...payload }
      default:
         return state
   }
}

export const TooltipProvider = ({ app: appName, children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const { loading } = useQuery(TOOLTIPS_BY_APP, {
      variables: { title: appName },
      onCompleted: ({ app = {} }) => {
         dispatch({
            type: 'SET_APP',
            payload: { name: appName, showTooltip: app.showTooltip },
         })
         if (!isEmpty(app.tooltips)) {
            const tooltips = {}

            for (let tooltip of app.tooltips) {
               const { identifier, ...rest } = tooltip
               tooltips[identifier] = rest
            }
            dispatch({ type: 'SET_TOOLTIPS', payload: tooltips })
         }
      },
   })

   if (loading) return <Loader />
   return (
      <TooltipContext.Provider value={{ state, dispatch }}>
         {children}
      </TooltipContext.Provider>
   )
}

export const useTooltip = () => {
   const { state } = React.useContext(TooltipContext)

   const tooltip = React.useCallback(
      identifier => {
         if (has(state.tooltips, identifier)) {
            return state.tooltips[identifier]
         }
         return {}
      },
      [state]
   )

   return { state, tooltip }
}
