import React, { useState } from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Text, TunnelHeader, Loader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { TunnelBody, SolidTile } from './styled'
import { CREATE_CAMPAIGN, CAMPAIGN_TYPE } from '../../../../graphql'
import { randomSuffix } from '../../../../../../shared/utils'
import { useTabs } from '../../../../../../shared/providers'
import { Banner } from '../../../../../../shared/components'

export default function CampaignTypeTunnel({ close }) {
   const { addTab } = useTabs()
   const [types, setTypes] = useState([])
   // Subscription
   const { data: campaignType, loading } = useSubscription(CAMPAIGN_TYPE, {
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.crm_campaignType.map(
            type => {
               return {
                  id: type.id,
                  value: type.value,
               }
            }
         )
         setTypes(result)
      },
   })

   //Mutation
   const [createCampaign] = useMutation(CREATE_CAMPAIGN, {
      onCompleted: data => {
         addTab(
            data.createCampaign.metaDetails.title,
            `/crm/campaign/${data.createCampaign.id}`
         )
         toast.success('Campaign created!')
      },
      onError: error => {
         toast.error(`Error : ${error.message}`)
      },
   })

   const createCampaignHandler = type => {
      createCampaign({
         variables: {
            object: {
               type,
               metaDetails: { title: `Campaign Title-${randomSuffix()}` },
               condition: {
                  data: {},
               },
            },
         },
      })
   }
   if (loading) return <Loader />
   return (
      <>
         <TunnelHeader title="Select Type of Campaign" close={() => close(1)} />
         <Banner id="crm-app-campaigns-campaign-type-tunnel-top" />
         <TunnelBody>
            {types.map(type => {
               return (
                  <SolidTile
                     key={type.id}
                     onClick={() => createCampaignHandler(type.value)}
                  >
                     <Text as="h1">{type.value}</Text>
                     <Text as="subtitle">
                        Create Campaign For {type.value} Type.
                     </Text>
                  </SolidTile>
               )
            })}
         </TunnelBody>
         <Banner id="crm-app-campaigns-campaign-type-tunnel-bottom" />
      </>
   )
}
