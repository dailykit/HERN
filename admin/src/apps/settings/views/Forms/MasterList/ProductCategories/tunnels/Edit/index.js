import React from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Form, Spacer, TunnelHeader, Flex } from '@dailykit/ui'

import validator from '../../../../validators'
import { MASTER } from '../../../../../../graphql'
import { logger } from '../../../../../../../../shared/utils'
import { Banner, Tooltip } from '../../../../../../../../shared/components'
import Upload from './Upload'
import useAssets from '../../../../../../../../shared/components/AssetUploader/useAssets'

const address = 'apps.settings.views.forms.accompanimenttypes.tunnels.addnew.'

const EditTypesTunnel = ({ closeTunnel, productCategoryName }) => {
   const { t } = useTranslation()

   const { images, status, error:uploadError, remove, upload } = useAssets('images')
   console.log("error", uploadError)
   console.log("status", status)

   const imageInputRef = React.useRef(null)

   const iconInputRef = React.useRef(null)

   const bannerInputRef = React.useRef(null)

   const [imageFiles, setImageFiles] = React.useState([])

   const [iconFiles, setIconFiles] = React.useState([])

   const [bannerFiles, setBannerFiles] = React.useState([])

   const [iconKey, setIconKey] = React.useState('')

   const [imageKey, setImageKey] = React.useState('')

   const [bannerKey, setBannerKey] = React.useState('')

   const [imageUploadLoading, setImageUploadLoading] = React.useState(false)

   const [iconUploadLoading, setIconUploadLoading] = React.useState(false)

   const [bannerUploadLoading, setBannerUploadLoading] = React.useState(false)

   const [imageRemove, setImageRemove] = React.useState('')

   const [iconRemove, setIconRemove] = React.useState('')

   const [bannerRemove, setBannerRemove] = React.useState('')


   const [name, setName] = React.useState({
      value: '',
      meta: {
         isValid: true,
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

   // subscription
   const { loading, data, error } = useSubscription(
    MASTER.PRODUCT_CATEGORY.LIST_ONE, {
        variables:{
            name: productCategoryName
         },
        onSubscriptionData:({ subscriptionData: { data = {} } = {} })=> {
            if (data.productCategory.name) setName({...name, 'value':data.productCategory.name})
           if (data.productCategory.iconUrl) setIconUrl({...iconUrl, 'value':data.productCategory.iconUrl})
           if (data.productCategory.imageUrl) setImageUrl({...imageUrl, 'value':data.productCategory.imageUrl})
           if (data.productCategory.bannerUrl) setBannerUrl({...bannerUrl, 'value':data.productCategory.bannerUrl})
           if (data.productCategory.metaDetails&&data.productCategory.metaDetails.description ) setDescription({...description, 'value':data.productCategory.metaDetails.description})
           if (data.productCategory.iconUrl) setIconFiles([data.productCategory.iconUrl])
           if (data.productCategory.imageUrl) setImageFiles([data.productCategory.imageUrl])
           if (data.productCategory.bannerImageUrl) setBannerFiles([data.productCategory.bannerImageUrl])
           if (data.productCategory.metaDetails&&data.productCategory.metaDetails.imageKey ) setImageKey(data.productCategory.metaDetails.imageKey)
           if (data.productCategory.metaDetails&&data.productCategory.metaDetails.iconKey ) setIconKey(data.productCategory.metaDetails.iconKey)
           if (data.productCategory.metaDetails&&data.productCategory.metaDetails.bannerKey ) setBannerKey(data.productCategory.metaDetails.bannerKey)

        }
       }
 )

   // Mutation
   const [editCategory, { loading: editingCategory }] = useMutation(
      MASTER.PRODUCT_CATEGORY.UPDATE,
      {
         onCompleted: () => {
            
            toast.success('Product category edited!')
            closeTunnel(1)
         },
         onError: error => {
            console.log(error)
            toast.error('Failed to edit product category!')
            logger(error)
         },
      }
   )

   // Handlers
   const edit = async () => {
    setImageUploadLoading(true)
    setIconUploadLoading(true)
    setBannerUploadLoading(true)

    if (imageRemove){
        await remove(imageRemove)
        setImageRemove('')
        setImageKey('')
    } 
    if (iconRemove) {
        await remove(iconRemove)
        setIconRemove('')
        setIconKey('')
    }
    if (bannerRemove) {
        await remove(bannerRemove)
        setBannerRemove('')
        setBannerKey('')
    }
    let imageLocation = imageUrl.value, image=imageKey;
    if(imageFiles.length){
       let [location, key] = await imageUpload()
       if (location&&key){
           imageLocation = location
           image=key
       }
       
    }
    let iconLocation= iconUrl.value, icon=iconKey;
    if (iconFiles.length){
       let [location, key] = await iconUpload()
       if (location&&key){
        iconLocation = location
        icon=key
    }

    }
    let bannerLocation= bannerUrl.value, banner=bannerKey;
    if (bannerFiles.length){
       let [location, key] = await bannerImageUpload()
       if (location&&key){
        bannerLocation = location
        banner=key
    }

    }
    console.log(imageLocation, iconLocation, bannerLocation)
    setImageUploadLoading(false)
      setIconUploadLoading(false)
      setBannerUploadLoading(false)

      editCategory({
         variables: {
            name: productCategoryName,
            metaDetails: {
                description: description.value,
                iconKey: icon,
                imageKey: image,
                bannerKey: banner
            },
            imageUrl: imageLocation,
            iconUrl: iconLocation,
            bannerImageUrl: bannerLocation,
            updatedName: name.value
         },
      })
   }

   const imageClearSelected = () => {
      setImageFiles([])
      if (imageInputRef.current?.value) {
         imageInputRef.current.value = null
      }
      setImageUrl({'value': ''})
   }

   const iconClearSelected = () => {
      setIconFiles([])
      if (iconInputRef.current?.value) {
         iconInputRef.current.value = null
      }
      setIconUrl({'value': ''})
   }

   const bannerClearSelected = () => {
    setBannerFiles([])
    if (bannerInputRef.current?.value) {
       bannerInputRef.current.value = null
    }
    setBannerUrl({'value': ''})
 }

   const imageUpload = async () => {
      try {
         const list = await upload({ files:imageFiles })
         let file
         if (Array.isArray(list) && list.length === 1) {
            [file] = list
            setImageUrl({...imageUrl, value: file.Location })
         }
         
         return [file?.Location, file?.key]
      } catch (error) {
          console.log(error)
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
         return [file?.Location, file?.key]
      } catch (error) {
         toast.error('Failed to upload icon, please try again.')
      }
   }

   const bannerImageUpload = async () => {
    try {
       const list = await upload({ files:bannerFiles })
       let file
       if (Array.isArray(list) && list.length === 1) {
          [file] = list
          setBannerUrl({...bannerUrl, value:file.Location})
       }
       return [file?.Location, file?.key]
    } catch (error) {
       toast.error('Failed to upload banner, please try again.')
    }
 }


   return (
      <>
         <TunnelHeader
            title="Edit Product Category"
            right={{
               action: edit,
               title: 'Save',
               isLoading: imageUploadLoading || editingCategory || iconUploadLoading || bannerUploadLoading,
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
               <Upload inputRef={imageInputRef} files={imageFiles} setFiles={setImageFiles} clearSelected={imageClearSelected} Key={imageKey} assetRemove={setImageRemove} />
            </Form.Group>
            <Spacer size="20px" />
            <Form.Group>
               <Form.Label title="icon">
                  Icon
               </Form.Label>
               <Upload inputRef={iconInputRef} files={iconFiles} setFiles={setIconFiles} clearSelected={iconClearSelected} Key={iconKey} assetRemove={setIconRemove} />
            </Form.Group>
            <Spacer size="20px" />
            <Form.Group>
               <Form.Label title="banner image">
                  Banner Image
               </Form.Label>
               <Upload inputRef={bannerInputRef} files={bannerFiles} setFiles={setBannerFiles} clearSelected={bannerClearSelected} Key={bannerKey} assetRemove={setBannerRemove} />
            </Form.Group>
            
         </Flex>
         <Banner id="settings-app-master-lists-product-categories-tunnel-bottom" />
      </>
   )
}

export default EditTypesTunnel
