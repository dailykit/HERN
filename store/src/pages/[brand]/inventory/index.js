import React from 'react'
import tw, { styled } from 'twin.macro'
import { useRouter } from 'next/router'
import { useLazyQuery } from '@apollo/react-hooks'
import { useToasts } from 'react-toast-notifications'

import { getSettings, isClient } from '../../../utils'
import {
   INVENTORY_DETAILS,
   NAVIGATION_MENU,
   WEBSITE_PAGE,
} from '../../../graphql'
import { Loader, Layout, SEO } from '../../../components'
import { graphQLClient } from '../../../lib'

const Inventory = props => {
   const router = useRouter()
   const { addToast } = useToasts()
   const { settings, navigationMenus } = props
   const [inventory, setInventory] = React.useState(null)

   const [getInventory, { loading }] = useLazyQuery(INVENTORY_DETAILS, {
      onCompleted: ({ inventoryProduct }) => {
         setInventory(inventoryProduct)
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })
   React.useEffect(() => {
      let inventoryId = Number(router.query.id)
      let optionId = Number(router.query.option)
      getInventory({
         variables: {
            id: inventoryId,
            args: {
               optionId: optionId,
            },
         },
      })
   }, [router.query, getInventory])

   if (loading)
      return (
         <Layout settings={settings} navigationMenus={navigationMenus}>
            <SEO title="Loading" />
            <Loader inline />
         </Layout>
      )
   if (!inventory)
      return (
         <Layout settings={settings} navigationMenus={navigationMenus}>
            <SEO title="Not found" />
            <h1 tw="py-4 text-2xl text-gray-600 text-center">
               No such inventory exists!
            </h1>
         </Layout>
      )
   return (
      <Layout settings={settings} navigationMenus={navigationMenus}>
         <SEO
            title={inventory?.cartItem?.name}
            richresult={inventory.richresult}
         />
         <InventoryContainer>
            <h1 tw="py-4 text-2xl md:text-3xl tracking-wide text-teal-900">
               {inventory?.cartItem?.name}
            </h1>
            <InventoryImage>
               {inventory?.cartItem.image ? (
                  <img
                     src={inventory?.cartItem.image}
                     alt={inventory?.cartItem.name}
                     tw="w-full h-full border-gray-100 object-cover rounded-lg"
                  />
               ) : (
                  'N/A'
               )}
            </InventoryImage>
         </InventoryContainer>
         <Button onClick={() => isClient && window.history.go(-1)}>
            Go back to menu
         </Button>
      </Layout>
   )
}

export async function getStaticProps(ctx) {
   const params = ctx.params
   const client = await graphQLClient()
   const dataByRoute = await client.request(WEBSITE_PAGE, {
      domain: params.brand,
      route: '/inventory',
   })
   //navigation menu
   const navigationMenu = await client.request(NAVIGATION_MENU, {
      navigationMenuId:
         dataByRoute.website_websitePage[0]['website']['navigationMenuId'],
   })

   // const domain =
   //    process.env.NODE_ENV === 'production'
   //       ? params.domain
   //       : 'test.dailykit.org'
   const domain = 'test.dailykit.org'
   const { seo, settings } = await getSettings(domain, '/inventory')
   const navigationMenus = navigationMenu.website_navigationMenuItem
   return {
      props: {
         seo,
         settings,
         navigationMenus,
      },
      revalidate: 1,
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
export default Inventory

const InventoryContainer = styled.div`
   margin: auto;
   max-width: 640px;
   padding: 16px 0;
   width: calc(100vw - 40px);
   min-height: calc(100vh - 128px);
`

const InventoryImage = styled.div`
   height: 320px;
   @media (max-width: 567px) {
      height: 240px;
   }
`

const Button = styled.button`
   left: 50%;
   bottom: 16px;
   ${tw`fixed bg-green-600 rounded text-white px-4 h-10 hover:bg-green-700`}
`
