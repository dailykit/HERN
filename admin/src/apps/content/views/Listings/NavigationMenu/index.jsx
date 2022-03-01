import React, { useRef, useState, useEffect, useContext } from 'react'
import {
   Text,
   Flex,
   IconButton,
   ComboButton,
   PlusIcon,
   Form,
   Tunnels,
   Tunnel,
   useTunnel,
} from '@dailykit/ui'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { StyledWrapper } from './styled'
import NavigationMenuTunnel from './Tunnel'
import options from '../tableOption'
import NavMenuContext from '../../../context/NavMenu'
// import BrandContext from '../../../context/Brand'
import {
   NAVIGATION_MENU,
   INSERT_NAVIGATION_MENU,
   DELETE_NAVIGATION_MENU,
   UPDATE_NAVIGATION_MENU,
} from '../../../graphql'
import { logger, randomSuffix } from '../../../../../shared/utils'
import { Tooltip, InlineLoader, Banner } from '../../../../../shared/components'
import { DeleteIcon, LeftIcon } from '../../../../../shared/assets/icons'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { BrandContext } from '../../../../../App'

const NavigationMenuListing = () => {
   const { tab, addTab, closeAllTabs } = useTabs()
   const [tunnels, openTunnel, closeTunnel] = useTunnel()
   const location = useLocation()
   const [navMenuContext, setNavMenuContext] = useContext(NavMenuContext)
   // const [context, setContext] = useContext(BrandContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)

   const { tooltip } = useTooltip()
   const tableRef = useRef(null)
   const [menuList, setMenuList] = useState(undefined)
   const { brandId } = brandContext
   const prevBrandId = useRef(brandId)

   //    Subscription for page listing
   const { loading, error: subscriptionError } = useSubscription(
      NAVIGATION_MENU,
      {
         onSubscriptionData: ({
            subscriptionData: {
               data: { brands_navigationMenu: navigationMenu = [] } = {},
            } = {},
         } = {}) => {
            const result = navigationMenu.map(menu => {
               return {
                  id: menu.id,
                  title: menu?.title || 'N/A',
                  isPublished: menu.isPublished,
               }
            })
            setMenuList(result)
         },
      }
   )

   //  Mutation for deleting subscription fold
   const [deleteMenu] = useMutation(DELETE_NAVIGATION_MENU, {
      onCompleted: () => {
         toast.success('Menu deleted!')
      },
      onError: error => {
         logger(error)
         toast.error('Could not delete!')
      },
   })

   // Mutation for creating menu
   const [createMenu, { loading: insertMutationLoading }] = useMutation(
      INSERT_NAVIGATION_MENU,
      {
         variables: {
            title: `menu-${randomSuffix()}`,
         },
         onCompleted: ({
            insert_brands_navigationMenu_one: menu = {},
         } = {}) => {
            const { title, id } = menu
            const path = `/content/navbarMenu/${id}`
            addTab(title, path)
            toast.success('Menu created successfully!')
         },
         onError: error => {
            toast.error('Something went wrong')
            logger(error)
         },
      }
   )

   // Mutation for menu publish toggle
   const [updateMenu] = useMutation(UPDATE_NAVIGATION_MENU, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   // delete Handler
   const deleteHandler = (e, menu) => {
      e.stopPropagation()
      if (
         window.confirm(
            `Deleting ${menu.title} will delete all the menu items in it. Are you Sure?`
         )
      ) {
         deleteMenu({
            variables: {
               menuId: menu.id,
            },
         })
      }
   }

   // toggle handler
   const toggleHandler = (toggle, id) => {
      const val = !toggle
      updateMenu({
         variables: {
            menuId: id,
            _set: {
               isPublished: val,
            },
         },
      })
   }

   // rowClick handler to open form

   const rowClick = (e, cell) => {
      const { id, title } = cell._cell.row.data
      setNavMenuContext({
         ...navMenuContext,
         menuId: id,
         menuTitle: title,
      })
      openTunnel(1)
   }

   // action button in list

   const DeleteButton = () => {
      return (
         <IconButton type="ghost">
            <DeleteIcon color="#FF5A52" />
         </IconButton>
      )
   }

   const ToggleButton = ({ cell }) => {
      const rowData = cell._cell.row.data
      return (
         <Form.Group>
            <Form.Toggle
               name={`navigationMenu-${rowData.id}`}
               onChange={() => toggleHandler(rowData.isPublished, rowData.id)}
               value={rowData.isPublished}
            />
         </Form.Group>
      )
   }

   const columns = [
      {
         title: 'Menu Title',
         field: 'title',
         headerFilter: true,
         hozAlign: 'left',
         cssClass: 'rowClick',
         cellClick: (e, cell) => {
            rowClick(e, cell)
         },
         headerTooltip: column => {
            const identifier = 'navbarMenu_listing_menuTitle_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 300,
      },
      {
         title: 'Publish',
         field: 'isPublished',
         hozAlign: 'center',
         formatter: reactFormatter(<ToggleButton />),
         titleFormatter: cell => {
            cell.getElement().style.textAlign = 'center'
            return '' + cell.getValue()
         },
         width: '200',
         headerTooltip: column => {
            const identifier = 'page_listing_published_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Action',
         field: 'action',
         headerFilter: false,
         headerSort: false,
         cellClick: (e, cell) => {
            e.stopPropagation()
            deleteHandler(e, cell._cell.row.data)
         },
         formatter: reactFormatter(<DeleteButton />),
         hozAlign: 'left',
         titleFormatter: cell => {
            cell.getElement().style.textAlign = 'left'
            return '' + cell.getValue()
         },
         width: 100,
      },
   ]

   useEffect(() => {
      if (!tab) {
         addTab('Pages', location.pathname)
      }
   }, [addTab, tab])

   if (brandId !== prevBrandId.current) {
      closeAllTabs()
   }

   if (loading) {
      return <InlineLoader />
   }
   if (subscriptionError) {
      toast.error('Something went wrong!')
      logger(subscriptionError)
   }
   return (
      <StyledWrapper>
         <Banner id="content-app-navigation-menu-listing-top" />
         <Flex
            container
            height="80px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2" style={{ marginBottom: '0em' }}>
                  Navigation Menu(
                  {menuList?.length})
               </Text>
               <Tooltip identifier="subscriptionFold_list_heading" />
            </Flex>
            <ComboButton
               isLoading={insertMutationLoading}
               type="solid"
               size="md"
               onClick={createMenu}
            >
               <PlusIcon color="#fff" /> Add Menu
            </ComboButton>
         </Flex>

         {Boolean(menuList) && (
            <ReactTabulator
               columns={columns}
               data={menuList}
               options={{
                  ...options,
                  placeholder: 'No Menu Available Yet !',
               }}
               ref={tableRef}
            />
         )}

         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <NavigationMenuTunnel close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="content-app-navigation-menu-listing-bottom" />
      </StyledWrapper>
   )
}

export default NavigationMenuListing
