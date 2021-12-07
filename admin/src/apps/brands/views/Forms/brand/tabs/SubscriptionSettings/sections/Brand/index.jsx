import React from 'react'
import { isEmpty, isNull } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import {
   TextButton,
   Text,
   Spacer,
   IconButton,
   PlusIcon,
   Tunnels,
   Tunnel,
   useTunnel,
   TunnelHeader,
   Form,
} from '@dailykit/ui'
import validator from '../../../../../../validator'
import { ImageContainer } from '../styled'
import { BRANDS } from '../../../../../../../graphql'
import { EditIcon } from '../../../../../../../../../shared/assets/icons'
import {
   Flex,
   AssetUploader,
   Tooltip,
   InlineLoader,
   Banner,
} from '../../../../../../../../../shared/components'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'

export const Brand = ({ update }) => {
   const params = useParams()
   const [form, setForm] = React.useState({
      url: '',
      name: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      favicon: '',
      logoMark: '',
      wordMark: '',
      metaDescription: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
   })
   const [current, setCurrent] = React.useState(null)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [settingId, setSettingId] = React.useState(null)
   const { loading, error } = useSubscription(BRANDS.SUBSCRIPTION_SETTING, {
      variables: {
         identifier: { _eq: 'theme-brand' },
         type: { _eq: 'brand' },
      },
      onSubscriptionData: ({
         subscriptionData: { data: { subscriptionSetting = [] } = {} } = {},
      }) => {
         if (!isEmpty(subscriptionSetting)) {
            const index = subscriptionSetting.findIndex(
               node => node?.brand?.brandId === Number(params.id)
            )

            if (index === -1) {
               const { id } = subscriptionSetting[0]
               setSettingId(id)
               return
            }
            const { brand, id } = subscriptionSetting[index]
            setSettingId(id)
            if (!isNull(brand) && !isEmpty(brand)) {
               setForm(form => ({
                  ...form,
                  ...(brand.value?.name && {
                     name: {
                        ...form.name,
                        value: brand.value.name,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.favicon && { favicon: brand.value.favicon }),
                  ...(brand.value?.metaDescription && {
                     metaDescription: {
                        ...form.metaDescription,
                        value: brand.value.metaDescription,
                        meta: {
                           isValid: true,
                           isTouched: false,
                           errors: [],
                        },
                     },
                  }),
                  ...(brand.value?.logo?.url && { url: brand.value.logo.url }),
                  ...(brand.value?.logo?.wordMark && {
                     wordMark: brand.value.logo.wordMark,
                  }),
                  ...(brand.value?.logo?.logoMark && {
                     logoMark: brand.value.logo.logoMark,
                  }),
               }))
            }
         }
      },
   })

   const updateSetting = React.useCallback(() => {
      if (!settingId) return
      if (form.name.meta.isValid && form.metaDescription.meta.isValid) {
         update({
            id: settingId,
            value: {
               name: form.name.value,
               favicon: form.favicon,
               metaDescription: form.metaDescription.value,
               logo: {
                  url: form.url,
                  logoMark: form.logoMark,
                  wordMark: form.wordMark,
               },
            },
         })
      } else {
         toast.error('Brand Details must be provided')
      }
   }, [form, settingId, update])

   const handleChange = e => {
      const { name, value } = e.target
      setForm({
         ...form,
         [name]: {
            ...form[name],
            value,
         },
      })

      closeTunnel(1)
      setCurrent(null)
   }

   const onBlur = e => {
      const { name, value } = e.target
      if (name === 'name') {
         setForm({
            ...form,
            name: {
               ...form.name,
               meta: {
                  ...form.name.meta,
                  isTouched: true,
                  errors: validator.text(value).errors,
                  isValid: validator.text(value).isValid,
               },
            },
         })
      } else {
         setForm({
            ...form,
            metaDescription: {
               ...form.metaDescription,
               meta: {
                  ...form.metaDescription.meta,
                  isTouched: true,
                  errors: validator.text(value).errors,
                  isValid: validator.text(value).isValid,
               },
            },
         })
      }
   }

   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }
   if (loading) return <InlineLoader />

   return (
      <div id="theme-brand">
         <Flex>
            <Flex>
               <Flex container alignItems="flex-start">
                  <Text as="h3">Name</Text>
                  <Tooltip identifier="brand_subscription_name_info" />
               </Flex>
               <Spacer size="4px" />
               <Form.Group>
                  <Form.Text
                     id="name"
                     name="name"
                     onBlur={onBlur}
                     value={form.name.value}
                     onChange={handleChange}
                     placeholder="Enter brand name"
                  />
                  {form.name.meta.isTouched &&
                     !form.name.meta.isValid &&
                     form.name.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Spacer size="24px" />
            <Flex>
               <Flex container alignItems="flex-start">
                  <Text as="h3">Meta Description</Text>
                  <Tooltip identifier="brand_metaDescription_info" />
               </Flex>
               <Spacer size="4px" />
               <Form.Group>
                  <Form.TextArea
                     onBlur={onBlur}
                     name="metaDescription"
                     onChange={handleChange}
                     value={form.metaDescription.value}
                     placeholder="Enter meta description for your brand"
                  />
                  {form.metaDescription.meta.isTouched &&
                     !form.metaDescription.meta.isValid &&
                     form.metaDescription.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
            </Flex>
            <Spacer size="24px" />
            <Flex container alignItems="center">
               <ImageItem
                  name="favIcon"
                  alt="Fav Icon"
                  title="Fav Icon"
                  image={form.favicon}
                  setCurrent={setCurrent}
                  openTunnel={openTunnel}
               />
               <Spacer size="16px" xAxis />
               <ImageItem
                  name="url"
                  alt="Logo"
                  title="Logo"
                  image={form.url}
                  setCurrent={setCurrent}
                  openTunnel={openTunnel}
               />
               <Spacer size="16px" xAxis />
               <ImageItem
                  name="wordMark"
                  alt="Word Mark"
                  title="Word Mark"
                  image={form.wordMark}
                  setCurrent={setCurrent}
                  openTunnel={openTunnel}
               />
               <Spacer size="16px" xAxis />
               <ImageItem
                  name="logoMark"
                  alt="Logo Mark"
                  title="Logo Mark"
                  image={form.logoMark}
                  setCurrent={setCurrent}
                  openTunnel={openTunnel}
               />
            </Flex>
            <Spacer size="16px" />
            <TextButton size="sm" type="outline" onClick={updateSetting}>
               Update
            </TextButton>
         </Flex>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <TunnelHeader title="Add Image" close={() => closeTunnel(1)} />
               <Banner id="brands-app-brands-brand-details-subscription-settings-assets-uploader-tunnel-top" />
               <Flex padding="16px">
                  <AssetUploader
                     onAssetUpload={data =>
                        setForm(form => ({
                           ...form,
                           [current]: data?.url || '',
                        }))
                     }
                     onImageSelect={data =>
                        setForm(form => ({
                           ...form,
                           [current]: data?.url || '',
                        }))
                     }
                  />
               </Flex>
               <Banner id="brands-app-brands-brand-details-subscription-settings-assets-uploader-tunnel-bottom" />{' '}
            </Tunnel>
         </Tunnels>
      </div>
   )
}

const ImageItem = ({ name, image, title, alt, setCurrent, openTunnel }) => {
   return (
      <Flex>
         <Text as="h3">{title}</Text>
         <Spacer size="12px" />
         {image ? (
            <ImageContainer width="120px" height="120px">
               <div>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={() => {
                        setCurrent(name)
                        openTunnel(1)
                     }}
                  >
                     <EditIcon />
                  </IconButton>
               </div>
               <img src={image} alt={alt} />
            </ImageContainer>
         ) : (
            <ImageContainer width="120px" height="120px" noThumb>
               <div>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={() => {
                        setCurrent(name)
                        openTunnel(1)
                     }}
                  >
                     <PlusIcon />
                  </IconButton>
               </div>
            </ImageContainer>
         )}
      </Flex>
   )
}
