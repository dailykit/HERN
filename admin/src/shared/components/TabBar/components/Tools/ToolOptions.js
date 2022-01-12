import React from 'react'
import {
   Avatar,
   IconButton,
   PlusIcon,
   RoundedCloseIcon,
   SearchIcon,
   useTunnel,
} from '@dailykit/ui'
import styled from 'styled-components'

import {
   ChevronRight,
   NotificationIcon,
   SettingsIcon,
   StoreIcon,
   HelpIcon,
} from '../../../../assets/icons'
import { useAuth } from '../../../../providers'

const Wrapper = styled.div`
   display: none;
   position: fixed;
   top: 48px;
   bottom: 0;
   left: 0;
   right: 0;
   z-index: 9;
   background: rgba(255, 255, 255, 0.13);
   border: 1px solid #f2f3f3;
   backdrop-filter: blur(44.37px);
   border-radius: 10px;
   > :first-child {
      margin-left: auto;
   }
   @media only screen and (max-width: 767px) {
      display: block;
   }
`
const Tool = styled.div`
   background: #f7f7f7;
   border-radius: 4px;
   display: flex;
   align-items: center;
   padding: 12px;
   margin: 2px 8px;
`
const Title = styled.div`
   font-style: normal;
   font-weight: 500;
   font-size: 12px;
   line-height: 16px;
   letter-spacing: 0.44px;
   text-transform: uppercase;
   color: #45484c;
   margin-left: 8px;
`
const Arrow = styled(IconButton)`
   border-radius: 50%;
   height: 16px;
   width: 16px;
   outline: none;
   margin-left: auto;
   background: linear-gradient(135deg, #ffffff 0%, #ebebeb 100%);
   box-shadow: -4px 4px 8px rgba(216, 216, 216, 0.2),
      4px -4px 8px rgba(216, 216, 216, 0.2),
      -4px -4px 8px rgba(255, 255, 255, 0.9),
      4px 4px 10px rgba(216, 216, 216, 0.9),
      inset 1px 1px 2px rgba(255, 255, 255, 0.3),
      inset -1px -1px 2px rgba(216, 216, 216, 0.5);
   border-radius: 18.6691px;
`
const ToolOptions = ({ setIsMenuOpen, handleOpen, tools, open }) => {
   const { user } = useAuth()
   const [
      createProductTunnels,
      openCreateProductTunnel,
      closeCreateProductTunnel,
   ] = useTunnel(1)
   const [createBrandTunnels, openCreateBrandTunnel, closeCreateBrandTunnel] =
      useTunnel(1)

   return (
      <Wrapper>
         <IconButton type="ghost" onClick={() => setIsMenuOpen(false)}>
            <RoundedCloseIcon />
         </IconButton>
         <Tool onClick={() => handleOpen(tools.createItem)}>
            <PlusIcon />
            <Title>Create New</Title>
            <Arrow type="ghost">
               <ChevronRight size={12} color="#75787A" />
            </Arrow>
         </Tool>

         <Tool onClick={() => handleOpen(tools.help)}>
            <HelpIcon />
            <Title>Help</Title>
            <Arrow type="ghost">
               <ChevronRight size={12} color="#75787A" />
            </Arrow>
         </Tool>
         {/* <Tool onClick={() => handleOpen(tools.search)}>
            <SearchIcon />
            <Title>Search</Title>
            <Arrow type="ghost">
               <ChevronRight size={12} color="#75787A" />
            </Arrow>
         </Tool> */}
         {/* <Tool>
            <NotificationIcon />
            <Title>Notifications</Title>
            <Arrow type="ghost">
               <ChevronRight size={12} color="#75787A" />
            </Arrow>
         </Tool> */}
         {/* <Tool>
            <SettingsIcon />
            <Title>Settings</Title>
            <Arrow type="ghost">
               <ChevronRight size={12} color="#75787A" />
            </Arrow>
         </Tool> */}
         {/* <Tool onClick={() => handleOpen(tools.marketPlace)}>
            <StoreIcon />
            <Title>MarketPlaces</Title>
            <Arrow type="ghost">
               <ChevronRight size={12} color="#75787A" />
            </Arrow>
         </Tool> */}
         <Tool onClick={() => handleOpen(tools.profile)}>
            <Avatar
               title={user?.name || 'user'}
               url=""
               style={{
                  height: '20px',
                  width: '20px',
                  fontSize: '10px',
                  marginRight: '10px',
               }}
            />
            <Title>Account</Title>
            <Arrow type="ghost">
               <ChevronRight size={12} color="#75787A" />
            </Arrow>
         </Tool>
      </Wrapper>
   )
}

export default ToolOptions
