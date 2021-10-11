import React, { Children } from 'react'
import gql from 'graphql-tag'
import { Flex, IconButton, RoundedCloseIcon, Tunnel, Tunnels, useTunnel } from '@dailykit/ui'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import Styles from './styled'
import { InlineLoader } from '../InlineLoader'
import { TooltipProvider, useTabs } from '../../providers'
import { has } from 'lodash'
import {
   BrandAppIcon, CustomersAppIcon, HomeAppIcon, InventoryAppIcon, MenuAppIcon,
   OrderAppIcon, ProductsAppIcon, ReportsAppIcon, SettingAppIcon, StoreAppIcon,
   SubscriptionAppIcon, CartsAppIcon
} from '../../assets/navBarIcons'
import { CREATE_INGREDIENT, CREATE_SIMPLE_RECIPE, PRODUCTS } from '../../../apps/products/graphql'
import { toast } from 'react-toastify'
import { logger, randomSuffix } from '../../utils'
import { CREATE_BULK_WORK_ORDER, CREATE_ITEM, CREATE_ITEM_PURCHASE_ORDER, CREATE_PACKAGING, CREATE_PURCHASE_ORDER, CREATE_SACHET_WORK_ORDER, CREATE_SUPPLIER } from '../../../apps/inventory/graphql'
import { GENERAL_ERROR_MESSAGE } from '../../../apps/inventory/constants/errorMessages'
import { v4 as uuid } from 'uuid'
import { UPSERT_SUBSCRIPTION_TITLE } from '../../../apps/subscription/graphql'
import { CREATE_COUPON } from '../../../apps/crm/graphql'
import { STATIONS, USERS } from '../../../apps/settings/graphql'
import { CREATE_COLLECTION } from '../../../apps/menu/graphql'
import CreateBrandTunnel from '../../../apps/brands/views/Listings/brands/CreateBrandTunnel'
import { ProductTypeTunnel } from '../../../apps/products/views/Listings/ProductsListing/tunnels'
import AddUnitTunnel from '../../../apps/settings/views/Forms/MasterList/Units/tunnels/AddTypes'
import AddProcessingTunnel from '../../../apps/settings/views/Forms/MasterList/Processings/tunnels/AddTypes'
import AddCuisinesTunnel from '../../../apps/settings/views/Forms/MasterList/Cuisine/tunnels/AddTypes'
import AddProductCategoriesTunnel from '../../../apps/settings/views/Forms/MasterList/ProductCategories/tunnels/Add'
import AddIngredientCategoriesTunnel from '../../../apps/settings/views/Forms/MasterList/IngredientCategories/tunnels/Add'
import AddAllergensTunnel from '../../../apps/settings/views/Forms/MasterList/Allergens/tunnels/AddTypes'
import AddAccompanimentTypesTunnel from '../../../apps/settings/views/Forms/MasterList/AccompanimentTypes/tunnels/AddTypes'
import { CREATE_SAFETY_CHECK } from '../../../apps/safety/graphql'
import CampaignTypeTunnel from '../../../apps/crm/views/Listings/CampaignListing/Tunnel'
import PrintTunnel from '../../../apps/settings/views/Listings/DevicesListing'

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
   const { loading, data: { apps = [] } = {} } = useSubscription(APPS)
   const [isOpen, setIsOpen] = React.useState(null)
   const [isChildOpen, setIsChildOpen] = React.useState(null)
   const [isChildrenOpen, setIsChildrenOpen] = React.useState(null)
   const [isActive, setIsActive] = React.useState(false)

   const [createRecipe] = useMutation(CREATE_SIMPLE_RECIPE, {
      onCompleted: input => {
         addTab(
            input.createSimpleRecipe.returning[0].name,
            `/products/recipes/${input.createSimpleRecipe.returning[0].id}`
         )
         toast.success('Recipe added!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [createIngredient] = useMutation(CREATE_INGREDIENT, {
      onCompleted: data => {
         toast.success('Ingredient created!')
         addTab(
            data.createIngredient.returning[0].name,
            `/products/ingredients/${data.createIngredient.returning[0].id}`
         )
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const createIngredientHandler = async () => {
      const name = `ingredient-${randomSuffix()}`
      createIngredient({ variables: { name } })
   }
   const createRecipeHandler = () => {
      const name = `recipe-${randomSuffix()}`
      createRecipe({ variables: { objects: { name } } })
   }
   const [
      createProductTunnels,
      openCreateProductTunnel,
      closeCreateProductTunnel,
   ] = useTunnel(1)
   // Inventory sub-options useMutation
   // Supplier
   const [createSupplier] = useMutation(CREATE_SUPPLIER, {
      onCompleted: input => {
         const supplierData = input.createSupplier.returning[0]
         toast.success('Supplier Added!')
         addTab(supplierData.name, `/inventory/suppliers/${supplierData.id}`)
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
   })
   const createSupplierHandler = () => {
      const name = `supplier-${randomSuffix()}`
      createSupplier({
         variables: {
            object: {
               name,
            },
         },
      })
   }
   /* Item */
   const [createItem] = useMutation(CREATE_ITEM, {
      onCompleted: input => {
         const itemData = input.createSupplierItem.returning[0]
         addTab(itemData.name, `/inventory/items/${itemData.id}`)
         toast.success('Supplier Item Added!')
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
   })
   const createItemHandler = () => {
      const name = `item-${randomSuffix()}`
      createItem({
         variables: {
            object: {
               name,
            },
         },
      })
   }
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
   const [createPackagingOrder] = useMutation(
      CREATE_PURCHASE_ORDER,
      {
         onCompleted: data => {
            const { id } = data.item
            const tabTitle = `Purchase Order-${uuid().substring(30)}`
            addTab(tabTitle, `/inventory/purchase-orders/packaging/${id}`)
         },
      }
   )
   const [createItemPurchaseOrder] = useMutation(
      CREATE_ITEM_PURCHASE_ORDER,
      {
         onCompleted: data => {
            const { id } = data.item
            const tabTitle = `Purchase Order-${uuid().substring(30)}`
            addTab(tabTitle, `/inventory/purchase-orders/item/${id}`)
         },
      }
   )
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
   // Subscription APP
   // subscription
   const [upsertTitle] = useMutation(UPSERT_SUBSCRIPTION_TITLE, {
      onCompleted: ({ upsertSubscriptionTitle = {} }) => {
         const { id, title } = upsertSubscriptionTitle
         addTab(title, `/subscription/subscriptions/${id}`)
         toast.success('Sucessfully created a subscription!')
      },
      onError: error => {
         toast.error('Failed to create a subscription!')
         logger(error)
      },
   })
   const createTab = () => {
      const hash = `form-${uuid().split('-')[0]}`
      upsertTitle({
         variables: {
            object: {
               title: hash,
            },
         },
      })
   }
   // Customer APP
   // Coupons
   const [createCoupon] = useMutation(CREATE_COUPON, {
      variables: {
         object: {
            code: `coupon-${randomSuffix()}`,
            visibilityCondition: {
               data: {},
            },
         },
      },
      onCompleted: data => {
         addTab(data.createCoupon.code, `/crm/coupons/${data.createCoupon.id}`)
         toast.success('Coupon created!')
      },
      onError: error => {
         toast.error('Something went wrong !')
         logger(error)
      },
   })
   // Campaign
   const [createCampaigntunnels, openCampaignTunnel, closeCampaignTunnel] = useTunnel(1)


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
   //Master List/
   //unit
   const [
      createUnitTunnels,
      openCreateUnitTunnel,
      closeCreateUnitTunnel,
   ] = useTunnel(1)
   //processing
   const [
      createProcessingTunnels,
      openCreateProcessingTunnel,
      closeCreateProcessingTunnel,
   ] = useTunnel(1)
   //Cuisines
   const [
      createCuisinesTunnels,
      openCreateCuisinesTunnel,
      closeCreateCuisinesTunnel,
   ] = useTunnel(1)
   //ProductCategories
   const [
      createProductCategoriesTunnels,
      openCreateProductCategoriesTunnel,
      closeCreateProductCategoriesTunnel,
   ] = useTunnel(1)
   //IngredientCategories
   const [
      createIngredientCategoriesTunnels,
      openCreateIngredientCategoriesTunnel,
      closeCreateIngredientCategoriesTunnel,
   ] = useTunnel(1)
   //Allergens
   const [
      createAllergensTunnels,
      openCreateAllergensTunnel,
      closeCreateAllergensTunnel,
   ] = useTunnel(1)
   //AccompanimentTypes
   const [
      createAccompanimentTypesTunnels,
      openCreateAccompanimentTypesTunnel,
      closeCreateAccompanimentTypesTunnel,
   ] = useTunnel(1)
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
   // Devices in settings
   // print
   const [createPrintTunnels, openPrintTunnel, closePrintTunnel] = useTunnel(1)

   // Menu App
   // Collections
   const [createCollection] = useMutation(CREATE_COLLECTION, {
      variables: {
         object: {
            name: `collection-${randomSuffix()}`,
         },
      },
      onCompleted: data => {
         addTab(
            data.createCollection.name,
            `/menu/collections/${data.createCollection.id}`
         )
         toast.success('Collection created!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Brand App 
   // Brand
   const [
      createBrandTunnels,
      openCreateBrandTunnel,
      closeCreateBrandTunnel,
   ] = useTunnel(1)

   const appMenuItems = {
      "data": [
         {
            title: "Home",
            path: '/',
            icon: HomeAppIcon,
            'childs': []
         },
         {
            title: "Order",
            path: '/order',
            icon: OrderAppIcon,
            'childs': [
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
            title: "Product",
            path: '/products',
            icon: ProductsAppIcon,
            'childs': [
               {
                  title: 'View Products',
                  path: '/products/products',
                  children: [
                     {
                        title: 'Create a Product',
                        path: '/products/views/Forms/Product',
                        payload: 'product'
                     },
                     // {
                     //    title: 'Create Combo Product',
                     //    path: '/products/recipes',
                     //    payload: 'combo'
                     // },
                     // {
                     //    title: 'Create Customizable Product',
                     //    path: '/products/recipes',
                     //    payload: 'customizable'
                     // },
                  ]
               },
               {
                  title: 'View Recipes',
                  path: '/products/recipes',
                  children: [
                     {
                        title: 'Create a Recipe',
                        path: '/products/recipes',
                        payload: 'recipe'
                     },
                  ]
               },
               {
                  title: 'View Ingredients',
                  path: '/products/ingredients',
                  children: [
                     {
                        title: 'Add an Ingredient',
                        payload: 'ingredient'
                     },
                  ]
               },
            ],
         },
         {
            title: "Inventory",
            path: '/inventory',
            icon: InventoryAppIcon,
            'childs': [
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
                        payload: 'supplier'
                     }
                  ]
               },
               {
                  title: 'View Items',
                  path: '/inventory/items',
                  children: [
                     {
                        title: 'Create an Item',
                        payload: 'item'
                     },
                     {
                        title: 'Create a Bulk Item',
                        payload: ''
                     },
                  ]
               },
               {
                  title: 'View Work Orders',
                  path: '/inventory/work-orders',
                  children: [
                     {
                        title: 'Create a Bulk Order',
                        payload: 'Work Order Bulk'
                     },
                     {
                        title: 'Create a Sachet Work Order',
                        payload: 'Work Order Sachet'
                     },
                  ]
               },
               {
                  title: 'View Purchase Orders',
                  path: '/inventory/purchase-orders',
                  children: [
                     {
                        title: 'Create a Purchase Order',
                        payload: 'Purchase Order Purchase'
                     },
                     {
                        title: 'Create a Packaging Order',
                        payload: 'Purchase Order Packaging'
                     },
                  ]
               },
               {
                  title: 'View all Packagings',
                  path: '/inventory/packagings',
                  children: [
                     {
                        title: 'Add Packaging',
                        payload: 'SACHET_PACKAGE'
                     },
                     {
                        title: 'Explore Packaging Hub',
                        payload: 'EXPLORE PACKAGING HUB'
                     },
                  ]
               },
            ],
         },
         {
            title: "Subscription",
            path: '/subscription',
            icon: SubscriptionAppIcon,
            'childs': [
               {
                  title: 'Menu',
                  path: '/subscription/menu',
               },
               {
                  title: 'View Your Add - On Items',
                  path: '/subscription/addon-menu',
                  children: [
                     {
                        title: 'Create an Add - On',
                        payload: ''
                     },
                  ]
               },
               {
                  title: 'View Your Subscription Plans',
                  path: '/subscription/subscriptions',
                  children: [
                     {
                        title: 'Create a New Subscription Plan',
                        payload: 'Subscription'
                     },
                  ]
               },
            ],
         },
         {
            title: "Customers",
            icon: CustomersAppIcon,
            path: '/crm',
            'childs': [
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
                        payload: 'coupon'
                     },
                  ]
               },
               {
                  title: 'Campaign',
                  path: '/crm/campaign',
                  children: [
                     {
                        title: 'Create a New Campaign',
                        payload: 'Campaign'
                     },
                  ]
               },
            ],
         },
         {
            title: "Menu",
            path: '/menu',
            icon: MenuAppIcon,
            'childs': [
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
                        payload: 'collection'
                     },
                  ]
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
               }
            ],
         },
         {
            title: 'Brands',
            path: '/brands',
            icon: BrandAppIcon,
            'childs': [
               // {
               //    title: 'Home',
               //    path: '/brands',
               // },
               {
                  title: 'Brands',
                  path: '/brands/brands',
                  children: [
                     {
                        title: 'Create a New Brand',
                        payload: 'brand'
                     },
                  ]
               },
            ],
         },
         {
            title: "Reports",
            path: '/insights',
            icon: ReportsAppIcon,
            'childs': [
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
            title: "Cart",
            icon: CartsAppIcon,
            path: '/carts',
            'childs': []
         },
         {
            title: "Settings",
            path: '/settings',
            icon: SettingAppIcon,
            'childs': [
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
                        payload: 'user'
                     },
                  ]
               },
               {
                  title: 'View all Roles',
                  path: '/settings/roles',
                  children: [
                     {
                        id: 1,
                        title: 'Assign an Admin',
                        payload: 'Admin'
                     },
                     {
                        id: 2,
                        title: 'Assign Operators',
                        payload: 'Operator'
                     },
                     {
                        id: 3,
                        title: 'Assign Managers',
                        payload: 'Manager'
                     },
                  ]
               },
               {
                  title: 'View all Devices',
                  path: '/settings/devices',
                  children: [
                     {
                        title: 'Connect a Printer',
                        payload: 'Print'
                     },
                     {
                        title: 'Download Printnode',
                        payload: 'Printnode',
                        linking: "https://www.printnode.com/en/download"
                     },
                     {
                        title: 'Installation',
                        payload: 'Installation',
                        linking: "https://www.printnode.com/en/docs/installation"
                     },
                     {
                        title: 'Supported Printers',
                        payload: 'Printers',
                        linking: "https://www.printnode.com/en/docs/supported-printers"
                     },
                     {
                        title: 'Supported Scales',
                        payload: 'Scales',
                        linking: "https://www.printnode.com/en/docs/supported-scales"
                     },
                  ]
               },
               {
                  title: 'View Stations',
                  path: '/settings/stations',
                  children: [
                     {
                        title: 'Create a New Station',
                        payload: 'station'
                     },
                  ]
               },
               {
                  title: 'Master Lists',
                  path: '/settings/master-lists',
                  children: [
                     {
                        title: 'Create Units',
                        payload: 'units'
                     },
                     {
                        title: 'Create Processings',
                        payload: 'processing'
                     },
                     {
                        title: 'Create Cuisines',
                        payload: 'Cuisines'
                     },
                     {
                        title: 'Create Product Categories',
                        payload: 'ProductCategories'
                     },
                     {
                        title: 'Create Ingredient Categories',
                        payload: 'IngredientCategories'
                     },
                     {
                        title: 'Create Accompaniments Types',
                        payload: 'AccompanimentTypes'
                     },
                     {
                        title: 'Create Allergens',
                        payload: 'Allergens'
                     },
                  ]
               },
               {
                  title: 'Safety Checks',
                  path: '/safety/checks',
                  children: [
                     {
                        title: 'Create a Safety Check',
                        payload: 'Check'
                     },
                  ]
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
                        payload: 'units'
                     },
                     {
                        title: 'View Subscription',
                        payload: 'processing'
                     },
                     {
                        title: 'Edit Navigation Bar',
                        payload: 'Cuisines'
                     },
                     {
                        title: 'Settings',
                        payload: 'ProductCategories'
                     }
                  ]
               },
               // {
               //    title: 'Apps',
               //    path: '/settings/apps',
               // },
            ],
         },
         {
            title: "View Store",
            icon: StoreAppIcon,
            path: './',
            'childs': []
         },
      ]
   }

   return (
      <div>
         <div>
            <Styles.Sidebar>
               <Styles.Close>
                  <IconButton type="ghost" onClick={() => setOpen(false)}>
                     <RoundedCloseIcon />
                  </IconButton>
               </Styles.Close>
               {loading ? (
                  <InlineLoader />
               ) : (
                  appMenuItems.data.map(app => (
                     <Styles.AppItem key={app.id}>
                        <Styles.Choices
                           type="ghost"
                           size="sm"
                           container alignItems="center"
                           onClick={() => {
                              setIsOpen(
                                 isOpen === null || isOpen !== app.title
                                    ? app.title
                                    : null
                              )
                              setIsChildOpen(null)
                              setIsActive(app.title)
                           }
                           }

                           active={isChildOpen === null &&
                              isOpen === app.title &&
                              app.title
                           }
                        >
                           <Styles.AppIcon><app.icon active={isActive === app.title} /> </Styles.AppIcon>
                           <Styles.AppTitle onClick={() => addTab(app.title, app.path)}>
                              {app.title}
                           </Styles.AppTitle>
                        </Styles.Choices>

                        <Styles.Pages>
                           {isOpen === app.title &&
                              app.childs.map((child) => (
                                 <Styles.PageBox
                                    active={isChildOpen === child.title && isChildrenOpen === null}
                                 >
                                    <Styles.Choices
                                       onClick={() => {
                                          setIsChildOpen(child.title)
                                          setIsChildrenOpen(null)
                                       }}
                                       active={isChildOpen === child.title && isChildrenOpen === null}
                                       key={child.path}
                                    >
                                       <Styles.PageOneTitle
                                          onClick={() => {
                                             setIsChildrenOpen(null)
                                             setIsOpen(null)
                                             addTab(child.title, child.path)
                                          }}
                                          active={(isChildOpen === child.title
                                             && isChildrenOpen === null)}
                                       >
                                          {child.title}</Styles.PageOneTitle>
                                    </Styles.Choices>

                                    <Styles.Pages>
                                       {isChildOpen === child.title && child.children?.map((children) => {
                                          return (
                                             <Styles.Choices
                                                onClick={() => {
                                                   setIsChildrenOpen(children.title)
                                                   setIsOpen(null)
                                                   switch (children.payload) {
                                                      // case 'simple': return handleCreateProduct(children.payload);
                                                      // case 'combo': return handleCreateProduct(children.payload);
                                                      // case 'customizable': return handleCreateProduct(children.payload);
                                                      case 'product': return openCreateProductTunnel(3);
                                                      case 'recipe': return createRecipe();
                                                      case 'ingredient': return createIngredientHandler();
                                                      case 'supplier': return createSupplierHandler();
                                                      case 'item': return createItemHandler();
                                                      case 'Work Order Bulk': return createBulkWorkOrder();
                                                      case 'Work Order Sachet': return createSachetWorkOrder();
                                                      case 'Purchase Order Packaging': return createPackagingOrder();
                                                      case 'Purchase Order Purchase': return createItemPurchaseOrder();
                                                      case 'SACHET_PACKAGE': return createPackagingHandler(children.payload);
                                                      case 'EXPLORE PACKAGING HUB': return addTab('Packaging Hub', '/inventory/packaging-hub');
                                                      case 'Subscription': return createTab();
                                                      case 'coupon': return createCoupon();
                                                      case 'Campaign': return openCampaignTunnel(1);
                                                      case 'collection': return createCollection();
                                                      case 'station': return createStationHandler();
                                                      case 'brand': return openCreateBrandTunnel(1);
                                                      case 'user': return addUser();
                                                      case 'Admin': return addTab(children.payload, `/settings/roles/${children.id} `);
                                                      case 'Operator': return addTab(children.payload, `/settings/roles/${children.id} `);
                                                      case 'Manager': return addTab(children.payload, `/settings/roles/${children.id} `);
                                                      case 'units': return openCreateUnitTunnel(1);
                                                      case 'processing': return openCreateProcessingTunnel(1);
                                                      case 'Cuisines': return openCreateCuisinesTunnel(1);
                                                      case 'ProductCategories': return openCreateProductCategoriesTunnel(1);
                                                      case 'IngredientCategories': return openCreateIngredientCategoriesTunnel(1);
                                                      case 'AccompanimentTypes': return openCreateAccompanimentTypesTunnel(1);
                                                      case 'Allergens': return openCreateAllergensTunnel(1);
                                                      case 'Check': return createSafetyCheck();
                                                      case 'Print': return openPrintTunnel(1);

                                                      default: return <h1>null</h1>
                                                   }
                                                }}
                                                active={
                                                   isChildrenOpen === children.title
                                                }>
                                                {
                                                   <Styles.PageTwoTitle active={isChildrenOpen === children.title}>
                                                      {children.linking ? <a href={children.linking}>{children.title}</a> : children.title}</Styles.PageTwoTitle>
                                                }

                                             </Styles.Choices>
                                          )
                                       })}
                                    </Styles.Pages>
                                 </Styles.PageBox >
                              ))}
                        </Styles.Pages>
                     </Styles.AppItem>
                  ))
               )}
            </Styles.Sidebar>
         </div>
         <div>
            <Tunnels tunnels={createProductTunnels}>
               <Tunnel layer={1}></Tunnel>
               <Tunnel layer={2}></Tunnel>
               <Tunnel layer={3}>
                  <TooltipProvider app="Products App">
                     <ProductTypeTunnel close={closeCreateProductTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createBrandTunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="Brand App">
                     <CreateBrandTunnel closeTunnel={closeCreateBrandTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createUnitTunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="Settings App">
                     <AddUnitTunnel closeTunnel={closeCreateUnitTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createProcessingTunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="Settings App">
                     <AddProcessingTunnel closeTunnel={closeCreateProcessingTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createCuisinesTunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="Settings App">
                     <AddCuisinesTunnel closeTunnel={closeCreateCuisinesTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createProductCategoriesTunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="Settings App">
                     <AddProductCategoriesTunnel closeTunnel={closeCreateProductCategoriesTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createIngredientCategoriesTunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="Settings App">
                     <AddIngredientCategoriesTunnel closeTunnel={closeCreateIngredientCategoriesTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createAllergensTunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="Settings App">
                     <AddAllergensTunnel closeTunnel={closeCreateAllergensTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createAccompanimentTypesTunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="Settings App">
                     <AddAccompanimentTypesTunnel closeTunnel={closeCreateAccompanimentTypesTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createCampaigntunnels}>
               <Tunnel layer={1} size="md">
                  <TooltipProvider app="CRM App">
                     <CampaignTypeTunnel close={closeCampaignTunnel} />
                  </TooltipProvider>
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={createPrintTunnels}>
               <Tunnel layer={1} size="sm">
                  <PrintTunnel closeTunnel={closePrintTunnel} />
               </Tunnel>
            </Tunnels>
         </div>
      </div>)
}
