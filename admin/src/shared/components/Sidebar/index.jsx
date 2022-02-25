import React, { Children } from 'react'
import gql from 'graphql-tag'
import {
   Flex,
   IconButton,
   RoundedCloseIcon,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import Styles from './styled'
import { InlineLoader } from '../InlineLoader'
import { TooltipProvider, useTabs } from '../../providers'
import { useLocation } from 'react-router-dom'
import { Tooltip } from '../../components'
import { has, isInteger } from 'lodash'
import { useOnClickOutside } from '../../hooks'
import {
   BrandAppIcon,
   CustomersAppIcon,
   HomeAppIcon,
   InventoryAppIcon,
   MenuAppIcon,
   OrderAppIcon,
   ProductsAppIcon,
   ReportsAppIcon,
   SettingAppIcon,
   StoreAppIcon,
   SubscriptionAppIcon,
   CartsAppIcon,
   ArrowUp,
   ArrowDown,
   DeveloperAppIcon
} from '../../assets/navBarIcons'
import { toast } from 'react-toastify'
import { logger, randomSuffix } from '../../utils'
import {
   CREATE_BULK_WORK_ORDER,
   CREATE_ITEM_PURCHASE_ORDER,
   CREATE_PACKAGING,
   CREATE_PURCHASE_ORDER,
   CREATE_SACHET_WORK_ORDER,
   CREATE_SUPPLIER,
} from '../../../apps/inventory/graphql'
import { GENERAL_ERROR_MESSAGE } from '../../../apps/inventory/constants/errorMessages'
import { v4 as uuid } from 'uuid'
import { STATIONS, USERS } from '../../../apps/settings/graphql'
import AddUnitTunnel from '../../../apps/settings/views/Forms/MasterList/Units/tunnels/AddTypes'
import AddProcessingTunnel from '../../../apps/settings/views/Forms/MasterList/Processings/tunnels/AddTypes'
import AddCuisinesTunnel from '../../../apps/settings/views/Forms/MasterList/Cuisine/tunnels/AddTypes'
import AddProductCategoriesTunnel from '../../../apps/settings/views/Forms/MasterList/ProductCategories/tunnels/Add'
import AddIngredientCategoriesTunnel from '../../../apps/settings/views/Forms/MasterList/IngredientCategories/tunnels/Add'
import AddAllergensTunnel from '../../../apps/settings/views/Forms/MasterList/Allergens/tunnels/AddTypes'
import AddAccompanimentTypesTunnel from '../../../apps/settings/views/Forms/MasterList/AccompanimentTypes/tunnels/AddTypes'
import { CREATE_SAFETY_CHECK } from '../../../apps/safety/graphql'
import PrintTunnel from '../../../apps/settings/views/Listings/DevicesListing'
import CreateRecipe from '../../CreateUtils/Recipe/createRecipe'
import CreateIngredient from '../../CreateUtils/Ingredient/CreateIngredient'
import CreateProduct from '../../CreateUtils/Product/createProduct'
import CreateSupplier from '../../CreateUtils/Inventory/createSupplier'
import CreateItem from '../../CreateUtils/Inventory/createItem'
import CreateBrand from '../../CreateUtils/Brand/CreateBrand'
import CreateCoupon from '../../CreateUtils/crm/createCoupon'
import CreateCampaign from '../../CreateUtils/crm/createCampaign'
import CreateCollection from '../../CreateUtils/Menu/createCollection'
import CreateSubscription from '../../CreateUtils/subscription/createSubscriptions'
import { StoreIcon } from '../../assets/icons'
import BrandSelector from './components/BrandSelector'

const APPS = gql`
   subscription apps {
      apps(order_by: { id: asc }) {
         id
         title
         icon
         route
      }
   }
`
export const Sidebar = ({ setOpen }) => {
   const { addTab } = useTabs()
   const location = useLocation()
   const { loading, data: { apps = [] } = {} } = useSubscription(APPS)
   const [isOpen, setIsOpen] = React.useState(null)
   const [isChildOpen, setIsChildOpen] = React.useState(null)
   const [isChildrenOpen, setIsChildrenOpen] = React.useState(null)
   const [isActive, setIsActive] = React.useState(false)
   const sideBarRef = React.useRef()
   console.log('pathname', location.pathname.substring(1))

   const [
      tunnels,
      openTunnel,
      closeTunnel,
   ] = useTunnel(18)

   // Inventory sub-options useMutation
   /* Work order */
   const [createBulkWorkOrder] = useMutation(CREATE_BULK_WORK_ORDER, {
      variables: {
         object: {
            name: `Work Order-${uuid().substring(30)}`,
         },
      },
      onCompleted: data => {
         const { id, name } = data.createBulkWorkOrder.returning[0]
         addTab(name, `/inventory/work-orders/bulk/${id}`)
      },
   })
   const [createSachetWorkOrder] = useMutation(CREATE_SACHET_WORK_ORDER, {
      variables: {
         object: {
            name: `Work Order-${uuid().substring(30)}`,
         },
      },
      onCompleted: data => {
         const { id, name } = data.createSachetWorkOrder.returning[0]
         addTab(name, `/inventory/work-orders/sachet/${id}`)
      },
   })

   // Purchase Order
   const [createPackagingOrder] = useMutation(CREATE_PURCHASE_ORDER, {
      onCompleted: data => {
         const { id } = data.item
         const tabTitle = `Purchase Order-${uuid().substring(30)}`
         addTab(tabTitle, `/inventory/purchase-orders/packaging/${id}`)
      },
   })
   const [createItemPurchaseOrder] = useMutation(CREATE_ITEM_PURCHASE_ORDER, {
      onCompleted: data => {
         const { id } = data.item
         const tabTitle = `Purchase Order-${uuid().substring(30)}`
         addTab(tabTitle, `/inventory/purchase-orders/item/${id}`)
      },
   })

   // Packagings
   const [createPackaging] = useMutation(CREATE_PACKAGING, {
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
      onCompleted: input => {
         const { packagingName, id } = input.createPackaging.returning[0]
         addTab(packagingName, `/inventory/packagings/${id}`)
      },
   })
   const createPackagingHandler = type => {
      const packagingName = `pack-${randomSuffix()}`
      createPackaging({
         variables: {
            object: {
               name: packagingName,
               type,
               packagingSpecification: {
                  data: {
                     compostable: false,
                  },
               },
            },
         },
      })
   }

   // setting APP //
   // user /
   const [createUser] = useMutation(USERS.CREATE, {
      onCompleted: ({ insert_settings_user_one = {} }) => {
         const { id, firstName } = insert_settings_user_one
         addTab(firstName, `/settings/users/${id}`)
      },
      onError: error => {
         toast.success('Failed to create the user!')
         logger(error)
      },
   })
   const addUser = () => {
      const hash = `user${uuid().split('-')[0]}`
      createUser({
         variables: {
            object: {
               firstName: hash,
               tempPassword: hash.slice(4),
            },
         },
      })
   }

   // Stations
   const [createStation] = useMutation(STATIONS.CREATE, {
      onCompleted: ({ insertStation = {} }) => {
         addTab(insertStation.name, `/settings/stations/${insertStation.id}`)
      },
      onError: error => {
         toast.success('Failed to create the station!')
         logger(error)
      },
   })
   const createStationHandler = () => {
      createStation({
         variables: {
            object: {
               name: `stations${uuid().split('-')[0]}`,
            },
         },
      })
   }

   // Safety Check /
   const [createSafetyCheck] = useMutation(CREATE_SAFETY_CHECK, {
      onCompleted: input => {
         addTab('Check', input.insert_safety_safetyCheck.returning[0].id)
         toast.success('Inpayloadated!')
      },
      onError: error => {
         console.log(error)
         toast.error('Some error occurred!')
      },
   })

   useOnClickOutside(sideBarRef, () => {
      setIsOpen(null)
   })
   const pathNameHandle = (pathname) => {
      if (pathname === '/') {
         return 'home'
      }
      return pathname.substring(1)
   }
   const appMenuItems = {
      data: [
         {
            title: 'Home',
            path: '/',
            icon: HomeAppIcon,
            childs: [],
         },
         {
            title: 'Order',
            path: '/order',
            icon: OrderAppIcon,
            childs: [
               // {
               //    title: 'Home',
               //    path: '/order',
               // },
               {
                  title: 'Orders',
                  path: '/order/orders',
               },
               {
                  title: 'Planned',
                  path: '/order/planned',
               },
            ],
         },
         {
            title: 'Product',
            path: '/products',
            icon: ProductsAppIcon,
            childs: [
               {
                  title: 'View Products',
                  path: '/products/products',
                  children: [
                     {
                        title: 'Create a Product',
                        path: '/products/views/Forms/Product',
                        payload: 3,
                     },
                  ],
               },
               {
                  title: 'View Recipes',
                  path: '/products/recipes',
                  children: [
                     {
                        title: 'Create a Recipe',
                        path: '/products/recipes',
                        payload: 1,
                     },
                  ],
               },
               {
                  title: 'View Ingredients',
                  path: '/products/ingredients',
                  children: [
                     {
                        title: 'Add an Ingredient',
                        payload: 2,
                     },
                  ],
               },
            ],
         },
         {
            title: 'Inventory',
            path: '/inventory',
            icon: InventoryAppIcon,
            childs: [
               // {
               //    title: 'Home',
               //    path: '/inventory',

               // },
               {
                  title: 'View Suppliers',
                  path: '/inventory/suppliers',
                  children: [
                     {
                        title: 'Create a Supplier',
                        payload: 5,
                     },
                  ],
               },
               {
                  title: 'View Items',
                  path: '/inventory/items',
                  children: [
                     {
                        title: 'Create an Item',
                        payload: 6,
                     },
                     {
                        title: 'Create a Bulk Item',
                        payload: '',
                     },
                  ],
               },
               {
                  title: 'View Work Orders',
                  path: '/inventory/work-orders',
                  children: [
                     {
                        title: 'Create a Bulk Order',
                        payload: 'Work Order Bulk',
                     },
                     {
                        title: 'Create a Sachet Work Order',
                        payload: 'Work Order Sachet',
                     },
                  ],
               },
               {
                  title: 'View Purchase Orders',
                  path: '/inventory/purchase-orders',
                  children: [
                     {
                        title: 'Create a Purchase Order',
                        payload: 'Purchase Order Purchase',
                     },
                     {
                        title: 'Create a Packaging Order',
                        payload: 'Purchase Order Packaging',
                     },
                  ],
               },
               {
                  title: 'View all Packagings',
                  path: '/inventory/packagings',
                  children: [
                     {
                        title: 'Add Packaging',
                        payload: 'SACHET_PACKAGE',
                     },
                     {
                        title: 'Explore Packaging Hub',
                        payload: 'EXPLORE PACKAGING HUB',
                     },
                  ],
               },
            ],
         },
         {
            title: 'Subscription',
            path: '/subscription',
            icon: SubscriptionAppIcon,
            childs: [
               {
                  title: 'Menu',
                  path: '/subscription/menu',
               },
               {
                  title: 'View Your Subscription Plans',
                  path: '/subscription/subscriptions',
                  children: [
                     {
                        title: 'Create a New Subscription Plan',
                        payload: 14,
                     },
                  ],
               },
               {
                  title: 'View Your Add - On Items',
                  path: '/subscription/addon-menu',
                  children: [
                     {
                        title: 'Create an Add - On',
                        payload: '',
                     },
                  ],
               },
            ],
         },
         {
            title: 'Customers',
            icon: CustomersAppIcon,
            path: '/crm',
            childs: [
               {
                  title: 'View all Customers',
                  path: '/crm/customers',
               },
               {
                  title: 'Coupons',
                  path: '/crm/coupons',
                  children: [
                     {
                        title: 'Create a New Coupon',
                        payload: 15,
                     },
                  ],
               },
               {
                  title: 'Campaign',
                  path: '/crm/campaign',
                  children: [
                     {
                        title: 'Create a New Campaign',
                        payload: 16,
                     },
                  ],
               },
            ],
         },
         {
            title: 'Menu',
            path: '/menu',
            icon: MenuAppIcon,
            childs: [
               // {
               //    title: 'Home',
               //   ,
               // },
               {
                  title: 'Collections',
                  path: '/menu/collections',
                  children: [
                     {
                        title: 'Create a New Collection',
                        payload: 17,
                     },
                  ],
               },
               {
                  title: 'Pre-Order Delivery',
                  path: '/menu/recurrences/PREORDER_DELIVERY',
               },
               {
                  title: 'Pre-Order Pickup',
                  path: '/menu/recurrences/PREORDER_PICKUP',
               },
               {
                  title: 'On-Demand Delivery',
                  path: '/menu/recurrences/ONDEMAND_DELIVERY',
               },
               {
                  title: 'On-Demand Pickup',
                  path: '/menu/recurrences/ONDEMAND_PICKUP',
               },
            ],
         },
         {
            title: 'Brands',
            path: '/brands',
            icon: BrandAppIcon,
            childs: [
               {
                  title: 'Brands',
                  path: '/brands/brands',
                  children: [
                     {
                        title: 'Create a New Brand',
                        payload: 4,
                     },
                  ],
               },
            ],
         },
         {
            title: 'Reports',
            path: '/insights',
            icon: ReportsAppIcon,
            childs: [
               {
                  title: 'Home',
                  path: '/insights',
               },
               {
                  title: 'Recipe Insights',
                  path: '/insights/recipe',
               },
            ],
         },
         {
            title: 'Cart',
            icon: CartsAppIcon,
            path: '/carts',
            childs: [],
         },
         {
            title: 'Settings',
            path: '/settings',
            icon: SettingAppIcon,
            childs: [
               // {
               //    title: 'Home',
               //    path: '/settings',
               // },
               {
                  title: 'View all Users',
                  path: '/settings/users',
                  children: [
                     {
                        title: 'Add a New User',
                        payload: 'user',
                     },
                  ],
               },
               {
                  title: 'View all Roles',
                  path: '/settings/roles',
                  children: [
                     {
                        id: 1,
                        title: 'Assign an Admin',
                        payload: 'Admin',
                     },
                     {
                        id: 2,
                        title: 'Assign Operators',
                        payload: 'Operator',
                     },
                     {
                        id: 3,
                        title: 'Assign Managers',
                        payload: 'Manager',
                     },
                  ],
               },
               {
                  title: 'View all Devices',
                  path: '/settings/devices',
                  children: [
                     {
                        title: 'Connect a Printer',
                        payload: 18,
                     },
                     {
                        title: 'Download Printnode',
                        payload: 'Printnode',
                        linking: 'https://www.printnode.com/en/download',
                     },
                     {
                        title: 'Installation',
                        payload: 'Installation',
                        linking:
                           'https://www.printnode.com/en/docs/installation',
                     },
                     {
                        title: 'Supported Printers',
                        payload: 'Printers',
                        linking:
                           'https://www.printnode.com/en/docs/supported-printers',
                     },
                     {
                        title: 'Supported Scales',
                        payload: 'Scales',
                        linking:
                           'https://www.printnode.com/en/docs/supported-scales',
                     },
                  ],
               },
               {
                  title: 'View Stations',
                  path: '/settings/stations',
                  children: [
                     {
                        title: 'Create a New Station',
                        payload: 'station',
                     },
                  ],
               },
               {
                  title: 'Master Lists',
                  path: '/settings/master-lists',
                  children: [
                     {
                        title: 'Create Units',
                        payload: 7,
                     },
                     {
                        title: 'Create Processings',
                        payload: 8,
                     },
                     {
                        title: 'Create Cuisines',
                        payload: 9,
                     },
                     {
                        title: 'Create Product Categories',
                        payload: 10,
                     },
                     {
                        title: 'Create Ingredient Categories',
                        payload: 11,
                     },
                     {
                        title: 'Create Accompaniments Types',
                        payload: 13,
                     },
                     {
                        title: 'Create Allergens',
                        payload: 12,
                     },
                  ],
               },
               {
                  title: 'Safety Checks',
                  path: '/safety/checks',
                  children: [
                     {
                        title: 'Create a Safety Check',
                        payload: 'Check',
                     },
                  ],
               },
               {
                  title: 'Editor',
                  path: '/editor',
               },
               {
                  title: 'Manage Content',
                  path: '/content',
                  children: [
                     {
                        title: 'View Pages',
                        payload: 7,
                     },
                     {
                        title: 'View Subscription',
                        payload: 8,
                     },
                     {
                        title: 'Edit Navigation Bar',
                        payload: 9,
                     },
                     {
                        title: 'Settings',
                        payload: 10,
                     },
                  ],
               },
               {
                  title: 'Market Place',
                  path: '/settings/marketplace',
               },
            ],
         },
         {
            title: 'View Store',
            icon: StoreAppIcon,
            path: '/viewStore',
            childs: [],
         },
         {
            title: 'Developer',
            icon: DeveloperAppIcon,
            path: '/developer',
            childs: [
               {
                  title: 'Webhook',
                  path: '/developer/webhook',
               },
               {
                  title: 'Api Key',
                  path: '/developer/apiKey',
               },
            ],
         },
      ],
   }
   const [mouseOver, setMouseOver] = React.useState(false)

   return (
      <div>
         <div>
            <Styles.Sidebar ref={sideBarRef} onMouseOver={() => setMouseOver(true)}
               onMouseLeave={() => setMouseOver(false)}>
               <Styles.Close>
                  {/* <IconButton type="ghost" onClick={() => setOpen(false)}>
                     <RoundedCloseIcon />
                  </IconButton> */}
               </Styles.Close>
               {loading ? (
                  <InlineLoader />
               ) : (
                  <>
                     <BrandSelector mouseOver={mouseOver} />
                     {appMenuItems.data.map(app => (
                        <Styles.AppItem key={app.id}>
                           <Styles.Choices
                              type="ghost"
                              size="sm"
                              container
                              alignItems="center"
                              title={app.title}
                              onClick={() => {
                                 setIsOpen(
                                    isOpen === null || isOpen !== app.title
                                       ? app.title
                                       : null
                                 )
                                 setIsChildOpen(null)
                                 setIsActive(app.title)
                              }}
                              active={
                                 pathNameHandle(location.pathname)
                                    .includes(pathNameHandle(app.path)) ||
                                 (isChildOpen === null &&
                                    isOpen === app.title &&
                                    app.title)
                              }
                           >
                              <Styles.IconText>
                                 <Styles.AppIcon>
                                    <app.icon
                                       active={pathNameHandle(location.pathname)
                                          .includes(pathNameHandle(app.path))}
                                    />{' '}
                                 </Styles.AppIcon>
                                 <Styles.AppTitle
                                    onClick={event => {
                                       event.stopPropagation()
                                       setIsActive(app.title)
                                       addTab(app.title, app.path)
                                    }}
                                 >
                                    {app.title}
                                 </Styles.AppTitle>
                              </Styles.IconText>
                              {app.childs.length > 0 &&
                                 (isOpen === app.title ? (
                                    <ArrowUp />
                                 ) : (
                                    <ArrowDown />
                                 ))}
                           </Styles.Choices>

                           <Styles.Pages>
                              {isOpen === app.title &&
                                 app.childs.map(child => (
                                    <Styles.PageBox
                                       active={
                                          isChildOpen === child.title &&
                                          isChildrenOpen === null
                                       }
                                    >
                                       <Styles.Choices
                                          onClick={() => {
                                             setIsChildOpen(
                                                isChildOpen === null ||
                                                   isChildOpen !== child.title
                                                   ? child.title
                                                   : null
                                             )
                                             setIsChildrenOpen(null)
                                          }}
                                          active={
                                             isChildOpen === child.title &&
                                             isChildrenOpen === null
                                          }
                                          key={child.path}
                                          title={child.title}
                                       >
                                          <Styles.PageOneTitle
                                             onClick={() => {
                                                setIsOpen(null)
                                                addTab(child.title, child.path)
                                             }}
                                             active={
                                                isChildOpen === child.title &&
                                                isChildrenOpen === null
                                             }
                                          >
                                             {child.title}
                                          </Styles.PageOneTitle>
                                          {child.children &&
                                             (isChildOpen === child.title ? (
                                                <ArrowUp />
                                             ) : (
                                                <ArrowDown />
                                             ))}
                                       </Styles.Choices>

                                       <Styles.Pages>
                                          {isChildOpen === child.title &&
                                             child.children?.map(children => {
                                                return (
                                                   <Styles.Choices
                                                      onClick={() => {
                                                         setIsChildrenOpen(
                                                            children.title
                                                         )
                                                         setIsOpen(null)
                                                         if (isInteger(children.payload)) {
                                                            return openTunnel(children.payload)
                                                         }
                                                         else {
                                                            switch (
                                                            children.payload
                                                            ) {
                                                               case 'Work Order Bulk':
                                                                  return createBulkWorkOrder()
                                                               case 'Work Order Sachet':
                                                                  return createSachetWorkOrder()
                                                               case 'Purchase Order Packaging':
                                                                  return createPackagingOrder()
                                                               case 'Purchase Order Purchase':
                                                                  return createItemPurchaseOrder()
                                                               case 'SACHET_PACKAGE':
                                                                  return createPackagingHandler(
                                                                     children.payload
                                                                  )
                                                               case 'EXPLORE PACKAGING HUB':
                                                                  return addTab(
                                                                     'Packaging Hub',
                                                                     '/inventory/packaging-hub'
                                                                  )
                                                               case 'station':
                                                                  return createStationHandler()

                                                               case 'user':
                                                                  return addUser()
                                                               case 'Admin':
                                                                  return addTab(
                                                                     children.payload,
                                                                     `/settings/roles/${children.id} `
                                                                  )
                                                               case 'Operator':
                                                                  return addTab(
                                                                     children.payload,
                                                                     `/settings/roles/${children.id} `
                                                                  )
                                                               case 'Manager':
                                                                  return addTab(
                                                                     children.payload,
                                                                     `/settings/roles/${children.id} `
                                                                  )
                                                               case 'Check':
                                                                  return createSafetyCheck()

                                                               default:
                                                                  return <h1>null</h1>
                                                            }
                                                         }

                                                      }}
                                                      active={
                                                         isChildrenOpen ===
                                                         children.title
                                                      }
                                                   >
                                                      {
                                                         <Styles.PageTwoTitle
                                                            active={
                                                               isChildrenOpen ===
                                                               children.title
                                                            }
                                                            title={children.title}
                                                         >
                                                            {children.linking ? (
                                                               <a
                                                                  href={
                                                                     children.linking
                                                                  }
                                                               >
                                                                  {children.title}
                                                               </a>
                                                            ) : (
                                                               children.title
                                                            )}
                                                         </Styles.PageTwoTitle>
                                                      }
                                                   </Styles.Choices>
                                                )
                                             })}
                                       </Styles.Pages>
                                    </Styles.PageBox>
                                 ))}
                           </Styles.Pages>
                        </Styles.AppItem>
                     ))}
                  </>
               )}
            </Styles.Sidebar>
         </div>
         <div>
            <Tunnels tunnels={tunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="Products App">
                     <CreateRecipe closeTunnel={closeTunnel} />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={2} size="md">
                  <TooltipProvider app="Products App">
                     <CreateIngredient
                        closeTunnel={closeTunnel}
                     />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={3}>
                  <TooltipProvider app="Products App">
                     <CreateProduct close={closeTunnel} />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={4} size="md">
                  <TooltipProvider app="Brand App">
                     <CreateBrand closeTunnel={closeTunnel} />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={5} size="md">
                  <TooltipProvider app="Inventory App">
                     <CreateSupplier closeTunnel={closeTunnel} />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={6} size="md">
                  <TooltipProvider app="Inventory App">
                     <CreateItem closeTunnel={closeTunnel} />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={7} size="md">
                  <TooltipProvider app="Settings App">
                     <AddUnitTunnel closeTunnel={closeTunnel} />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={8} size="md">
                  <TooltipProvider app="Settings App">
                     <AddProcessingTunnel
                        closeTunnel={closeTunnel}
                     />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={9} size="md">
                  <TooltipProvider app="Settings App">
                     <AddCuisinesTunnel
                        closeTunnel={closeTunnel}
                     />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={10} size="md">
                  <TooltipProvider app="Settings App">
                     <AddProductCategoriesTunnel
                        closeTunnel={closeTunnel}
                     />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={11} size="md">
                  <TooltipProvider app="Settings App">
                     <AddIngredientCategoriesTunnel
                        closeTunnel={closeTunnel}
                     />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={12} size="md">
                  <TooltipProvider app="Settings App">
                     <AddAllergensTunnel
                        closeTunnel={closeTunnel}
                     />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={13} size="md">
                  <TooltipProvider app="Settings App">
                     <AddAccompanimentTypesTunnel
                        closeTunnel={closeTunnel}
                     />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={14} size="md">
                  <TooltipProvider app="Subscription App">
                     <CreateSubscription
                        closeTunnel={closeTunnel}
                     />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={15} size="md">
                  <TooltipProvider app="CRM App">
                     <CreateCoupon closeTunnel={closeTunnel} />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={16} size="md">
                  <TooltipProvider app="CRM App">
                     <CreateCampaign closeTunnel={closeTunnel} />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={17} size="md">
                  <TooltipProvider app="Menu App">
                     <CreateCollection closeTunnel={closeTunnel} />
                  </TooltipProvider>
               </Tunnel>
               <Tunnel layer={18} size="sm">
                  <PrintTunnel closeTunnel={closeTunnel} />
               </Tunnel>
            </Tunnels>
         </div>
      </div>
   )
}
