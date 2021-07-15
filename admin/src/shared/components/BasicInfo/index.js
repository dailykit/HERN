import React, { useState, useEffect } from 'react'
import {
   TunnelHeader,
   Tunnels,
   Tunnel,
   ButtonTile,
   Form,
   Spacer,
   Flex,
} from '@dailykit/ui'
import { TunnelBody, ImageContainer } from './styled'
import AssetTunnel from './asset'
import { Tooltip } from '../Tooltip'
import { DeleteIcon } from '../../assets/icons'
import Banner from '../Banner'

const BasicInfo = ({
   data,
   onSave,
   openTunnel,
   closeTunnel,
   tunnels,
   titleIdentifier,
   descriptionIndentifier,
   headerIdentifier,
}) => {
   const [info, setInfo] = useState({
      title: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      description: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      image: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
   })

   //validator function
   const validator = value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text.length < 1) {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
      return { isValid, errors }
   }

   const afterSave = info => {
      if (info.title.meta.isValid && info.description.meta.isValid) {
         onSave({
            title: info.title.value,
            description: info.description.value,
            image: info.image.value,
         })
      } else {
         onSave()
      }
   }

   const onBlur = e => {
      const { name, value } = e.target
      if (name === 'title') {
         setInfo({
            ...info,
            title: {
               ...info.title,
               meta: {
                  ...info.title.meta,
                  isTouched: true,
                  errors: validator(value).errors,
                  isValid: validator(value).isValid,
               },
            },
         })
      } else {
         setInfo({
            ...info,
            description: {
               ...info.description,
               meta: {
                  ...info.description.meta,
                  isTouched: true,
                  errors: validator(value).errors,
                  isValid: validator(value).isValid,
               },
            },
         })
      }
   }

   useEffect(() => {
      if (data) {
         console.log(data)
         setInfo({
            ...info,
            title: {
               ...info.title,
               value: data?.title || '',
               meta: {
                  ...info.title.meta,
                  isValid: data?.title ? true : false,
               },
            },
            description: {
               ...info.description,
               value: data?.description || '',
               meta: {
                  ...info.description.meta,
                  isValid: data?.title ? true : false,
               },
            },
            image: {
               ...info.image,
               value: data?.image || '',
               meta: {
                  ...info.image.meta,
                  isValid: data?.title ? true : false,
               },
            },
         })
         console.log(info)
      }
   }, [data])
   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <TunnelHeader
                  title="Add Basic Information"
                  right={{
                     action: () => afterSave(info),
                     title: 'Save',
                  }}
                  close={() => closeTunnel(1)}
                  tooltip={<Tooltip identifier={headerIdentifier} />}
               />
               <TunnelBody>
                  <Banner id="basic-info-tunnel-top" />
                  <Form.Group>
                     <Form.Label htmlFor="text" title="title">
                        <Flex container alignItems="center">
                           Title
                           <Tooltip identifier={titleIdentifier} />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="title"
                        name="title"
                        value={info.title.value}
                        placeholder="Enter Title here"
                        onChange={e =>
                           setInfo({
                              ...info,
                              title: { ...info.title, value: e.target.value },
                           })
                        }
                        onBlur={onBlur}
                     />
                     {info.title.meta.isTouched &&
                        !info.title.meta.isValid &&
                        info.title.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer size="32px" />
                  <Form.Group>
                     <Form.Label htmlFor="textarea" title="description">
                        <Flex container alignItems="center">
                           Description
                           <Tooltip identifier={descriptionIndentifier} />
                        </Flex>
                     </Form.Label>
                     <Form.TextArea
                        id="description"
                        name="description"
                        value={info.description.value}
                        placeholder="Enter Description here"
                        onChange={e =>
                           setInfo({
                              ...info,
                              description: {
                                 ...info.description,
                                 value: e.target.value,
                              },
                           })
                        }
                        onBlur={onBlur}
                     />
                     {info.description.meta.isTouched &&
                        !info.description.meta.isValid &&
                        info.description.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer size="32px" />
                  {info.image.value ? (
                     <ImageContainer>
                        <div>
                           <span
                              role="button"
                              tabIndex="0"
                              onKeyDown={e =>
                                 e.charCode === 13 &&
                                 setInfo({
                                    ...info,
                                    image: { ...info.image, value: '' },
                                 })
                              }
                              onClick={() =>
                                 setInfo({
                                    ...info,
                                    image: { ...info.image, value: '' },
                                 })
                              }
                           >
                              <DeleteIcon />
                           </span>
                        </div>
                        <img src={info.image.value} alt="Coupon" />
                     </ImageContainer>
                  ) : (
                     <ButtonTile
                        type="primary"
                        size="sm"
                        text="Add a Photo"
                        helper="upto 1MB - only JPG, PNG, PDF allowed"
                        onClick={() => openTunnel(2)}
                        style={{ margin: '20px 0' }}
                     />
                  )}
                  <Banner id="basic-info-tunnel-bottom" />
               </TunnelBody>
            </Tunnel>
            <Tunnel layer={2}>
               <AssetTunnel
                  onImageSave={image =>
                     setInfo({
                        ...info,
                        image: { ...info.image, value: image },
                     })
                  }
                  closeTunnel={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
      </>
   )
}

export default BasicInfo

// Made by Deepak Negi
