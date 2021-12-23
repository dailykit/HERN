import React from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/react-hooks'
import { Form, Spacer, TunnelHeader, Flex } from '@dailykit/ui'

import validator from '../../../../validators'
import { MASTER } from '../../../../../../graphql'
import { logger } from '../../../../../../../../shared/utils'
import { Banner, Tooltip } from '../../../../../../../../shared/components'
import Upload from './Upload'
import useAssets from '../../../../../../../../shared/components/AssetUploader/useAssets'

const address = 'apps.settings.views.forms.accompanimenttypes.tunnels.addnew.'

const AddTypesTunnel = ({ closeTunnel }) => {
   const { t } = useTranslation()

   const { upload } = useAssets()

   const imageInputRef = React.useRef(null)

   const iconInputRef = React.useRef(null)

   const bannerInputRef = React.useRef(null)

   const [imageUploadLoading, setImageUploadLoading] = React.useState(false)

   const [iconUploadLoading, setIconUploadLoading] = React.useState(false)

   const [bannerUploadLoading, setBannerUploadLoading] = React.useState(false)



   const [imageFiles, setImageFiles] = React.useState([])

   const [iconFiles, setIconFiles] = React.useState([])

   const [bannerFiles, setBannerFiles] = React.useState([])


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

   const [imageUrl, setImageUrl] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   const [iconUrl, setIconUrl] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   const [bannerUrl, setBannerUrl] = React.useState({
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
   const add = async () => {
      setImageUploadLoading(true)
      setIconUploadLoading(true)
      setBannerUploadLoading(true)
      let imageLocation, imageKey;
      if(imageFiles.length){
         [imageLocation, imageKey] = await imageUpload()
      }
      let iconLocation, iconKey;
      if (iconFiles.length){
         [iconLocation, iconKey] = await iconUpload()
      }
      let bannerLocation, bannerKey;
      if (bannerFiles.length){
         [bannerLocation, bannerKey] = await bannerUpload()
      }
      setImageUploadLoading(false)
      setIconUploadLoading(false)
      setBannerUploadLoading(false)
      addCategory({
         variables: {
            object: {
               name: name.value,
               metaDetails: {
                  description: description.value,
                  iconKey: iconKey,
                  imageKey: imageKey,
                  bannerKey: bannerKey
               },
               imageUrl: imageLocation,
               iconUrl: iconLocation
            },
         },
      })
   }

   const imageClearSelected = () => {
      setImageFiles([])
      if (imageInputRef.current?.value) {
         imageInputRef.current.value = null
      }
      setImageUrl({...imageUrl, 'value': ''})
   }

   const iconClearSelected = () => {
      setIconFiles([])
      if (iconInputRef.current?.value) {
         iconInputRef.current.value = null
      }
      setIconUrl({...iconUrl, 'value': ''})
   }

   const bannerClearSelected = () => {
      setBannerFiles([])
      if (bannerInputRef.current?.value) {
         bannerInputRef.current.value = null
      }
      setBannerUrl({...bannerUrl, 'value': ''})
   }

   const imageUpload = async () => {
      try {
         const list = await upload({ files:imageFiles })
         let file
         if (Array.isArray(list) && list.length === 1) {
            [file] = list
            setImageUrl({...imageUrl, value: file.Location })
         }
         
         imageClearSelected()
         return [file.Location, file.key]
      } catch (error) {
         toast.error('Failed to upload image, please try again.')
      }
   }

   const iconUpload = async () => {
      try {
         const list = await upload({ files:iconFiles })
         let file
         if (Array.isArray(list) && list.length === 1) {
            [file] = list
            setIconUrl({...iconUrl, value:file.Location})
         }
         iconClearSelected()
         return [file.Location, file.key]
      } catch (error) {
         toast.error('Failed to upload icon, please try again.')
      }
   }

   const bannerUpload = async () => {
      try {
         const list = await upload({ files:bannerFiles })
         let file
         if (Array.isArray(list) && list.length === 1) {
            [file] = list
            setBannerUrl({...bannerUrl, value:file.Location})
         }
         bannerClearSelected()
         return [file.Location, file.key]
      } catch (error) {
         toast.error('Failed to upload banner, please try again.')
      }
   }


   return (
      <>
         <TunnelHeader
            title="Add Product Category"
            right={{
               action: add,
               title: 'Add',
               isLoading: imageUploadLoading || addingCategory || iconUploadLoading || bannerUploadLoading,
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
            <Spacer size="16px" />
            <Form.Group>
               <Form.Label title="image">
                  Image
               </Form.Label>
               <Upload inputRef={imageInputRef} files={imageFiles} setFiles={setImageFiles} clearSelected={imageClearSelected} />
            </Form.Group>
            <Spacer size="20px" />
            <Form.Group>
               <Form.Label title="icon">
                  Icon
               </Form.Label>
               <Upload inputRef={iconInputRef} files={iconFiles} setFiles={setIconFiles} clearSelected={iconClearSelected} />
            </Form.Group>
            <Spacer size="20px" />
            <Form.Group>
               <Form.Label title="banner image">
                  Banner Image
               </Form.Label>
               <Upload inputRef={bannerInputRef} files={bannerFiles} setFiles={setBannerFiles} clearSelected={bannerClearSelected} />
            </Form.Group>
            
         </Flex>
         <Banner id="settings-app-master-lists-product-categories-tunnel-bottom" />
      </>
   )
}

export default AddTypesTunnel
