import React, { useContext } from 'react'
import { ButtonTile, useTunnel } from '@dailykit/ui'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { UPDATE_CAMPAIGN } from '../../../../../graphql'
import BasicInfoTunnel from '../../../../../../../shared/components/BasicInfo'
import HorizontalCard from '../../../../../../../shared/components/HorizontalCard'
import { logger } from '../../../../../../../shared/utils'
import { StyledCard } from './styled'
import CampaignContext from '../../../../../context/Campaign/CampaignForm'

const Details = () => {
   const context = useContext(CampaignContext)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(2)
   // Mutations
   const [updateCampaign] = useMutation(UPDATE_CAMPAIGN, {
      onCompleted: () => {
         toast.success('Updated!')
         closeTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong')
         closeTunnel(1)
         logger(error)
      },
   })

   // Handlers
   const saveInfo = info => {
      if (info) {
         updateCampaign({
            variables: {
               id: context.state.id,
               set: {
                  metaDetails: info,
               },
            },
         })
      } else {
         toast.error('Basic information must be provided')
      }
   }

   return (
      <>
         <BasicInfoTunnel
            data={context.state.metaDetails}
            closeTunnel={closeTunnel}
            openTunnel={openTunnel}
            tunnels={tunnels}
            onSave={info => saveInfo(info)}
            titleIdentifier="campaign_info"
            headerIdentifier="campaign_details_tunnelHeader"
            descriptionIndentifier="campaign_details_description"
         />
         {context.state?.metaDetails?.title ||
         context.state?.metaDetails?.description ||
         context.state?.metaDetails?.image ? (
            <StyledCard>
               <HorizontalCard
                  data={context.state?.metaDetails}
                  type={context.state?.type}
                  open={() => openTunnel(1)}
                  altMessage="Campaign Image"
                  identifier="campaign_basic_details"
                  subheading="Type"
               />
            </StyledCard>
         ) : (
            <ButtonTile
               type="primary"
               size="sm"
               text="Add Basic Information"
               style={{ margin: '20px 0' }}
               onClick={() => openTunnel(1)}
            />
         )}
      </>
   )
}

export default Details
