import React from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/react-hooks'
import { Form, Spacer, TunnelHeader, Flex } from '@dailykit/ui'

import validator from '../../../../validators'
import { MASTER } from '../../../../../../graphql'
import { logger } from '../../../../../../../../shared/utils'
import { Banner, Tooltip } from '../../../../../../../../shared/components'

const address = 'apps.settings.views.forms.accompanimenttypes.tunnels.addnew.'

const AddTypesTunnel = ({ closeTunnel }) => {
   const { t } = useTranslation()

   const [name, setName] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   const [description, setDescription] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   // Mutation
   const [addCategory, { loading: addingCategory }] = useMutation(
      MASTER.PRODUCT_CATEGORY.CREATE,
      {
         onCompleted: () => {
            toast.success('Product category added!')
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Failed to add product category!')
            logger(error)
         },
      }
   )

   // Handlers
   const add = () => {
      addCategory({
         variables: {
            object: {
               name: name.value,
               metaDetails: {
                  description: description.value,
               },
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Add Product Category"
            right={{
               action: add,
               title: 'Add',
               isLoading: addingCategory,
               disabled: !name.meta.isValid,
            }}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="tunnel_product_category_heading" />}
         />
         <Banner id="settings-app-master-lists-product-categories-tunnel-top" />
         <Flex padding="16px">
            <Form.Group>
               <Form.Label htmlFor="name" title="name">
                  Name*
               </Form.Label>
               <Form.Text
                  id="name"
                  name="name"
                  onChange={e => setName({ ...name, value: e.target.value })}
                  onBlur={() => {
                     const { isValid, errors } = validator.name(name.value)
                     setName({
                        ...name,
                        meta: {
                           isTouched: true,
                           isValid,
                           errors,
                        },
                     })
                  }}
                  value={name.value}
                  placeholder="Enter category name"
                  hasError={name.meta.isTouched && !name.meta.isValid}
               />
               {name.meta.isTouched &&
                  !name.meta.isValid &&
                  name.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="16px" />
            <Form.Group>
               <Form.Label htmlFor="description" title="description">
                  Description
               </Form.Label>
               <Form.TextArea
                  id="description"
                  name="description"
                  onChange={e =>
                     setDescription({ ...description, value: e.target.value })
                  }
                  value={description.value}
                  placeholder="Write about category"
                  hasError={
                     description.meta.isTouched && !description.meta.isValid
                  }
               />
               {description.meta.isTouched &&
                  !description.meta.isValid &&
                  description.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
         </Flex>
         <Banner id="settings-app-master-lists-product-categories-tunnel-bottom" />
      </>
   )
}

export default AddTypesTunnel
