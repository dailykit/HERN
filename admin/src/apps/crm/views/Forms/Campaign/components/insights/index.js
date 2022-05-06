import React from 'react'
import BrandShopDate from '../../../../../../../shared/components/BrandShopDateProvider'
import CampaignTiles from './campaignTiles'

const CampaignInsights = ({ campaignId }) => {
   return (
      <BrandShopDate brandProvider datePickerProvider>
         <CampaignTiles campaignId={campaignId} />
      </BrandShopDate>
   )
}
export default CampaignInsights
