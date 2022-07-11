import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Text,
   Spacer,
   Form,
   Dropdown,
   ButtonGroup,
   TextButton,
} from '@dailykit/ui'
import { CopyIcon } from '../../../../../../editor/assets/Icons'
import validator from '../validator'
import { KIOSK, PINELABS_DEVICES } from '../../../../../graphql'
import { Wrapper, Label } from '../../../brand/styled'
import { logger } from '../../../../../../../shared/utils'
import { useTabs } from '../../../../../../../shared/providers'
import copy from 'copy-to-clipboard'
import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import moment from 'moment'
import { CheckIcon } from '../../../../../assets/icons'

export const BasicInfo = ({ selectedBrandId }) => {
   const params = useParams()
   const { tab, addTab, setTabTitle } = useTabs()
   const [title, setTitle] = React.useState({
      value: '',
      id: '',
      imei: '',
      merchantStorePosCode: '',
      created_at: '',
      updated_at: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [isIMEICopied, setIsIMEICopied] = React.useState(false)
   const [isMerchantStorePosCodeCopied, setIsMerchantStorePosCodeCopied] =
      React.useState(false)

   const { error, loading } = useSubscription(PINELABS_DEVICES.DEVICE, {
      variables: {
         id: { _eq: params.id },
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { device = {} },
         },
      }) => {
         setTitle({
            value: device[0].deviceLabel || '',
            id: device[0].id || '',
            imei: device[0].imei,
            merchantStorePosCode: device[0].merchantStorePosCode || '',
            created_at: device[0].created_at || '',
            updated_at: device[0].updated_at || '',
            meta: {
               isValid: device[0].deviceLabel ? true : false,
               isTouched: false,
               errors: [],
            },
         })
         setTabTitle(`Pinelabs Device - ${device[0].deviceLabel}` || '')
      },
   })

   const [updateDevice] = useMutation(PINELABS_DEVICES.UPDATE_DEVICE, {
      onCompleted: data => {
         toast.success('Updated!')
         console.log('update device data=>>', data)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const updateDeviceIMEI = async () => {
      const { isValid, errors } = validator.name(title.imei)
      if (isValid) {
         const { data } = await updateDevice({
            variables: {
               id: params.id,
               _set: {
                  imei: title.imei,
               },
            },
         })
      }
      setTitle({
         ...title,
         meta: {
            isTouched: true,
            errors,
            isValid,
         },
      })
   }

   const updateMerchantStorePosCode = async () => {
      const { isValid, errors } = validator.name(title.merchantStorePosCode)
      if (isValid) {
         const { data } = await updateDevice({
            variables: {
               id: params.id,
               _set: {
                  merchantStorePosCode: title.merchantStorePosCode,
               },
            },
         })
      }
      setTitle({
         ...title,
         meta: {
            isTouched: true,
            errors,
            isValid,
         },
      })
   }

   if (loading) {
      return <InlineLoader />
   }
   return (
      <div>
         <Flex padding="16px">
            <>
               <Flex container alignItems="center">
                  <Text as="h4">Last Update:</Text>
                  <Spacer size="16px" xAxis />
                  <Text as="text2">
                     {moment(title.updated_at).format('DD-MM-YYYY HH:mm:ss A')}
                  </Text>
               </Flex>
               <Spacer yAxis size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="imei" title="imei">
                     <ButtonGroup
                        style={{ gap: '5px' }}
                        onClick={() => {
                           copy(title.imei)
                           setIsIMEICopied(true)
                           setTimeout(() => {
                              setIsIMEICopied(false)
                           }, 3000)
                        }}
                     >
                        {'Device IMEI   '}
                        <div title={isIMEICopied ? 'Copied' : 'Copy'}>
                           {isIMEICopied ? (
                              <CheckIcon size={20} />
                           ) : (
                              <CopyIcon size={20} />
                           )}
                        </div>{' '}
                     </ButtonGroup>
                  </Form.Label>
                  <Flex container alignItems="center">
                     <Flex>
                        <Form.Text
                           value={title.imei}
                           placeholder="Enter device imei"
                           id="imei"
                           name="imei"
                           onChange={e =>
                              setTitle({ ...title, imei: e.target.value })
                           }
                           // onBlur={updateKioskAccessPassword}
                           hasError={!title.meta.isValid && title.isTouched}
                        />
                        {title.meta.isTouched &&
                           !title.meta.isValid &&
                           title.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Flex>
                     <Spacer xAxis size="15px" />
                     <TextButton
                        type="outline"
                        size="sm"
                        onClick={updateDeviceIMEI}
                     >
                        Save
                     </TextButton>
                  </Flex>
               </Form.Group>

               <Spacer yAxis size="16px" />

               <Form.Group>
                  <Form.Label
                     htmlFor="merchantStorePosCode"
                     title="merchantStorePosCode"
                  >
                     <ButtonGroup
                        style={{ gap: '5px' }}
                        onClick={() => {
                           copy(title.merchantStorePosCode)
                           setIsMerchantStorePosCodeCopied(true)
                           setTimeout(() => {
                              setIsMerchantStorePosCodeCopied(false)
                           }, 3000)
                        }}
                     >
                        {'Store POS Code   '}
                        <div
                           title={
                              isMerchantStorePosCodeCopied ? 'Copied' : 'Copy'
                           }
                        >
                           {isMerchantStorePosCodeCopied ? (
                              <CheckIcon size={20} />
                           ) : (
                              <CopyIcon size={20} />
                           )}
                        </div>{' '}
                     </ButtonGroup>
                  </Form.Label>
                  <Flex container alignItems="center">
                     <Flex>
                        <Form.Text
                           value={title.merchantStorePosCode}
                           placeholder="Enter store POS code"
                           id="merchantStorePosCode"
                           name="merchantStorePosCode"
                           onChange={e =>
                              setTitle({
                                 ...title,
                                 merchantStorePosCode: e.target.value,
                              })
                           }
                           // onBlur={updateKioskAccessPassword}
                           hasError={!title.meta.isValid && title.isTouched}
                        />
                        {title.meta.isTouched &&
                           !title.meta.isValid &&
                           title.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Flex>
                     <Spacer xAxis size="15px" />
                     <TextButton
                        type="outline"
                        size="sm"
                        onClick={updateMerchantStorePosCode}
                     >
                        Save
                     </TextButton>
                  </Flex>
               </Form.Group>
            </>
         </Flex>
      </div>
   )
}
