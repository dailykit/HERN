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
   const [hydratedMenu, setHydratedMenu] = React.useState([])

   const argsForByLocation = React.useMemo(
      () => ({
         params: {
            brandId: brand?.id,
            locationId: kioskDetails?.locationId,
            brand_locationId: brandLocation?.id,
         },
      }),
      [brand, kioskDetails?.locationId, brandLocation?.id]
   )

   const date = React.useMemo(() => new Date(Date.now()).toISOString(), [])
   // get all categories by locationId, brandId and collection(s) provide to kiosk(by config)
   const { error: menuError } = useQuery(PRODUCTS_BY_CATEGORY, {
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
      onCompleted: data => {
         // console.log('v2Data', data)
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
      onError: error => {
         setMenuData(prev => ({
            ...prev,
            isMenuLoading: false,
         }))
         setStatus('error')
         console.log(error)
      },
   })

   // get all products from productIds getting from PRODUCT_BY_CATEGORY
   const { loading: productsLoading, error: productsError } = useQuery(
      PRODUCTS,
      {
         skip: menuData.isMenuLoading,
         variables: {
            ids: menuData.allProductIds,
            priceArgs: argsForByLocation,
            discountArgs: argsForByLocation,
            defaultCartItemArgs: argsForByLocation,
            productAvailabilityArgs: argsForByLocation,
            productPublishArgs: argsForByLocation,
            productOptionPriceArgs: argsForByLocation,
            productOptionDiscountArgs: argsForByLocation,
            productOptionAvailabilityArgs: argsForByLocation,
            productOptionPublishArgs: argsForByLocation,
            productOptionCartItemArgs: argsForByLocation,
            modifierCategoryOptionPriceArgs: argsForByLocation,
            modifierCategoryOptionDiscountArgs: argsForByLocation,
            modifierCategoryOptionCartItemArgs: argsForByLocation,
         },
         // fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data && data.products.length && hydratedMenu.length === 0) {
               const updatedMenu = menuData.categories.map(category => {
                  const updatedProducts = category.products
                     .map(productId => {
                        const found = data.products.find(
                           ({ id }) => id === productId
                        )
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
               setStatus('success')
               setHydratedMenu(updatedMenu)
            }
         },
         onError: error => {
            setStatus('error')
            console.log('Error: ', error)
         },
      }
   )

   return { status, hydratedMenu }
}
