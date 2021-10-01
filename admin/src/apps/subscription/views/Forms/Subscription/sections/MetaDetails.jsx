import {
   EditIcon,
   CloseIcon,
   DeleteIcon,
} from '../../../../../../shared/assets/icons'
import { UPSERT_SUBSCRIPTION_METADATA_DETAILS } from '../../../../graphql'
import {
   Flex,
   Tooltip,
   Banner,
   AssetUploader,
} from '../../../../../../shared/components'
import { usePlan } from '../state'
import React from 'react'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../shared/utils'
import { useMutation } from '@apollo/react-hooks'
import {
   Tag,
   Text,
   Form,
   Tunnel,
   Spacer,
   Tunnels,
   PlusIcon,
   useTunnel,
   IconButton,
   ComboButton,
   TunnelHeader,
   ButtonTile,
   HelperText,
} from '@dailykit/ui'

import { MetaDetailsSection, ImageContainer } from '../styled'

export const MetaDetails = ({ metaDetails }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [TunnelState, setTunnelState] = React.useState('')
   const ToggleTunnel = type => {
      openTunnel(1)
      setTunnelState(type)
   }
   {
      console.log('METADETAILS', metaDetails)
   }
   return (
      <MetaDetailsSection>
         <Form.Group>
            <Form.Label htmlFor="title" title="title">
               <Flex container alignItems="center">
                  <span style={{ marginLeft: '20px' }}>Metadata details</span>
                  <Tooltip identifier="form_subscription_field_title" />
               </Flex>
            </Form.Label>
            <IconButton
               size="sm"
               type="outline"
               style={{ marginLeft: '20px' }}
               onClick={() =>
                  ToggleTunnel(`UPSERT_SUBSCRIPTION_METADATA_DETAILS`)
               }
            >
               <EditIcon />
            </IconButton>
         </Form.Group>
         <MetadataTunnel
            tunnels={tunnels}
            TunnelState={'EDIT_META_DETAILS'}
            closeTunnel={closeTunnel}
            data={metaDetails}
         />
      </MetaDetailsSection>
   )
}

const MetadataTunnel = ({ tunnels, TunnelState, closeTunnel, data }) => {
   const { state } = usePlan()
   const [tunnel1, openTunnel1, closeTunnel1] = useTunnel(1)
   const [tunnel2, openTunnel2, closeTunnel2] = useTunnel(1)
   const [form, setForm] = React.useState({
      icon: data?.icon,
      tags: data?.tags,
      coverImage: data?.coverImage,
   })
   const [upsertMetaDetails] = useMutation(
      UPSERT_SUBSCRIPTION_METADATA_DETAILS,
      {
         onCompleted: () => {
            closeTunnel(1)
            toast.success('Successfully added the metadata details')
         },
         onError: error => {
            logger(error)
            toast.error('Failed to add the metadata details')
         },
      }
   )
   {
      console.log(form, '🎀🎀🎄')
   }
   React.useEffect(() => {
      if (TunnelState === 'EDIT_META_DETAILS') {
         setForm({
            icon: data?.icon,
            tags: data?.tags,
            coverImage: data?.coverImage,
         })
      } else {
         setForm({
            icon: '',
            tags: '',
            coverImage: '',
         })
      }
   }, [TunnelState, data])

   const save = () => {
      const { icon, tags, coverImage } = form
      upsertMetaDetails({
         variables: {
            id: state.title.id,
            _set: {
               metaDetails: {
                  icon: icon,
                  tags: tags,
                  coverImage: coverImage,
               },
            },
         },
      })
   }

   const handleChange = (name, value) => {
      setForm(node => ({ ...node, [name]: value }))
   }
   const updateCoverImage = (data = {}) => {
      if ('url' in data) {
         form.coverImage = data?.url
      }
      closeTunnel2(1)
   }
   const updateIcon = (data = {}) => {
      if ('url' in data) {
         form.icon = data?.url
      }
      closeTunnel1(1)
   }
   const deleteImage = (name, value) => {
      setForm(node => ({ ...node, [name]: value }))
   }
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer="1">
            <TunnelHeader
               title={
                  TunnelState === 'ADD_META_DETAILS'
                     ? 'Add Meta Details'
                     : 'Edit Meta Details'
               }
               close={() => closeTunnel(1)}
               right={{
                  title: 'Save',
                  action: () => save(),
               }}
               tooltip={
                  <Tooltip identifier="form_subscription_tunnel_item_create" />
               }
            />
            <Banner id="subscription-app-create-subscription-item-count-tunnel-top" />
            <Flex container flexWrap="wrap" padding="36.64px">
               <div style={{ paddingRight: '15px', paddingBottom: '20px' }}>
                  <Form.Group>
                     <Form.Label htmlFor="tags" title="tags">
                        <Flex container alignItems="center">
                           <span
                              style={{
                                 fontWeight: '500',
                                 fontSize: '15px',
                                 lineHeight: '14px',
                              }}
                           >
                              Tags
                           </span>
                           <Tooltip identifier="form_subscription_metadetails_tunnel_tags" />
                        </Flex>
                     </Form.Label>
                     <Form.Text
                        id="tags"
                        name="tags"
                        variant="revamp-sm"
                        onChange={e =>
                           handleChange(e.target.name, e.target.value)
                        }
                        style={{ marginTop: '4px', width: 'fit-content' }}
                        value={form.tags}
                        placeholder="enter tags"
                     />
                     <Spacer size="10px" />
                     <HelperText
                        fontSize="11px"
                        style={{ fontSize: '11px' }}
                        type="hint"
                        message="enter comma separated values, for example: No-gluten, sugarless"
                     />
                  </Form.Group>
               </div>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="icon" title="icon">
                     <span
                        style={{
                           fontWeight: '500',
                           fontSize: '15px',
                           lineHeight: '14px',
                        }}
                     >
                        Icon
                     </span>
                     <Tooltip identifier="form_subscription_tunnel_icon" />
                  </Form.Label>
                  <Flex style={{ marginTop: '4px' }}>
                     {form.icon ? (
                        <ImageContainer
                           width="170px"
                           height="120px"
                           padding="0px"
                        >
                           <div
                              style={{
                                 width: 'min-content',
                                 background: 'transparent',
                              }}
                           >
                              <IconButton
                                 style={{ background: 'transparent' }}
                                 size="sm"
                                 type="solid"
                                 onClick={() => openTunnel1(1)}
                              >
                                 <EditIcon />
                              </IconButton>

                              <IconButton
                                 style={{ background: 'transparent' }}
                                 size="sm"
                                 type="solid"
                                 onClick={() => deleteImage('icon', '')}
                              >
                                 <DeleteIcon />
                              </IconButton>
                           </div>
                           <img
                              src={form.icon}
                              alt="icon"
                              style={{ borderRadius: '8px' }}
                           />
                        </ImageContainer>
                     ) : (
                        <ButtonTile
                           type="uploadImage"
                           size="sm"
                           text="Upload Icon"
                           onClick={() => openTunnel1(1)}
                           style={{ width: '170px', height: '120px' }}
                        />
                     )}
                     <Tunnels tunnels={tunnel1}>
                        <Tunnel layer={1} size="md">
                           <TunnelHeader
                              title="Add Icon"
                              close={() => closeTunnel1(1)}
                           />
                           <Banner id="subscription-app-subscription-metadata-details-icon-tunnel-top" />
                           <Flex padding="16px">
                              <AssetUploader
                                 onAssetUpload={data => updateIcon(data)}
                                 onImageSelect={data => updateIcon(data)}
                              />
                           </Flex>
                           <Banner id="subscription-app-subscription-metadata-details-icon-tunnel-bottom" />
                        </Tunnel>
                     </Tunnels>
                  </Flex>
               </Form.Group>
               <Spacer size="16px" />

               <Form.Group>
                  <Form.Label htmlFor="coverImage" title="coverImage">
                     <Flex container alignItems="center">
                        <span
                           style={{
                              fontWeight: '500',
                              fontSize: '15px',
                              lineHeight: '14px',
                           }}
                        >
                           Cover Image
                        </span>
                        <Tooltip identifier="form_subscription_tunnel_coverImage" />
                     </Flex>
                  </Form.Label>
                  <Flex style={{ marginTop: '4px' }}>
                     {form.coverImage ? (
                        <ImageContainer
                           width="314px"
                           height="190px"
                           padding="0px"
                        >
                           <div
                              style={{
                                 width: 'min-content',
                                 background: 'transparent',
                              }}
                           >
                              <IconButton
                                 style={{ background: 'transparent' }}
                                 size="sm"
                                 type="solid"
                                 onClick={() => openTunnel2(1)}
                              >
                                 <EditIcon />
                              </IconButton>
                              <IconButton
                                 style={{ background: 'transparent' }}
                                 size="sm"
                                 type="solid"
                                 onClick={() => deleteImage('coverImage', '')}
                              >
                                 <DeleteIcon />
                              </IconButton>
                           </div>
                           <img
                              src={form.coverImage}
                              alt="Brand Logo"
                              style={{ borderRadius: '8px' }}
                           />
                        </ImageContainer>
                     ) : (
                        <ButtonTile
                           type="uploadImage"
                           size="sm"
                           text="Upload Images"
                           onClick={() => openTunnel2(1)}
                           style={{ width: '314px', height: '190px' }}
                        />
                     )}
                     <Tunnels tunnels={tunnel2}>
                        <Tunnel layer={1} size="md">
                           <TunnelHeader
                              title="Add Cover Image"
                              close={() => closeTunnel2(1)}
                           />
                           <Banner id="subscription-app-subscription-metadata-details-coverImage-tunnel-top" />
                           <Flex padding="16px">
                              <AssetUploader
                                 onAssetUpload={data => updateCoverImage(data)}
                                 onImageSelect={data => updateCoverImage(data)}
                              />
                           </Flex>
                           <Banner id="subscription-app-subscription-metadata-details-coverImage-tunnel-bottom" />
                        </Tunnel>
                     </Tunnels>
                  </Flex>
               </Form.Group>
            </Flex>
            <Banner id="subscription-app-upsert-subscription-metadata-details-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}
