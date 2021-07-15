import React, { useContext } from 'react'
import { ButtonTile, useTunnel } from '@dailykit/ui'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { UPDATE_COUPON } from '../../../../../graphql'
import BasicInfoTunnel from '../../../../../../../shared/components/BasicInfo'
import HorizontalCard from '../../../../../../../shared/components/HorizontalCard'
import { logger } from '../../../../../../../shared/utils'
import { StyledCard } from './styled'
import CouponContext from '../../../../../context/Coupon/CouponForm'

const Details = () => {
   const context = useContext(CouponContext)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(2)
   // Mutations
   const [updateCoupon] = useMutation(UPDATE_COUPON, {
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
         updateCoupon({
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
            titleIdentifier="coupon_details_title"
            descriptionIndentifier="coupon_details_description"
            headerIdentifier="coupon_details_tunnelHeader"
         />
         {context.state?.metaDetails?.title ||
         context.state?.metaDetails?.description ||
         context.state?.metaDetails?.image ? (
            <StyledCard>
               <HorizontalCard
                  data={context.state?.metaDetails}
                  open={() => openTunnel(1)}
                  altMessage="Coupon Image"
                  identifier="coupon_basic_details"
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
