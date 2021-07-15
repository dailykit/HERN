import React, { useEffect } from 'react'
import { Loader } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'

import { GET_BOTTOM_BAR_OPTIONS } from '../graphql'
import { logger } from '../utils'
import { toast } from 'react-toastify'

const BottomBarContext = React.createContext()

const initialState = {
   bottomBarOptions: [],
   clickedOption: null,
   clickedOptionMenu: null,
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_BOTTOM_BAR_OPTIONS':
         return { ...state, bottomBarOptions: payload }

      case 'ADD_CLICKED_OPTION_INFO':
         const optionIndex = state.bottomBarOptions.findIndex(
            option => option.id === payload.id
         )
         if (optionIndex !== -1) {
            return {
               ...state,
               clickedOption: payload,
            }
         } else {
            return state
         }

      case 'ADD_CLICKED_OPTION_MENU_INFO':
         return {
            ...state,
            clickedOptionMenu: payload,
         }

      case 'REMOVE_CLICKED_OPTION_INFO':
         return {
            ...state,
            clickedOption: null,
            clickedOptionMenu: null,
         }
      default:
         return state
   }
}

export const BottomBarProvider = ({ app, children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const { loading, error } = useSubscription(GET_BOTTOM_BAR_OPTIONS, {
      variables: { app: ['global'] },
      onSubscriptionData: ({
         subscriptionData: { data: { ux_bottomBarOption = [] } = {} } = {},
      } = {}) => {
         dispatch({
            type: 'SET_BOTTOM_BAR_OPTIONS',
            payload: ux_bottomBarOption,
         })
      },
   })

   if (loading) {
      return <Loader />
   }
   if (error) {
      logger(error)
      toast.error(error?.message)
      console.error(error)
   }
   return (
      <BottomBarContext.Provider value={{ state, dispatch }}>
         {children}
      </BottomBarContext.Provider>
   )
}

export const useBottomBar = () => {
   const { state, dispatch } = React.useContext(BottomBarContext)
   const addClickedOptionInfo = React.useCallback(
      data => {
         dispatch({
            type: 'ADD_CLICKED_OPTION_INFO',
            payload: data,
         })
      },
      [dispatch]
   )

   const addClickedOptionMenuInfo = React.useCallback(
      data => {
         dispatch({
            type: 'ADD_CLICKED_OPTION_MENU_INFO',
            payload: data,
         })
      },
      [dispatch]
   )
   const removeClickedOptionInfo = React.useCallback(() => {
      dispatch({
         type: 'REMOVE_CLICKED_OPTION_INFO',
      })
   }, [dispatch])

   return {
      state,
      addClickedOptionInfo,
      addClickedOptionMenuInfo,
      removeClickedOptionInfo,
   }
}
