import React from 'react'
import { TextButton, TunnelHeader, Loader } from '@dailykit/ui'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import Condition from './Condition'
import { useConditions } from './context'
import { CONDITION, UPDATE_CONDITION, CREATE_CONDITION } from './graphql'
import Banner from '../Banner'

const MainTunnel = ({ id, onSave, openTunnel, closeTunnel }) => {
   const { state, dispatch } = useConditions()

   // Queries
   const [fetchCondition, { loading, error }] = useLazyQuery(CONDITION, {
      variables: {
         id,
      },
      onCompleted: data => {
         dispatch({
            type: 'DATA',
            payload: {
               data: data.condition.condition,
            },
         })
      },
      fetchPolicy: 'cache-and-network',
   })

   // Mutations
   const [updateCondition] = useMutation(UPDATE_CONDITION, {
      variables: {
         id: state.conditionId,
         set: {
            condition: state.data,
         },
      },
      onCompleted: data => {
         console.log(data)
         toast.success('Condition saved')
         dispatch({
            type: 'CONDITION_ID',
            payload: {
               conditionId: undefined,
            },
         })
         onSave(data.updateCondition.id)
         closeTunnel(1)
      },
      onError: error => {
         console.log(error)
         toast.error('Error while saving condition')
      },
   })
   const [createCondition] = useMutation(CREATE_CONDITION, {
      variables: {
         object: {
            condition: state.data,
         },
      },
      onCompleted: data => {
         console.log(data)
         toast.success('Condition saved')
         dispatch({
            type: 'CONDITION_ID',
            payload: {
               conditionId: undefined,
            },
         })
         onSave(data.createCondition.id)
         closeTunnel(1)
      },
      onError: error => {
         console.log(error)
         toast.error('Error while saving condition')
      },
   })

   const save = () => {
      if (state.conditionId) {
         console.log('updating...')
         updateCondition()
      } else {
         console.log('creating...')
         createCondition()
      }
   }

   React.useEffect(() => {
      if (id) {
         fetchCondition()
         dispatch({
            type: 'CONDITION_ID',
            payload: {
               conditionId: id,
            },
         })
      } else {
         dispatch({
            type: 'DATA',
            payload: {
               data: {
                  id: Math.floor(Math.random() * 1000),
                  all: [],
               },
            },
         })
      }
   }, [])

   if (loading) return <Loader />

   return (
      <>
         <TunnelHeader
            title="Add Conditions"
            right={{ action: save, title: 'Save' }}
            close={() => closeTunnel(1)}
         />
         <Banner id="condition-tunnel-top" />

         <TunnelBody>
            <Info> Whether All or Any Condition should be matched </Info>
            {state.data ? (
               <Condition
                  data={state.data}
                  nodeId={state.data.id}
                  openTunnel={openTunnel}
               />
            ) : (
               <TextButton
                  type="ghost"
                  onClick={() =>
                     dispatch({
                        type: 'DATA',
                        payload: {
                           data: {
                              id: Math.floor(Math.random() * 1000),
                              all: [],
                           },
                        },
                     })
                  }
               >
                  Add Condition
               </TextButton>
            )}
         </TunnelBody>
         <Banner id="condition-tunnel-bottom" />
      </>
   )
}

export default MainTunnel

const Info = styled.p`
   font-style: italic;
   font-weight: normal;
   font-size: 12px;
   line-height: 14px;
   color: #888d9d;
`

const TunnelBody = styled.div`
   padding: 16px;
   overflow-y: scroll;
   height: calc(100vh - 40px - 64px);
`
