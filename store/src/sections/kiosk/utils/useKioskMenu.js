import { useQuery, useSubscription } from '@apollo/react-hooks'
import React, { useState } from 'react'
import { PRODUCTS, PRODUCTS_BY_CATEGORY } from '../../../graphql'
import { useConfig } from '../../../lib'

export const useKioskMenu = collectionIds => {
   const { brand, isConfigLoading, kioskDetails, brandLocation } = useConfig()
   const [menuData, setMenuData] = useState({
      categories: [],
      allProductIds: [],
      isMenuLoading: true,
   })
   const [status, setStatus] = useState('loading')
   const [productsList, setProductsList] = useState([])
   const [hydratedMenu, setHydratedMenu] = React.useState([])

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: kioskDetails?.locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, kioskDetails?.locationId, brandLocation?.id]
   )

   const date = React.useMemo(() => new Date(Date.now()).toISOString(), [])
   // get all categories by locationId, brandId and collection(s) provide to kiosk(by config)
   const { error: menuError } = useSubscription(PRODUCTS_BY_CATEGORY, {
      skip: isConfigLoading || !brand?.id,
      variables: {
         params: {
            brandId: brand?.id,
            date,
            ...(collectionIds.length > 0 && {
               collectionIdArray: collectionIds,
            }),
            locationId: kioskDetails?.locationId,
            brand_locationId: brandLocation?.id,
         },
      },
      onSubscriptionData: ({ subscriptionData }) => {
         // console.log('v2Data', data)
         const { data } = subscriptionData
         if (data?.onDemand_getMenuV2copy?.length) {
            const [res] = data.onDemand_getMenuV2copy
            const { menu } = res.data
            const ids = menu.map(category => category.products).flat()
            setMenuData(prev => ({
               ...prev,
               allProductIds: ids,
               categories: menu,
               isMenuLoading: false,
            }))
         }
      },
   })

   React.useEffect(() => {
      if (menuError) {
         setMenuData(prev => ({
            ...prev,
            isMenuLoading: false,
         }))
         setStatus('error')
         console.log(menuError)
      }
   }, [menuError])

   // get all products from productIds getting from PRODUCT_BY_CATEGORY
   const { loading: productsLoading, error: productsError } = useSubscription(
      PRODUCTS,
      {
         skip: menuData.isMenuLoading,
         variables: {
            ids: menuData.allProductIds,
            params: argsForByLocation,
         },
         // fetchPolicy: 'network-only',
         onSubscriptionData: ({ subscriptionData }) => {
            if (
               subscriptionData.data &&
               subscriptionData.data.products.length
            ) {
               setProductsList(subscriptionData.data.products)
               setStatus('success')
            }
         },
         onError: error => {
            setStatus('error')
            console.log('Error: ', error)
         },
      }
   )
   React.useEffect(() => {
      if (productsList.length && menuData.categories.length) {
         const updatedMenu = menuData.categories.map(category => {
            const updatedProducts = category.products
               .map(productId => {
                  const found = productsList.find(({ id }) => id === productId)
                  if (found) {
                     return found
                  }
                  return null
               })
               .filter(Boolean)
            return {
               ...category,
               products: updatedProducts,
            }
         })
         setHydratedMenu(updatedMenu)
      }
   }, [productsList, menuData])
   return { status, hydratedMenu }
}
