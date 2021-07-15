import React from 'react'

export const initialState = {
   conditionId: undefined,
   data: undefined,
   nodeId: undefined,
   parentNodeId: undefined,
}

export const reducer = (state = initialState, { type, payload }) => {
   switch (type) {
      case 'CONDITION_ID': {
         return {
            ...state,
            conditionId: payload.conditionId,
         }
      }
      case 'DATA': {
         return {
            ...state,
            data: payload.data,
         }
      }
      case 'NODE_ID': {
         return {
            ...state,
            nodeId: payload.nodeId,
         }
      }
      case 'PARENT_NODE_ID': {
         return {
            ...state,
            parentNodeId: payload.parentNodeId,
         }
      }
      default: {
         return state
      }
   }
}

export const ConditionsContext = React.createContext()

export const ConditionsProvider = ({ children }) => {
   const [state, dispatch] = React.useReducer(reducer, initialState)

   const addNode = React.useCallback(
      (nodeId, node) => {
         const newData = JSON.parse(
            JSON.stringify(state.data, function (_, value) {
               if (value?.id === nodeId) {
                  if (value['all']) {
                     value['all'].push(node)
                  } else {
                     value['any'].push(node)
                  }
               }
               return value
            })
         )
         dispatch({
            type: 'DATA',
            payload: {
               data: newData,
            },
         })
      },
      [state.data]
   )

   const updateNode = React.useCallback(
      (nodeId, type) => {
         const newData = JSON.parse(
            JSON.stringify(state.data, function (_, value) {
               if (value?.id === nodeId) {
                  if (value['all']) {
                     value[type] = value['all']
                     delete value['all']
                  } else {
                     value[type] = value['any']
                     delete value['any']
                  }
               }
               return value
            })
         )
         dispatch({
            type: 'DATA',
            payload: {
               data: newData,
            },
         })
      },
      [state.data]
   )

   const deleteNode = React.useCallback(
      (nodeId, parentNodeId) => {
         if (!parentNodeId) {
            // deleteing root node
            return dispatch({
               type: 'DATA',
               payload: {
                  data: undefined,
               },
            })
         }
         const newData = JSON.parse(
            JSON.stringify(state.data, function (_, value) {
               if (value?.id === parentNodeId) {
                  if (value['all']) {
                     value['all'] = value['all'].filter(
                        node => node.id !== nodeId
                     )
                  } else {
                     value['any'] = value['any'].filter(
                        node => node.id !== nodeId
                     )
                  }
               }
               return value
            })
         )
         dispatch({
            type: 'DATA',
            payload: {
               data: newData,
            },
         })
      },
      [state.data]
   )

   const addFact = React.useCallback(
      fact => {
         addNode(state.nodeId, fact)
      },
      [addNode, state.nodeId]
   )

   return (
      <ConditionsContext.Provider
         value={{ state, dispatch, addNode, updateNode, deleteNode, addFact }}
      >
         {children}
      </ConditionsContext.Provider>
   )
}

export const useConditions = () => {
   return React.useContext(ConditionsContext)
}
