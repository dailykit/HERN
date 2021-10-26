import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Form } from '@dailykit/ui'
import validator from '../../../../../../validator'

import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { logger } from '../../../../../../../../../shared/utils'

export const BrandName = ({ update }) => {
   const params = useParams()
   const [name, setName] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Brand Name' },
         type: { _eq: 'brand' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { brandSettings = [] } = {} } = {},
      }) => {
         if (!isEmpty(brandSettings)) {
            const index = brandSettings.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id } = brandSettings[0]
               setSettingId(id)
               return
            }
            const { brand, id } = brandSettings[index]
            setSettingId(id)
            if ('name' in brand.value) {
               setName({
                  value: brand.value.name,
                  meta: {
                     isValid: true,
                     isTouched: false,
                     errors: [],
                  },
               })
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      console.log('coming from the component', updateSetting)
      if (!settingId) return
      if (!name.meta.isValid) return toast.error('Brand name must be provided')
      update({ id: settingId, value: { name: name.value } })
   }, [name, settingId])

   const onBlur = e => {
      setName({
         ...name,
         meta: {
            ...name.meta,
            isTouched: true,
            errors: validator.text(e.target.value).errors,
            isValid: validator.text(e.target.value).isValid,
         },
      })
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Brand Name">
         <Flex container alignItems="flex-start">
            <Text as="h3">Name</Text>
            <Tooltip identifier="brand_name_info" />
         </Flex>
         <Spacer size="4px" />
         <Flex container alignItems="center">
            <Form.Group>
               <Form.Text
                  id="name"
                  name="name"
                  value={name.value}
                  placeholder="Enter brand name"
                  onChange={e => setName({ ...name, value: e.target.value })}
                  onBlur={onBlur}
               />
               {name.meta.isTouched &&
                  !name.meta.isValid &&
                  name.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="8px" xAxis />
            <TextButton
               size="lg"
               type="outline"
               onClick={updateSetting}
               className="bttnbrand"
            >
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
