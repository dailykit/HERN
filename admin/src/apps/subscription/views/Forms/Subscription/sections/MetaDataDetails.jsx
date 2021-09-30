import { EditIcon, CloseIcon } from '../../../../../../shared/assets/icons'
import { UPSERT_SUBSCRIPTION_TITLE } from '../../../../graphql'
import {
   Flex,
   Tooltip,
   ErrorState,
   InlineLoader,
   ErrorBoundary,
   Banner,
   AssetUploader,
} from '../../../../../../shared/components'
import { usePlan } from '../state'
import React from 'react'
import { toast } from 'react-toastify'
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
               onClick={() => ToggleTunnel(`UPSERT_SUBSCRIPTION_TITLE`)}
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
      id: null,
      icon: '',
      tags: '',
      coverImage: '',
   })
   const [upsertMetaDetails] = useMutation(UPSERT_SUBSCRIPTION_TITLE, {
      onCompleted: () => {
         closeTunnel(1)
         toast.success('Successfully added the metadata details')
      },
      onError: error => {
         toast.error('Failed to add the metadata details')
      },
   })

   React.useEffect(() => {
      if (TunnelState === 'EDIT_META_DETAILS') {
         setForm({
            id: state.id,
            icon: state.icon,
            tags: state.tags,
            coverImage: state.coverImage,
         })
      } else {
         setForm({
            id: null,
            icon: '',
            tags: '',
            coverImage: '',
         })
      }
   }, [TunnelState, state.item])

   const save = () => {
      const { tax, count, price, isTaxIncluded } = form
      upsertMetaDetails({
         variables: {
            object: {
               isTaxIncluded,
               tax: Number(tax),
               count: Number(count),
               price: Number(price),
               isActive: form.isActive,
               subscriptionServingId: state.serving.id,
               ...(form.id && { id: form.id }),
            },
         },
      })
   }

   const handleChange = (name, value) => {
      setForm(node => ({ ...node, [name]: value }))
   }
   const updateSetting = (data = {}) => {
      if ('url' in data) {
         console.log(`{ id: '', value: { url: data.url }`)
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
