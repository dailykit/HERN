import React from 'react'
import styled from 'styled-components'
import { RadioGroup } from '@dailykit/ui'

import ConditionTree from './ConditionTree'
import DeleteIcon from '../../assets/icons/Delete'
import { useConditions } from './context'

const Condition = ({ data, nodeId, openTunnel }) => {
   const [type, setType] = React.useState('all')

   const { updateNode, deleteNode } = useConditions()

   React.useEffect(() => {
      if (data['all']) {
         setType('all')
      } else {
         setType('any')
      }
   }, [data])

   const options = [
      { id: 1, title: 'All' },
      { id: 2, title: 'Any' },
   ]

   const switchConditionType = option => {
      const newType = option.title.toLowerCase()
      updateNode(data.id, newType)
   }

   return (
      <StyledCondition>
         <StyledType>
            <RadioGroup
               options={options}
               active={type === 'all' ? 1 : 2}
               onChange={option => switchConditionType(option)}
            />
         </StyledType>
         <StyledAction onClick={() => deleteNode(data.id, nodeId)}>
            <DeleteIcon color="#FF5A52" />
         </StyledAction>
         <StyledWrapper>
            <ConditionTree
               data={data[type] || []}
               nodeId={data.id}
               openTunnel={openTunnel}
            />
         </StyledWrapper>
      </StyledCondition>
   )
}

export default React.memo(Condition)

const StyledType = styled.div`
   transform: translate(10px, -24px);
`

const StyledCondition = styled.div`
   border: 1px solid #c4c4c4;
   height: 100%;
   box-sizing: border-box;
   border-radius: 8px;
   padding: 8px;
   padding-bottom: 0px;
   margin-top: 24px;
   margin-bottom: 8px;
   position: relative;
`

const StyledWrapper = styled.div`
   transform: translate(0px, -16px);
`

const StyledAction = styled.span`
   position: absolute;
   top: -12px;
   right: 12px;
   cursor: pointer;
   background: #fff;
   padding: 4px;
`
