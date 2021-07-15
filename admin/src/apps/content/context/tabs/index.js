import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'

const Context = React.createContext()

const initialState = {
   tabs: [],
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_TITLE': {
         const { tabs } = state
         const index = tabs.findIndex(tab => tab.path === payload.path)
         tabs[index] = {
            ...tabs[index],
            title: payload.title,
         }
         return {
            ...state,
            tabs,
         }
      }
      case 'ADD_TAB': {
         const tabIndex = state.tabs.findIndex(tab => tab.path === payload.path)
         if (tabIndex === -1) {
            return {
               ...state,
               tabs: [
                  {
                     title: payload.title,
                     path: payload.path,
                  },
                  ...state.tabs,
               ],
            }
         }
         return state
      }
      // Store Tab Data
      case 'STORE_TAB_DATA': {
         const tabs = state.tabs
         const tabIndex = tabs.findIndex(tab => tab.path === payload.path)
         if (tabIndex !== -1) {
            tabs[tabIndex].data = {
               ...tabs[tabIndex].data,
               ...payload.data,
            }
            return {
               ...state,
               tabs,
            }
         }
         return state
      }
      // Delete Tab
      case 'DELETE_TAB': {
         return {
            ...state,
            tabs: state.tabs.filter((_, index) => index !== payload.index),
         }
      }
      case 'CLOSE_ALL_TABS':
         return {
            ...state,
            tabs: [],
         }
      default:
         return state
   }
}

export const TabProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)

   return (
      <Context.Provider value={{ state, dispatch }}>
         {children}
      </Context.Provider>
   )
}

export const useTabs = () => {
   const history = useHistory()
   const location = useLocation()

   const {
      state: { tabs },
      dispatch,
   } = React.useContext(Context)

   const tab = tabs.find(tab => tab.path === location.pathname)

   const setTitle = React.useCallback(
      title => {
         dispatch({
            type: 'SET_TITLE',
            payload: {
               title,
               path: tab.path,
            },
         })
      },
      [dispatch, tab]
   )

   const addTab = React.useCallback(
      (title, path) => {
         dispatch({
            type: 'ADD_TAB',
            payload: { title, path },
         })
         history.push(path)
      },
      [dispatch, history]
   )

   const switchTab = React.useCallback(path => history.push(path), [history])

   const removeTab = React.useCallback(
      ({ tab, index }) => {
         dispatch({ type: 'DELETE_TAB', payload: { tab, index } })

         const tabsCount = tabs.length
         // closing last remaining tab
         if (index === 0 && tabsCount === 1) {
            history.push('/content')
         }
         // closing first tab when there's more than one tab
         else if (index === 0 && tabsCount > 1) {
            history.push(tabs[index + 1].path)
         }
         // closing any tab when there's more than one tab
         else if (index > 0 && tabsCount > 1) {
            history.push(tabs[index - 1].path)
         }
      },
      [tabs, dispatch, history]
   )

   const closeAllTabs = React.useCallback(() => {
      dispatch({ type: 'CLOSE_ALL_TABS' })
      switchTab('/content')
   }, [switchTab, dispatch])

   const doesTabExists = path => tabs.find(tab => tab.path === path) || false

   return {
      tab,
      tabs,
      addTab,
      setTitle,
      switchTab,
      removeTab,
      closeAllTabs,
      doesTabExists,
      dispatch,
   }
}
