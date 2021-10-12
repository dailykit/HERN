import React from 'react'
import qs from 'query-string'
import { useHistory } from 'react-router-dom'
import { useOnClickOutside, Tunnels, Tunnel, useTunnel } from '@dailykit/ui'
import { ChevronDown } from '../../../../assets/icons'
import { TooltipProvider } from '../../../../providers'
import { StyledTools, ToolbarMenu } from './styled'
import CreateNew from './CreateNew'
import ToolOptions from './ToolOptions'
import ToolList from './ToolList'
import Account from './Account'
import Search from './Search'
import MarketPlace from './MarketPlace'
import CreateProduct from '../../../../CreateUtils/Product/createProduct'
import CreateIngredient from '../../../../CreateUtils/Ingredient/CreateIngredient'
import CreateRecipe from '../../../../CreateUtils/Recipe/createRecipe'
import CreateBrand from '../../../../CreateUtils/Brand/CreateBrand'
import CreateCollection from '../../../../CreateUtils/Menu/createCollection'
import CreateSupplier from '../../../../CreateUtils/Inventory/createSupplier'
import CreateItem from '../../../../CreateUtils/Inventory/createItem'

const Tools = ({ isTabHidden, setIsTabHidden }) => {
   const [lang, setLang] = React.useState(
      localStorage.getItem('i18nextLng') || 'en'
   )
   const history = useHistory()

   const [open, setOpen] = React.useState(null)
   const [isMenuOpen, setIsMenuOpen] = React.useState(false)
   const toolbarRef = React.useRef()
   const [isModalOpen, setIsModalOpen] = React.useState(false)

   const [
      createRecipeTunnels,
      openCreateRecipeTunnel,
      closeCreateRecipeTunnel,
   ] = useTunnel(1)

   const [
      createIngredientTunnels,
      openCreateIngredientTunnel,
      closeCreateIngredientTunnel,
   ] = useTunnel(1)
   const [
      createProductTunnels,
      openCreateProductTunnel,
      closeCreateProductTunnel,
   ] = useTunnel(3)
   const [createBrandTunnels, openCreateBrandTunnel, closeCreateBrandTunnel] =
      useTunnel(1)
   const [
      createSupplierTunnels,
      openCreateSupplierTunnel,
      closeCreateSupplierTunnel,
   ] = useTunnel(1)
   /* Item */
   const [createItemTunnels, openCreateItemTunnel, closeCreateItemTunnel] =
      useTunnel(1)
   const [
      createCollectionTunnels,
      openCollectionTunnel,
      closeCollectionTunnel,
   ] = useTunnel(1)

   const tools = {
      createItem: 'create-item',
      profile: 'profile',
      search: 'search',
      marketPlace: 'marketPlace',
      help: 'help',
   }

   const { createItem, profile, search, marketPlace, help } = tools

   const handleOpen = item => {
      console.log({ item })
      setOpen(open === null || open !== item ? item : null)
   }
//    useOnClickOutside(toolbarRef, () => {
//       setIsMenuOpen(false)
//       setOpen(null)
//       const values = qs.parse(window.location.search)

//       const newQsValue = qs.stringify({ ...values, optionId: undefined })
//       history.push({ search: `?${newQsValue}` })
//    })

   return (
      <StyledTools ref={toolbarRef} isTabHidden={isTabHidden}>
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
               openCreateRecipeTunnel={openCreateRecipeTunnel}
               openCreateIngredientTunnel={openCreateIngredientTunnel}
               openCreateSupplierTunnel={openCreateSupplierTunnel}
               openCreateItemTunnel={openCreateItemTunnel}
               openCollectionTunnel={openCollectionTunnel}
            />
         )}

         {open === help && (
            <BottomBar
               setOpen={setOpen}
               setIsMenuOpen={setIsMenuOpen}
               setIsModalOpen={setIsModalOpen}
               isModalOpen={isModalOpen}
            />
         )}

         {open === profile && (
            <Account
               lang={lang}
               setLang={setLang}
               setIsMenuOpen={setIsMenuOpen}
               setOpen={setOpen}
               isTabHidden={isTabHidden}
               setIsTabHidden={setIsTabHidden}
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
                  <CreateBrand closeTunnel={closeCreateBrandTunnel} />
               </TooltipProvider>
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={createCollectionTunnels}>
            <Tunnel layer={1} size="md">
               <TooltipProvider app="Menu App">
                  <CreateCollection close={closeCollectionTunnel} />
               </TooltipProvider>
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={createRecipeTunnels}>
            <Tunnel layer={1} size="md">
               <TooltipProvider app="Products App">
                  <CreateRecipe closeTunnel={closeCreateRecipeTunnel} />
               </TooltipProvider>
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={createIngredientTunnels}>
            <Tunnel layer={1} size="md">
               <TooltipProvider app="Products App">
                  <CreateIngredient closeTunnel={closeCreateIngredientTunnel} />
               </TooltipProvider>
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={createProductTunnels}>
            <Tunnel layer={1}></Tunnel>
            <Tunnel layer={2}></Tunnel>
            <Tunnel layer={3}>
               <TooltipProvider app="Products App">
                  <CreateProduct close={closeCreateProductTunnel} />
               </TooltipProvider>
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={createSupplierTunnels}>
            <Tunnel layer={1} size="md">
               <TooltipProvider app="Inventory App">
                  <CreateSupplier closeTunnel={closeCreateSupplierTunnel} />
               </TooltipProvider>
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={createItemTunnels}>
            <Tunnel layer={1} size="md">
               <TooltipProvider app="Inventory App">
                  <CreateItem closeTunnel={closeCreateItemTunnel} />
               </TooltipProvider>
            </Tunnel>
         </Tunnels>
      </StyledTools>
   )
}

export default Tools
