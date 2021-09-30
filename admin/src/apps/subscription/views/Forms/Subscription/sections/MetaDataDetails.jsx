import { EditIcon, CloseIcon } from '../../../../../../shared/assets/icons'
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
} from '@dailykit/ui'
import { MetadataDetailSection } from '../styled'

export const MetaDataDetails = () => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [TunnelState, setTunnelState] = React.useState('')
   const ToggleTunnel = type => {
      openTunnel(1)
      setTunnelState(type)
   }

   return (
      <MetadataDetailSection>
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
            TunnelState={TunnelState}
            closeTunnel={closeTunnel}
         />
      </MetadataDetailSection>
   )
}

const MetadataTunnel = ({ tunnels, TunnelState, closeTunnel }) => {
   const { state } = usePlan()
   const [form, setForm] = React.useState({
      icon: '',
      tags: '',
      coverImage: '',
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
      console.log(state, '🎀🎀🎄')
   }
   React.useEffect(() => {
      if (TunnelState === 'EDIT_META_DETAILS') {
         setForm({
            icon: state.meta.icon,
            tags: state.meta.tags,
            coverImage: state.meta.coverImage,
         })
      } else {
         setForm({
            icon: '',
            tags: '',
            coverImage: '',
         })
      }
   }, [TunnelState, state.meta])

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
   const updateSetting = (data = {}) => {
      if ('url' in data) {
         form.coverImage = data.url
      }
      closeTunnel(1)
   }
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer="1">
            <TunnelHeader
               title={
                  TunnelState === 'ADD_META_DETAILS'
                     ? 'Add Metadata Details'
                     : 'Edit Metadata Details'
               }
               close={() => closeTunnel(1)}
               right={{
                  title: 'Save',
                  action: () => save(),
                  disabled: !form.icon || !form.coverImage,
               }}
               tooltip={
                  <Tooltip identifier="form_subscription_tunnel_item_create" />
               }
            />
            <Banner id="subscription-app-create-subscription-item-count-tunnel-top" />
            <Flex padding="16px">
               <Form.Group>
                  <Form.Label htmlFor="icon" title="icon">
                     <Flex container alignItems="center">
                        Icon*
                        <Tooltip identifier="form_subscription_tunnel_item_field_count" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="icon"
                     name="icon"
                     value={form.icon}
                     onChange={e => handleChange(e.target.name, e.target.value)}
                     placeholder="icon"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="tags" title="tags">
                     <Flex container alignItems="center">
                        Tags*
                        <Tooltip identifier="form_subscription_tunnel_item_field_price" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="tags"
                     name="tags"
                     onChange={e => handleChange(e.target.name, e.target.value)}
                     value={form.tags}
                     placeholder="Enter tags"
                  />
               </Form.Group>
               <Spacer size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="coverImage" title="coverImage">
                     <Flex container alignItems="center">
                        CoverImage*
                        <Tooltip identifier="form_subscription_tunnel_item_field_price" />
                     </Flex>
                  </Form.Label>
                  <Flex padding="16px">
                     <AssetUploader
                        onAssetUpload={data => updateSetting(data)}
                        onImageSelect={data => updateSetting(data)}
                     />
                  </Flex>
               </Form.Group>
            </Flex>
            <Banner id="subscription-app-create-subscription-item-count-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}
