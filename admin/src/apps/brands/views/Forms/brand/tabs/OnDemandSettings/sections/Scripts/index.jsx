import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { TextButton, Text, Spacer, Form } from '@dailykit/ui'

import { BRANDS } from '../../../../../../../graphql'
import {
   Flex,
   Tooltip,
   InlineLoader,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const Scripts = ({ update }) => {
   const params = useParams()
   const [settingId, setSettingId] = React.useState(null)
   const [scripts, setScripts] = React.useState({
      value: '',
      meta: { isValid: true, errors: [], isTouched: false },
   })
   const { loading, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         identifier: { _eq: 'Scripts' },
         type: { _eq: 'app' },
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
            if ('value' in brand.value) {
               setScripts({ ...scripts, value: brand.value.value })
            }
         }
      },
   })

   const validate = text => {
      const cleanText = text.trim()
      let isValid = true
      let errors = []
      if (cleanText.includes('"')) {
         isValid = false
         errors = [...errors, 'Scripts should not include "(double quotes)']
      }
      return {
         isValid,
         errors,
      }
   }

   const updateSetting = React.useCallback(() => {
      update({ id: settingId, value: { value: scripts.value.trim() } })
   }, [scripts, settingId])

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   return (
      <div id="Scripts">
         <Flex container alignItems="center">
            <Text as="h3">Scripts</Text>
            <Tooltip identifier="brand_app_scripts" />
         </Flex>
         <Spacer size="8px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <Form.Group>
               <Form.TextArea
                  id="scripts"
                  name="scripts"
                  onChange={e =>
                     setScripts({ ...scripts, value: e.target.value })
                  }
                  onBlur={e => {
                     const { isValid, errors } = validate(e.target.value)
                     setScripts({
                        ...scripts,
                        meta: { isTouched: true, isValid, errors },
                     })
                  }}
                  value={scripts.value}
                  placeholder="Enter scripts code here"
                  hasError={scripts.meta.isTouched && !scripts.meta.isValid}
               />
               {scripts.meta.isTouched &&
                  !scripts.meta.isValid &&
                  scripts.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <TextButton
               size="sm"
               type="outline"
               onClick={() => scripts.meta.isValid && updateSetting()}
            >
               Update
            </TextButton>
         </Flex>
      </div>
   )
}
