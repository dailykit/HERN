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

export const AppTitle = ({ update }) => {
   const params = useParams()
   const [title, setTitle] = React.useState({
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
         identifier: { _eq: 'App Title' },
         type: { _eq: 'visual' },
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
            if ('title' in brand.value) {
               setTitle({
                  value: brand.value.title,
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
      if (!settingId) return
      if (!title.meta.isValid) return toast.error('App title must be provided')
      update({ id: settingId, value: { title: title.value } })
   }, [title, settingId])

   const onBlur = e => {
      setTitle({
         ...title,
         meta: {
            ...title.meta,
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
      <div id="App Title">
         <Flex container alignItems="flex-start">
            <Text as="h3">App Title</Text>
            <Tooltip identifier="app_title_info" />
         </Flex>
         <Spacer size="4px" />
         <Flex container alignItems="center">
            <Form.Group>
               <Form.Text
                  id="name"
                  name="name"
                  placeholder="Enter app title"
                  value={title.value}
                  onChange={e => setTitle({ ...title, value: e.target.value })}
                  onBlur={onBlur}
               />
               {title.meta.isTouched &&
                  !title.meta.isValid &&
                  title.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="8px" xAxis />
            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
