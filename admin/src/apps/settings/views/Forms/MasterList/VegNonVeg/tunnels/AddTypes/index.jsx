import { useSubscription, useMutation } from '@apollo/react-hooks'
import { Flex, Form, TunnelHeader } from '@dailykit/ui'
import { add } from 'isomorphic-git'
import React from 'react'
import { MASTER } from '../../../../../../graphql'
import { toast } from 'react-toastify'
import { Banner } from '../../../../../../../../shared/components'
import { logger } from '../../../../../../../../shared/utils'

const AddTypesTunnel = ({ closeTunnel }) => {
   const [type, setType] = React.useState('')
   //Mutation
   const [addType, { loading: addingVegNonVegType }] = useMutation(
      MASTER.VEG_NONVEG.CREATE,
      {
         onCompleted: () => {
            toast.success('Type added')
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Failed to add vegNonVeg type')
            logger(error)
         },
      }
   )
   const add = () => {
      try {
         const object = {
            label: type,
         }
         addType({
            variables: {
               object,
            },
         })
         if (!object.length) {
            throw Error('Nothing to add')
         }
      } catch (error) {
         toast.error(error.message)
      }
   }
   return (
      <>
         <TunnelHeader
            title="Add new types"
            right={{
               action: add,
               title: 'Add',
               isLoading: addingVegNonVegType,
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
                     setType(e.target.value.trim())
                  }}
                  placeholder="Enter the type of dish"
               ></Form.Text>
            </Form.Group>
         </Flex>
      </>
   )
}

export default AddTypesTunnel
