import { useSubscription, useMutation } from '@apollo/react-hooks'
import { Flex, Form, TunnelHeader } from '@dailykit/ui'
import React from 'react'
import { MASTER } from '../../../../../../graphql'
import { toast } from 'react-toastify'
import { Banner } from '../../../../../../../../shared/components'
import { logger } from '../../../../../../../../shared/utils'

const AddRecipeTunnel = ({ closeTunnel }) => {
   const [type, setType] = React.useState('')
   //Mutation
   const [addType, { loading: addingRecipeComponent }] = useMutation(
      MASTER.RECIPE_COMPONENT.CREATE,
      {
         onCompleted: () => {
            toast.success('Recipe component is added')
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
         if (type.length == 0) {
            throw Error('Nothing to add')
         }
         addType({
            variables: {
               object,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }
   return (
      <>
         <TunnelHeader
            title="Add new Recipe Component"
            close={() => closeTunnel(1)}
            right={{
               action: add,
               title: 'Add',
               loading: addingRecipeComponent,
               disabled: type.length == 0,
            }}
         />
         <Banner id="settings-app-master-lists-recipeComponent-tunnel-top" />
         <Flex padding="16px">
            <Form.Label>Recipe Component</Form.Label>

            <Form.Group>
               <Form.Text
                  value={type}
                  onChange={e => setType(e.target.value)}
                  placeholder="Enter the type of Recipe Component"
               ></Form.Text>
            </Form.Group>
         </Flex>
      </>
   )
}

export default AddRecipeTunnel
