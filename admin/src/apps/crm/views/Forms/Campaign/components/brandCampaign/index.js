import React, { useState, useEffect, useRef, useContext } from 'react'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { toast } from 'react-toastify'
import { Text, Flex, Form } from '@dailykit/ui'
import { BRAND_CAMPAIGNS, UPSERT_BRAND_CAMPAIGN } from '../../../../../graphql'
import { StyledWrapper } from './styled'
import options from '../../../../tableOptions'
import { Tooltip, InlineLoader } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import CampaignContext from '../../../../../context/Campaign/CampaignForm'

const BrandCampaign = () => {
   const tableRef = useRef()
   const context = useContext(CampaignContext)
   // Subscription
   const {
      loading: listloading,
      error,
      data: { brands = [] } = {},
   } = useSubscription(BRAND_CAMPAIGNS)

   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   const [upsertBrandCampaign] = useMutation(UPSERT_BRAND_CAMPAIGN, {
      onCompleted: data => {
         console.log(data)
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   const columns = [
      {
         title: 'Title',
         field: 'title',
         hozAlign: 'left',
         headerFilter: true,
         headerSort: false,
      },
      {
         title: 'Domain',
         field: 'domain',
         hozAlign: 'left',
         headerFilter: true,
      },
      {
         title: 'Campaign Available',
         formatter: reactFormatter(
            <ToggleCampaign
               campaignId={context.state.id}
               onChange={object =>
                  upsertBrandCampaign({ variables: { object } })
               }
            />
         ),
         hozAlign: 'center',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'center'
            return '' + cell.getValue()
         },
         width: 200,
      },
   ]

   if (listloading) return <InlineLoader />

   return (
      <StyledWrapper>
         <Flex container alignItems="center" padding="6px">
            <Text as="h2">Brands</Text>
            <Tooltip identifier="brand_campaign_list_heading" />
         </Flex>
         {error ? (
            <Text as="p">Could not load brands</Text>
         ) : (
            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={brands}
               options={{
                  ...options,
                  placeholder: 'No Brand Campaigns Data Available Yet !',
               }}
            />
         )}
      </StyledWrapper>
   )
}

export default BrandCampaign

const ToggleCampaign = ({ cell, campaignId, onChange }) => {
   const brand = useRef(cell.getData())
   const [active, setActive] = useState(false)

   const toggleHandler = () => {
      const value = !active
      onChange({
         campaignId,
         brandId: brand.current.id,
         isActive: value,
      })
   }

   React.useEffect(() => {
      console.log(brand)
      const isActive = brand.current.brand_campaigns.some(
         campaign => campaign.campaignId === campaignId && campaign.isActive
      )
      console.log(isActive)
      setActive(isActive)
   }, [brand.current])

   return (
      <Form.Group>
         <Form.Toggle
            name={`brand_campaign_active-${brand.current.id}`}
            onChange={toggleHandler}
            value={active}
         />
      </Form.Group>
   )
}
