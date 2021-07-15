import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'

const Context = React.createContext()
const webBuilderRef = React.createRef()

const initialState = {
   tabsInfo: [],
   isHistoryVisible: false,
   isTabDropDownVisible: false,
   isSidebarVisible: false,
   isSidePanelVisible: false,
   onToggleInfo: {},
   editorInfo: {
      isDesignMode: false,
      isDarkMode: false,
      language: 'javascript',
      editor: null,
      webBuilder: webBuilderRef,
   },
   popupInfo: {
      createTypePopup: false,
      fileTypePopup: false,
      formTypePopup: false,
   },
   contextMenuInfo: {},
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'ADD_TAB_INFO': {
         const tabIndex = state.tabsInfo.findIndex(
            tab => tab.path === payload.path
         )
         if (tabIndex === -1) {
            return {
               ...state,
               tabsInfo: [
                  {
                     title: payload.name,
                     name: payload.name,
                     path: payload.path,
                     filePath: payload.filePath,
                     draft: '',
                     version: null,
                     lastSaved: '',
                     id: payload.id,
                     linkedCss: payload.linkedCss,
                     linkedJs: payload.linkedJs,
                  },
                  ...state.tabsInfo,
               ],
            }
         }
         return state
      }
      case 'TOGGLE_SIDEBAR': {
         return {
            ...state,
            isSidebarVisible: !state.isSidebarVisible,
         }
      }
      case 'TOGGLE_SIDEPANEL': {
         return {
            ...state,
            isSidePanelVisible: !state.isSidePanelVisible,
         }
      }
      case 'ADD_ON_TOGGLE_INFO': {
         const newState = {
            ...state,
            onToggleInfo: payload,
         }
         return newState
      }

      case 'ADD_EDITOR_INFO': {
         const newState = {
            ...state,
            editorInfo: payload,
         }
         return newState
      }

      case 'SET_POPUP_INFO': {
         return {
            ...state,
            popupInfo: payload,
         }
      }
      case 'SET_CONTEXT_MENU_INFO': {
         const newState = {
            ...state,
            popupInfo: {
               ...state.popupInfo,
               ...payload.showPopup,
            },
            contextMenuInfo: payload,
         }
         return newState
      }

      case 'SET_DRAFT': {
         const { tabsInfo } = state
         const tabIndex = state.tabsInfo.findIndex(
            tab => tab.path === payload.path
         )
         if (tabIndex !== -1) {
            tabsInfo[tabIndex] = {
               ...tabsInfo[tabIndex],
               draft: payload.content,
            }
            const newState = {
               ...state,
               tabsInfo,
            }
            return newState
         }
         return state
      }
      case 'REMOVE_DRAFT': {
         const { tabsInfo } = state
         const tabIndex = state.tabsInfo.findIndex(
            tab => tab.path === payload.path
         )
         if (tabIndex !== -1) {
            tabsInfo[tabIndex] = {
               ...tabsInfo[tabIndex],
               draft: '',
            }
            const newState = {
               ...state,
               tabsInfo,
            }
            return newState
         }
         return state
      }
      case 'SET_VERSION': {
         const { tabsInfo } = state
         const tabIndex = state.tabsInfo.findIndex(
            tab => tab.path === payload.path
         )
         if (tabIndex !== -1) {
            tabsInfo[tabIndex] = {
               ...tabsInfo[tabIndex],
               version: payload.version,
            }
            const newState = {
               ...state,
               tabsInfo,
            }
            return newState
         }
         return state
      }
      case 'REMOVE_VERSION': {
         const { tabsInfo } = state
         const tabIndex = state.tabsInfo.findIndex(
            tab => tab.path === payload.path
         )
         if (tabIndex !== -1) {
            tabsInfo[state.currentTab] = {
               ...tabsInfo[state.currentTab],
               version: null,
            }
            const newState = {
               ...state,
               tabsInfo,
            }
            return newState
         }
         return state
      }
      case 'UPDATE_LAST_SAVED': {
         const { tabsInfo } = state
         const tabIndex = state.tabsInfo.findIndex(
            tab => tab.path === payload.path
         )
         if (tabIndex !== -1) {
            tabsInfo[tabIndex] = {
               ...tabsInfo[tabIndex],
               lastSaved: Date.now(),
            }
            const newState = {
               ...state,
               tabsInfo,
            }
            return newState
         }
         return state
      }
      case 'UPDATE_LINKED_FILE': {
         if (state.tabsInfo.some(tab => tab.path === payload.path)) {
            const tabId =
               state.tabsInfo.findIndex(tab => tab.path === payload.path) >=
                  0 &&
               state.tabsInfo.findIndex(tab => tab.path === payload.path)
            const { tabsInfo } = state
            tabsInfo[tabId] = {
               ...tabsInfo[tabId],
               linkedCss: payload.linkedCss,
               linkedJs: payload.linkedJs,
            }
            const newState = {
               ...state,
               tabsInfo,
            }
            return newState
         }
         return state
      }

      default:
         return state
   }
}

export const GlobalInfoProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)

   return (
      <Context.Provider value={{ state, dispatch }}>
         {children}
      </Context.Provider>
   )
}

export const useTabsInfo = () => {
   const history = useHistory()
   const location = useLocation()

   const {
      state: { tabsInfo },
      dispatch,
   } = React.useContext(Context)

   const tabInfo = tabsInfo.find(currTab => currTab.path === location.pathname)

   const addTabInfo = React.useCallback(
      data => {
         dispatch({
            type: 'ADD_TAB_INFO',
            payload: data,
         })
      },
      [dispatch, history]
   )

   return {
      tabInfo,
      tabsInfo,
      addTabInfo,
      dispatch,
   }
}

export const useGlobalContext = () => {
   const history = useHistory()
   const { state, dispatch } = React.useContext(Context)
   const globalState = state

   const toggleSideBar = React.useCallback(() => {
      dispatch({ type: 'TOGGLE_SIDEBAR' })
   }, [dispatch, history])

   const toggleSidePanel = React.useCallback(() => {
      dispatch({ type: 'TOGGLE_SIDEPANEL' })
   }, [dispatch, history])

   const onToggleInfo = React.useCallback(
      data => {
         dispatch({
            type: 'ADD_ON_TOGGLE_INFO',
            payload: data,
         })
      },
      [dispatch, history]
   )

   const setPopupInfo = React.useCallback(
      data => {
         dispatch({
            type: 'SET_POPUP_INFO',
            payload: data,
         })
      },
      [dispatch, history]
   )

   const setContextMenuInfo = React.useCallback(
      data => {
         dispatch({
            type: 'SET_CONTEXT_MENU_INFO',
            payload: data,
         })
      },
      [dispatch, history]
   )

   const setDraft = React.useCallback(data => {
      dispatch({
         type: 'SET_DRAFT',
         payload: data,
      })
   })
   const removeDraft = React.useCallback(data => {
      dispatch({
         type: 'REMOVE_DRAFT',
         payload: data,
      })
   })
   const setVersion = React.useCallback(data => {
      dispatch({
         type: 'SET_VERSION',
         payload: data,
      })
   })
   const removeVersion = React.useCallback(data => {
      dispatch({
         type: 'REMOVE_VERSION',
         payload: data,
      })
   })
   const updateLastSaved = React.useCallback(data => {
      dispatch({
         type: 'UPDATE_LAST_SAVED',
         payload: data,
      })
   })
   const updateLinkedFile = React.useCallback(data => {
      dispatch({
         type: 'UPDATE_LINKED_FILE',
         payload: data,
      })
   })

   const addEditorInfo = React.useCallback(data => {
      dispatch({
         type: 'ADD_EDITOR_INFO',
         payload: data,
      })
   })

   return {
      toggleSideBar,
      toggleSidePanel,
      globalState,
      onToggleInfo,
      setPopupInfo,
      setContextMenuInfo,
      setDraft,
      removeDraft,
      setVersion,
      removeVersion,
      updateLastSaved,
      updateLinkedFile,
      addEditorInfo,
   }
}
