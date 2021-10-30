import { useSubscription } from '@apollo/react-hooks'
import { Flex, Form, TunnelHeader } from '@dailykit/ui'
import { add } from 'isomorphic-git'
import React from 'react'
import { toast } from 'react-toastify'
import { Banner } from '../../../../../../../../shared/components'

const AddTypesTunnel = ({ closeTunnel }) => {
   const [type, setType] = React.useState('')
   const add = () => {}
   return (
      <>
         <TunnelHeader
            title="Add new types"
            right={{
               action: add,
               title: 'Add',
            }}
            close={() => closeTunnel(1)}
         />
         <Banner id="settings-app-master-lists-vegnonveg-tunnel-top" />
         <Flex padding="16px">
            <Form.Group>
               <Form.Label>Type Name</Form.Label>
               <Form.Text
                  value={type}
                  onChange={e => {
                     setType(e.target.value)
                     console.log(type)
                  }}
               ></Form.Text>
            </Form.Group>
         </Flex>
      </>
   )
}

export default AddTypesTunnel
