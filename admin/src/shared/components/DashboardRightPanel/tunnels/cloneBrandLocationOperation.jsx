import React from 'react'
import {
   Dropdown,
   Flex,
   Spacer,
   Text,
   TextButton,
   TunnelHeader,
} from '@dailykit/ui'
import { BrandContext } from './../../../../App'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import { InlineLoader } from '../../InlineLoader'
import gql from 'graphql-tag'
import options from '../../DashboardTables/tableOptions'
import { isNull } from 'lodash'
import { toast } from 'react-toastify'
import { logger } from '../../../utils'
import { useParams } from 'react-router-dom'
import { Tooltip } from 'antd'

export const CloneBrandLocationOperation = ({ closeTunnel }) => {
   const brandDetail = useParams()

   const [fromLocation, setFromLocation] = React.useState({
      fromBrandLocationId: null,
      fromBrandLocationsList: [],
   })
   const [toLocation, setToLocation] = React.useState({
      toBrandLocationIds: null,
      toBrandLocationsList: [],
   })
   const [clickedButton, setClickedButton] = React.useState(null)

   const { loading: brandLocationLoading, error: brandLocationError } =
      useQuery(BRAND_LOCATION_ID, {
         skip: !brandDetail.brandId,
         variables: {
            where: {
               brandId: {
                  _eq: brandDetail.brandId,
               },
               isActive: {
                  _eq: true,
               },
            },
         },
         fetchPolicy: 'network-only',
         onCompleted: data => {
            if (data) {
               const mapBrandLocation = data.brands_brand_location.map(
                  brandLocation => ({
                     ...brandLocation,
                     title: brandLocation.location.label,
                  })
               )
               setFromLocation(prev => ({
                  ...prev,
                  fromBrandLocationsList: mapBrandLocation,
               }))
            }
         },
      })

   const {
      loading: productProductOptionLoading,
      error: productProductOptionError,
      data: { products_productPrice_brand_location = [] } = {},
   } = useQuery(PRODUCT_PRICE_BRAND_LOCATION, {
      skip: !fromLocation.fromBrandLocationId,
      fetchPolicy: 'network-only',
      variables: {
         where: {
            brand_locationId: {
               _eq: fromLocation.fromBrandLocationId,
            },
         },
      },
   })

   // mutation for clone
   const [upsertMuatation, { loading: upsertLoading, error: upsertError }] =
      useMutation(PRODUCT_PRICE_BRAND_LOCATION_UPSERT, {
         onCompleted: () => {
            const message = clickedButton === 'MERGE' ? 'Merged' : 'Cloned'
            toast.success(`Successfully ${message}!`)
         },
         onError: error => {
            const message = clickedButton === 'MERGE' ? 'Merged' : 'Cloned'
            toast.error(`Failed To ${message}!`)
            logger(error)
            console.error(error)
         },
      })

   const [deleteProductBrandLocation, { loading: deleteLoading }] = useMutation(
      DELETE_PRODUCT_BRAND_LOCATION,
      {
         onCompleted: () => {
            mergeMachine()
         },
         onError: error => {
            toast.error('Failed to clone!')
            logger(error)
            console.error(error)
         },
      }
   )
   // insert or upsert row
   const mergeMachine = async () => {
      try {
         if (products_productPrice_brand_location.length == 0) {
            throw 'No products found for this brand location'
         }
         const clonedProductLocationsData = []
         const clonedProductOptionLocationsData = []
         toLocation.toBrandLocationIds.forEach(toBrandLocationId => {
            products_productPrice_brand_location.forEach(
               productPriceBrandLocation => {
                  const clonedLocationData = {
                     ...productPriceBrandLocation,
                     brand_locationId: toBrandLocationId,
                  }
                  delete clonedLocationData.__typename
                  delete clonedLocationData.id
                  if (isNull(productPriceBrandLocation.productId)) {
                     clonedProductOptionLocationsData.push(clonedLocationData)
                  } else {
                     clonedProductLocationsData.push(clonedLocationData)
                  }
               }
            )
         })
         await upsertMuatation({
            variables: {
               objects: clonedProductLocationsData,
               constraint:
                  'productPrice_brand_location_brand_locationId_productId_key',
               update_columns: [
                  'addedByApiKey',
                  'brandId',
                  'brandMenuCategoryId',
                  'isAvailable',
                  'isPublished',
                  'locationId',
                  'markupOnStandardPriceInPercentage',
                  'modifierCategoryOptionId',
                  'productOptionId',
                  'specificDiscount',
                  'specificPrice',
                  'updatedByApiKey',
               ],
            },
         })
         await upsertMuatation({
            variables: {
               objects: clonedProductOptionLocationsData,
               constraint:
                  'productPrice_brand_location_brand_locationId_productOptionId_ke',
               update_columns: [
                  'addedByApiKey',
                  'brandId',
                  'brandMenuCategoryId',
                  'isAvailable',
                  'isPublished',
                  'locationId',
                  'markupOnStandardPriceInPercentage',
                  'modifierCategoryOptionId',
                  'productId',
                  'specificDiscount',
                  'specificPrice',
                  'updatedByApiKey',
               ],
            },
         })
         closeTunnel()
      } catch (error) {
         console.log('error', error)
         toast.error(error)
         logger(error)
      }
   }

   const cloneMachine = () => {
      if (products_productPrice_brand_location.length === 0) {
         toast.error('No products found for this brand location')
      } else {
         deleteProductBrandLocation({
            variables: {
               where: {
                  brand_locationId: {
                     _in: toLocation.toBrandLocationIds,
                  },
               },
            },
         })
      }
   }
   return (
      <>
         <TunnelHeader
            title="Clone Product And Product Option Data"
            close={() => closeTunnel()}
            nextAction="Done"
         />
         <Flex margin="20px">
            <Text as={'text2'}>Brand: {brandDetail.brandName}</Text>
         </Flex>
         <Flex margin="20px">
            <>
               <Flex container>
                  <Flex width="50%">
                     <Text as="text1">From Location:</Text>
                     <Spacer size="8px" />
                     {brandLocationLoading ? (
                        <InlineLoader />
                     ) : brandLocationError ? (
                        <span>Something went wrong</span>
                     ) : fromLocation.fromBrandLocationsList.length === 0 ? (
                        <Text as="text1">No Location Available</Text>
                     ) : (
                        <Dropdown
                           type="single"
                           options={fromLocation.fromBrandLocationsList}
                           searchedOption={option => console.log(option)}
                           selectedOption={op => {
                              setFromLocation(prev => ({
                                 ...prev,
                                 fromBrandLocationId: op.id,
                              }))
                              const newToLocations =
                                 fromLocation.fromBrandLocationsList.filter(
                                    brandLoc => brandLoc.id !== op.id
                                 )
                              setToLocation(prev => ({
                                 ...prev,
                                 toBrandLocationsList: newToLocations,
                              }))
                           }}
                           placeholder="Select From Location...."
                        />
                     )}
                  </Flex>
                  <Spacer size="20px" xAxis />

                  {products_productPrice_brand_location.length > 0 && (
                     <Flex width="50%">
                        <Text as="text1">To Locations</Text>
                        <Spacer size="8px" />
                        {toLocation.toBrandLocationsList.length === 0 ? (
                           <Text as="text1">No Location Available</Text>
                        ) : (
                           <Dropdown
                              type="multiple"
                              options={toLocation.toBrandLocationsList}
                              searchedOption={option => console.log(option)}
                              selectedOption={ops => {
                                 setToLocation(prev => ({
                                    ...prev,
                                    toBrandLocationIds: ops.map(
                                       brandLoc => brandLoc.id
                                    ),
                                 }))
                              }}
                              placeholder="Select To Locations...."
                           />
                        )}
                     </Flex>
                  )}
               </Flex>
            </>
         </Flex>

         {fromLocation.fromBrandLocationId &&
            !productProductOptionLoading &&
            products_productPrice_brand_location.length === 0 && (
               <Flex margin="0 20px">
                  <Text as="helpText">
                     No products found for this brand location
                  </Text>
               </Flex>
            )}
         <footer
            style={{
               position: 'absolute',
               bottom: '20px',
               marginInline: '20px',
               right: '0',
               display: 'flex',
            }}
         >
            <Tooltip
               placement="top"
               title={
                  'This action will replace existing entry or create an new entry for product and product option.'
               }
            >
               <TextButton
                  type="solid"
                  disabled={
                     !toLocation.toBrandLocationIds ||
                     products_productPrice_brand_location.length === 0 ||
                     Boolean(toLocation.toBrandLocationIds?.length == 0) ||
                     upsertLoading
                  }
                  onClick={() => {
                     const openConfirmModal = () => {
                        const confirmText = prompt(
                           `This action will replace existing entry or create an new entry for product and product option. Enter 'CONFIRM' to confirm`
                        )
                        if (confirmText === null) {
                           return
                        } else if (confirmText === 'CONFIRM') {
                           setClickedButton('MERGE')
                           cloneMachine()
                        } else {
                           openConfirmModal()
                        }
                     }
                     openConfirmModal()
                  }}
                  isLoading={upsertLoading && clickedButton === 'MERGE'}
               >
                  Merge
               </TextButton>
            </Tooltip>
            <Spacer size="10px" xAxis />
            <Tooltip
               placement="top"
               title={`This action will delete all existing data from these brand locations and then make clone.`}
            >
               <TextButton
                  type="solid"
                  disabled={
                     !toLocation.toBrandLocationIds ||
                     products_productPrice_brand_location.length === 0 ||
                     Boolean(toLocation.toBrandLocationIds?.length == 0) ||
                     upsertLoading ||
                     deleteLoading
                  }
                  onClick={() => {
                     const openConfirmModal = () => {
                        const confirmText = prompt(
                           `This action will replace existing entry or create an new entry for product and product option. Enter 'CONFIRM' to confirm`
                        )
                        if (confirmText === null) {
                           return
                        } else if (confirmText === 'CONFIRM') {
                           setClickedButton('CLONE')
                           cloneMachine()
                        } else {
                           openConfirmModal()
                        }
                     }
                     openConfirmModal()
                  }}
                  isLoading={
                     (upsertLoading || deleteLoading) &&
                     clickedButton === 'CLONE'
                  }
               >
                  Clone
               </TextButton>
            </Tooltip>
         </footer>
      </>
   )
}
const BRAND_ID = gql`
   subscription brandId {
      brandsAggregate(
         order_by: { id: asc }
         where: { isArchived: { _eq: false } }
      ) {
         nodes {
            title
            id
         }
      }
   }
`
const BRAND_LOCATION_ID = gql`
   query BRAND_LOCATION_ID($where: brands_brand_location_bool_exp!) {
      brands_brand_location(where: $where) {
         id
         location {
            id
            label
         }
      }
   }
`
const PRODUCT_PRICE_BRAND_LOCATION = gql`
   query PRODUCT_PRICE_BRAND_LOCATION(
      $where: products_productPrice_brand_location_bool_exp!
   ) {
      products_productPrice_brand_location(where: $where) {
         brand_locationId
         addedByApiKey
         brandId
         brandMenuCategoryId
         id
         isAvailable
         isPublished
         locationId
         markupOnStandardPriceInPercentage
         modifierCategoryOptionId
         productId
         productOptionId
         specificDiscount
         specificPrice
         updatedByApiKey
      }
   }
`
export const PRODUCT_PRICE_BRAND_LOCATION_UPSERT = gql`
   mutation brandManager(
      $objects: [products_productPrice_brand_location_insert_input!]!
      $constraint: products_productPrice_brand_location_constraint!
      $update_columns: [products_productPrice_brand_location_update_column!]!
   ) {
      insert_products_productPrice_brand_location(
         objects: $objects
         on_conflict: {
            constraint: $constraint
            update_columns: $update_columns
         }
      ) {
         affected_rows
      }
   }
`
const DELETE_PRODUCT_BRAND_LOCATION = gql`
   mutation DELETE_PRODUCT_BRAND_LOCATION(
      $where: products_productPrice_brand_location_bool_exp!
   ) {
      delete_products_productPrice_brand_location(where: $where) {
         affected_rows
      }
   }
`
