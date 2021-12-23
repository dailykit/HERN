import React from 'react'
import { DashboardTile, Tunnels, Tunnel, useTunnel } from '@dailykit/ui'
import { BrandsSvg } from '../../../assets/illustrationTileSvg'
import { StyledHome, StyledCardList } from './styled'
import { Banner } from '../..'
import BrandManagerList from './ListForIds/brandId'
import BrandLocationManagerList from './ListForIds/brandIdLocation'

const OperationModeList = () => {
   const [brandTunnels, openBrandTunnel, closeBrandTunnel] = useTunnel(1)
   const [
      brandLocationTunnels,
      openBrandLocationTunnel,
      closeBrandLocationTunnel,
   ] = useTunnel(1)

   return (
      <>
         <StyledHome>
            <Banner id="operation-mode-top" />
            <h1>Operation Mode</h1>
            <StyledCardList>
               <DashboardTile
                  title="Brand Manager"
                  // count="29"
                  // conf="All available"
                  onClick={() => openBrandTunnel(1)}
                  tileSvg={<BrandsSvg />}
               />
               <DashboardTile
                  title="Brand Location Manager"
                  // count="29"
                  // conf="All available"
                  onClick={() => openBrandLocationTunnel(1)}
                  tileSvg={<BrandsSvg />}
               />
            </StyledCardList>
            <Banner id="operation-mode-bottom" />
         </StyledHome>

         <Tunnels tunnels={brandTunnels}>
            <Tunnel popup={true} layer={4} size="md">
               <BrandManagerList closeTunnel={closeBrandTunnel} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={brandLocationTunnels}>
            <Tunnel popup={true} layer={4} size="md">
               <BrandLocationManagerList
                  closeTunnel={closeBrandLocationTunnel}
               />
            </Tunnel>
         </Tunnels>
      </>
   )
}

export default OperationModeList
