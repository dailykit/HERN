import React from 'react'
import styled from 'styled-components'
import { Text, TextButton } from '@dailykit/ui'

import Condition from './Condition'
import DeleteIcon from '../../assets/icons/Delete'

import { useConditions } from './context'

const ConditionTree = ({ data, nodeId, openTunnel }) => {
   const { dispatch, deleteNode, addNode } = useConditions()

   const addCondition = () => {
      const node = {
         id: Math.floor(Math.random() * 1000),
         all: [],
      }
      addNode(nodeId, node)
   }

   const addFact = () => {
      dispatch({
         type: 'NODE_ID',
         payload: {
            nodeId,
         },
      })
      openTunnel(2)
   }

   return (
      <>
         {data.map((datum, i) =>
            datum.fact ? (
               <StyledFact key={i}>
                  <StyledAction onClick={() => deleteNode(datum.id, nodeId)}>
                     <DeleteIcon color="#FF5A52" />
                  </StyledAction>
                  <Text as="title">{datum.fact}</Text>
                  <Text as="subtitle">{datum.operator}</Text>
                  {Boolean(datum.duration) && (
                     <Text as="subtitle">{datum.duration}</Text>
                  )}
                  <Text as="title">
                     {Array.isArray(datum.value)
                        ? datum.value.join(', ')
                        : datum.operator === 'rruleHasDate'
                        ? datum.text
                        : datum.value}
                  </Text>
               </StyledFact>
            ) : (
               <Condition
                  key={i}
                  data={datum}
                  nodeId={nodeId}
                  openTunnel={openTunnel}
               />
            )
         )}
         <TextButton type="ghost" onClick={addFact}>
            Add Fact
         </TextButton>
         <TextButton type="ghost" onClick={addCondition}>
            Add Condition
         </TextButton>
      </>
   )
}

export default React.memo(ConditionTree)

const StyledFact = styled.div`
   background: #f3f3f3;
   padding: 8px;
   margin-bottom: 8px;
   position: relative;
   border-radius: 4px;
`

const StyledAction = styled.span`
   position: absolute;
   top: 8px;
   right: 8px;
   cursor: pointer;
`
