import React from 'react'
import gql from 'graphql-tag'
import { Flex, IconButton, RoundedCloseIcon } from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import Styles from './styled'
import { InlineLoader } from '../InlineLoader'
import { ChevronDown, ChevronUp, RectangularIcon } from '../../assets/icons'
import { useTabs } from '../../providers'
import { has } from 'lodash'

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
   const appMenuItems = {
      Orders: [
         {
            title: 'Home',
            path: '/order',
         },
         {
            title: 'Orders',
            path: '/order/orders',
         },
         {
            title: 'Planned',
            path: '/order/planned',
         },
      ],
      'Inventory App': [
         {
            title: 'Home',
            path: '/inventory',
         },
         {
            title: 'Suppliers',
            path: '/inventory/suppliers',
         },
         {
            title: 'Supplier Items',
            path: '/inventory/items',
         },
         {
            title: 'Work Orders',
            path: '/inventory/work-orders',
         },
         {
            title: 'Purchase Orders',
            path: '/inventory/purchase-orders',
         },
         {
            title: 'Packagings',
            path: '/inventory/packagings',
         },
      ],
      'Subscription App': [
         {
            title: 'Home',
            path: '/subscription',
         },
         {
            title: 'Menu',
            path: '/subscription/menu',
         },
         {
            title: 'Add On Menu',
            path: '/subscription/addon-menu',
         },
         {
            title: 'Subscriptions',
            path: '/subscription/subscriptions',
         },
      ],
      'CRM App': [
         {
            title: 'Home',
            path: '/crm',
         },
         {
            title: 'Customers',
            path: '/crm/customers',
         },
         {
            title: 'Coupons',
            path: '/crm/coupons',
         },
         {
            title: 'Campaign',
            path: '/crm/campaign',
         },
      ],
      'Safety App': [
         {
            title: 'Home',
            path: '/safety',
         },
         {
            title: 'Safety Checks',
            path: '/safety/checks',
         },
      ],
      'Settings App': [
         {
            title: 'Home',
            path: '/settings',
         },
         {
            title: 'Users',
            path: '/settings/users',
         },
         {
            title: 'Roles',
            path: '/settings/roles',
         },
         {
            title: 'Devices',
            path: '/settings/devices',
         },
         {
            title: 'Stations',
            path: '/settings/stations',
         },
         {
            title: 'Master Lists',
            path: '/settings/master-lists',
         },
         {
            title: 'Apps',
            path: '/settings/apps',
         },
      ],
      'Brand App': [
         {
            title: 'Home',
            path: '/brands',
         },
         {
            title: 'Brands',
            path: '/brands/brands',
         },
      ],
      'Insights App': [
         {
            title: 'Home',
            path: '/insights',
         },
         {
            title: 'Recipe Insights',
            path: '/insights/recipe',
         },
      ],
      'Products App': [
         {
            title: 'Home',
            path: '/products',
         },
         {
            title: 'Products',
            path: '/products/products',
         },
         {
            title: 'Recipes',
            path: '/products/recipes',
         },
         {
            title: 'Ingredients',
            path: '/products/ingredients',
         },
      ],
      'Menu App': [
         {
            title: 'Home',
            path: '/menu',
         },
         {
            title: 'Collections',
            path: '/menu/collections',
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
      'Editor App': [],
      'Manage Content': [
         {
            title: 'Home',
            path: '/content',
         },
         {
            title: 'Pages',
            path: '/content/pages',
         },
         {
            title: 'Settings',
            path: '/content/settings',
         },
         {
            title: 'Blocks',
            path: '/content/blocks',
         },
      ],
   }
   return (
      <Styles.Sidebar>
         <Styles.Close>
            <IconButton type="ghost" onClick={() => setOpen(false)}>
               <RoundedCloseIcon />
            </IconButton>
         </Styles.Close>
         {loading ? (
            <InlineLoader />
         ) : (
            apps.map(app => (
               <Styles.AppItem key={app.id}>
                  <Flex container alignItems="center">
                     {app.icon ? (
                        <Styles.AppIcon src={app.icon} />
                     ) : (
                        <RectangularIcon />
                     )}
                     <Styles.AppTitle to={app.route}>
                        {app.title}
                     </Styles.AppTitle>

                     {appMenuItems[app.title]?.length > 0 && (
                        <Styles.Arrow
                           type="ghost"
                           size="sm"
                           onClick={() =>
                              setIsOpen(
                                 isOpen === null || isOpen !== app.title
                                    ? app.title
                                    : null
                              )
                           }
                           active={
                              isOpen === app.title &&
                              has(appMenuItems, app.title) &&
                              appMenuItems[app.title].length
                           }
                        >
                           {isOpen === app.title &&
                           has(appMenuItems, app.title) &&
                           appMenuItems[app.title].length ? (
                              <ChevronUp />
                           ) : (
                              <ChevronDown />
                           )}
                        </Styles.Arrow>
                     )}
                  </Flex>
                  <Styles.Pages>
                     {isOpen === app.title &&
                        has(appMenuItems, app.title) &&
                        appMenuItems[app.title]?.map(({ title, path }) => (
                           <Styles.PageItem
                              onClick={() => addTab(title, path)}
                              key={path}
                           >
                              <span>{title}</span>
                           </Styles.PageItem>
                        ))}
                  </Styles.Pages>
               </Styles.AppItem>
            ))
         )}
      </Styles.Sidebar>
   )
}
