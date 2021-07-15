import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, TunnelHeader } from '@dailykit/ui'
import React from 'react'
import { Tooltip, Banner } from '../../../../../shared/components'
import { BRANDS } from '../../../graphql'
import { toast } from 'react-toastify'
import validator from '../../validator'

const CreateBrandTunnel = ({ closeTunnel }) => {
   const [create, { loading }] = useMutation(BRANDS.CREATE_BRAND, {
      onCompleted: () => {
         setForm({
            title: {
               value: '',
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
            domain: {
               value: '',
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
         })
         closeTunnel(1)
         toast.success('Successfully created the brand!')
      },
      onError: () =>
         toast.success('Failed to create the brand, please try again!'),
   })
   const [form, setForm] = React.useState({
      title: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      domain: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
   })
   const save = () => {
      if (form.title.meta.isValid && form.domain.meta.isValid) {
         return create({
            variables: {
               object: {
                  title: form.title.value,
                  domain: form.domain.value,
               },
            },
         })
      }
      return toast.error('Title and Domain is required!')
   }

   const handleChange = e => {
      const { name, value } = e.target
      if (name === 'title') {
         setForm({
            ...form,
            title: {
               ...form.title,
               value: value,
            },
         })
      } else {
         setForm({
            ...form,
            domain: {
               ...form.domain,
               value: value,
            },
         })
      }
   }

   const onBlur = e => {
      const { name, value } = e.target
      if (name === 'title') {
         setForm({
            ...form,
            title: {
               ...form.title,
               meta: {
                  ...form.title.meta,
                  isTouched: true,
                  errors: validator.text(value).errors,
                  isValid: validator.text(value).isValid,
               },
            },
         })
      } else {
         setForm({
            ...form,
            domain: {
               ...form.domain,
               meta: {
                  ...form.domain.meta,
                  isTouched: true,
                  errors: validator.text(value).errors,
                  isValid: validator.text(value).isValid,
               },
            },
         })
      }
   }

   const close = () => {
      setForm({
         title: {
            value: '',
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
         domain: {
            value: '',
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      })
      closeTunnel(1)
   }
   return (
      <>
         <TunnelHeader
            title="Add Brand"
            right={{
               action: save,
               title: loading ? 'Saving...' : 'Save',
            }}
            close={close}
            tooltip={<Tooltip identifier="create_brand_tunnelHeader" />}
         />
         <Banner id="brands-app-brands-create-brand-tunnel-top" />
         <Flex padding="16px">
            <Form.Group>
               <Form.Label htmlFor="title" title="title">
                  <Flex container alignItems="center">
                     Title
                     <Tooltip identifier="brand_title_info" />
                  </Flex>
               </Form.Label>
               <Form.Text
                  id="title"
                  name="title"
                  value={form.title.value}
                  onChange={e => handleChange(e)}
                  onBlur={e => onBlur(e, 'title')}
               />
               {form.title.meta.isTouched &&
                  !form.title.meta.isValid &&
                  form.title.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="24px" />
            <Form.Group>
               <Form.Label htmlFor="domain" title="domain">
                  <Flex container alignItems="center">
                     Domain
                     <Tooltip identifier="brand_domain_info" />
                  </Flex>
               </Form.Label>
               <Form.Text
                  id="domain"
                  name="domain"
                  value={form.domain.value}
                  onChange={e => handleChange(e)}
                  onBlur={e => onBlur(e, 'domain')}
               />
               {form.domain.meta.isTouched &&
                  !form.domain.meta.isValid &&
                  form.domain.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
         </Flex>
         <Banner id="brands-app-brands-create-brand-tunnel-bottom" />
      </>
   )
}

export default CreateBrandTunnel
