import React from 'react'
import { useOnClickOutside, Tunnels, Tunnel, useTunnel } from '@dailykit/ui'
import { ChevronDown } from '../../../../assets/icons'
import { TooltipProvider } from '../../../../providers'
import { ToolbarMenu } from './styled'
import CreateNew from './CreateNew'
import CreateBrandTunnel from '../../../../../apps/brands/views/Listings/brands/CreateBrandTunnel'
import { ProductTypeTunnel } from '../../../../../apps/products/views/Listings/ProductsListing/tunnels'
import ToolOptions from './ToolOptions'
import ToolList from './ToolList'
import Account from './Account'
import Search from './Search'
import MarketPlace from './MarketPlace'

const Tools = () => {
   const [lang, setLang] = React.useState(
      localStorage.getItem('i18nextLng') || 'en'
   )

   const [open, setOpen] = React.useState(null)
   const [isMenuOpen, setIsMenuOpen] = React.useState(false)
   const toolbarRef = React.useRef()

   const [
      createProductTunnels,
      openCreateProductTunnel,
      closeCreateProductTunnel,
   ] = useTunnel(3)
   const [createBrandTunnels, openCreateBrandTunnel, closeCreateBrandTunnel] =
      useTunnel(1)
   const tools = {
      createItem: 'create-item',
      profile: 'profile',
      search: 'search',
      marketPlace: 'marketPlace',
   }

   const { createItem, profile, search, marketPlace } = tools

   const handleOpen = item => {
      setOpen(open === null || open !== item ? item : null)
   }
   useOnClickOutside(toolbarRef, () => {
      setIsMenuOpen(false)
      setOpen(null)
   })

   return (
      <div ref={toolbarRef} style={{ width: '238px' }}>
         {/* LIST OF TOOLS IN LARGE SCREEN */}
         <ToolList
            toolbarRef={toolbarRef}
            tools={tools}
            open={open}
            handleOpen={handleOpen}
         />

         {/*MENU ICON FOR SMALLER SCREEN*/}
         <ToolbarMenu
            onClick={() => {
               setOpen(null)
               setIsMenuOpen(!isMenuOpen)
            }}
         >
            <ChevronDown
               size={20}
               color={isMenuOpen && open === null ? '#367BF5' : '#202020'}
            />
         </ToolbarMenu>

         {/*TOOLBAR OPTIONS FOR SMALLER SCREEN*/}
         {isMenuOpen && open === null && (
            <ToolOptions
               setIsMenuOpen={setIsMenuOpen}
               tools={tools}
               open={open}
               handleOpen={handleOpen}
               setOpen={setOpen}
            />
         )}

         {/*TOOLBAR OPTIONS FOR BOTH SCREEN*/}
         {open === createItem && (
            <CreateNew
               setOpen={setOpen}
               setIsMenuOpen={setIsMenuOpen}
               openCreateBrandTunnel={openCreateBrandTunnel}
               openCreateProductTunnel={openCreateProductTunnel}
            />
         )}
         {open === profile && (
            <Account
               lang={lang}
               setLang={setLang}
               setIsMenuOpen={setIsMenuOpen}
               setOpen={setOpen}
            />
         )}
         {open === search && <Search setOpen={setOpen} />}
         {open === marketPlace && (
            <MarketPlace setIsMenuOpen={setIsMenuOpen} setOpen={setOpen} />
         )}

         {/* Tunnels */}
         <Tunnels tunnels={createBrandTunnels}>
            <Tunnel layer={1} size="md">
               <TooltipProvider app="Brand App">
                  <CreateBrandTunnel closeTunnel={closeCreateBrandTunnel} />
               </TooltipProvider>
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={createProductTunnels}>
            <Tunnel layer={1}></Tunnel>
            <Tunnel layer={2}></Tunnel>
            <Tunnel layer={3}>
               <TooltipProvider app="Products App">
                  <ProductTypeTunnel close={closeCreateProductTunnel} />
               </TooltipProvider>
            </Tunnel>
         </Tunnels>
      </div>
   )
}

export default Tools
