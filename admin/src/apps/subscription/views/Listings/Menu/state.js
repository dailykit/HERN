import React from 'react'

const MenuContext = React.createContext()

const initialState = {
   dates: [],
   products: { selected: [] },
   plans: { isPermanent: false, selected: [] },
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_DATE':
         return {
            ...state,
            dates: payload,
            products: { selected: [] },
            plans: { selected: [], isPermanent: false },
         }
      case 'SET_PLAN': {
         if (state.plans.selected.length === 0) {
            localStorage.setItem('serving_size', payload.serving.size)
         }
         return {
            ...state,
            plans: {
               ...state.plans,
               selected: [...state.plans.selected, payload],
            },
         }
      }
      case 'REMOVE_PLAN': {
         if (state.plans.selected.length === 1) {
            localStorage.removeItem('serving_size')
         }
         return {
            ...state,
            plans: {
               ...state.plans,
               selected: state.plans.selected.filter(
                  node => node.occurence.id !== payload
               ),
            },
         }
      }
      case 'TOGGLE_PERMANENT':
         return {
            ...state,
            plans: {
               ...state.plans,
               isPermanent: !state.plans.isPermanent,
            },
         }
      case 'SET_PRODUCT':
         return {
            ...state,
            products: { selected: [...state.products.selected, payload] },
         }
      case 'REMOVE_PRODUCT':
         return {
            ...state,
            products: {
               selected: state.products.selected.filter(
                  node => node.option.id !== payload
               ),
            },
         }
      case 'CLEAR_STATE':
         return {
            ...state,
            plans: { selected: [] },
            products: { selected: [] },
         }
      default:
         return state
   }
}

export const MenuProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducers, initialState)

   return (
      <MenuContext.Provider value={{ state, dispatch }}>
         {children}
      </MenuContext.Provider>
   )
}

export const useMenu = () => React.useContext(MenuContext)
