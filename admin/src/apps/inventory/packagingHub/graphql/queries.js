import gql from 'graphql-tag'

export const CATEGORIES = gql`
   query PackagingCompanyBrand {
      packagingHub_packagingType {
         id
         name
         assets
      }
   }
`

export const Category = gql`
   query Category($id: Int!) {
      packagingHub_packagingType_by_pk(id: $id) {
         name
         id
      }
   }
`

export const PACKAGINGS = gql`
   query Packagings(
      $id: Int!
      $length: numeric
      $width: numeric
      $isFDACompliant: Boolean
      $isRecylable: Boolean
      $isCompostable: Boolean
      $isCompressable: Boolean
      $isInnerWaterResistant: Boolean
      $isOuterWaterResistant: Boolean
      $isInnerGreaseResistant: Boolean
      $isOuterGreaseResistant: Boolean
   ) {
      packagingHub_packaging(
         where: {
            packagingTypeId: { _eq: $id }
            length: { _eq: $length }
            width: { _eq: $width }
            packagingSpecification: {
               fdaCompliant: { _eq: $isFDACompliant }
               recyclable: { _eq: $isRecylable }
               compostable: { _eq: $isCompostable }
               compressibility: { _eq: $isCompressable }
               innerWaterResistant: { _eq: $isInnerWaterResistant }
               outerWaterResistant: { _eq: $isOuterWaterResistant }
               innerGreaseResistant: { _eq: $isInnerGreaseResistant }
               outerGreaseResistant: { _eq: $isOuterGreaseResistant }
            }
         }
      ) {
         id
         packagingName
         assets
         height
         length
         width
         thickness
         LWHUnit

         packagingType {
            id
            name
         }
         packagingCompanyBrand {
            id
            name
         }
         thickness
         packagingPurchaseOptions(order_by: { quantity: asc }) {
            id
            quantity
            unit
            salesPrice
         }
      }
   }
`

export const PACKAGING = gql`
   query Packaging($id: Int!) {
      packagingHub_packaging_by_pk(id: $id) {
         id
         packagingName
         assets

         length
         width
         thickness
         loadCapacity
         gusset
         LWHUnit

         packagingDescription {
            id
            shortDescription
            longDescription
         }
         packagingCompanyBrand {
            id
            name
         }
         packagingPurchaseOptions(order_by: { quantity: asc }) {
            id
            quantity
            unit
            salesPrice
         }
         packagingSpecification {
            id
            fdaCompliant
            compostable
            microwaveable
            recyclable
            outerGreaseResistant
            innerGreaseResistant
            innerWaterResistant
            outerWaterResistant
            opacity
            compressibility

            packagingMaterial {
               id
               materials
            }
         }
      }
   }
`

export const ORGANIZATION_PURCHASE_ORDER = gql`
   query OrganizationPurchaseOrder {
      organizationPurchaseOrders_purchaseOrder {
         id
         organizationId
         netChargeAmount
      }
   }
`

export const ORGANIZATION_PAYMENT_INFO = gql`
   query OrganizationPaymentInfo {
      organizationPurchaseOrders_purchaseOrder {
         id
         organizationId
         netChargeAmount
         organization {
            id
            stripeAccountId
         }
      }
   }
`

export const CART_ITEMS = gql`
   query CartItems {
      organizationPurchaseOrders_purchaseOrderItem(
         order_by: { id: asc }
         where: { status: { _eq: "PENDING" } }
      ) {
         id
         packaging {
            id
            packagingName
            packagingCompanyBrand {
               id
               name
            }
            assets
         }

         quantity
         salesPrice
         multiplier
         netChargeAmount
      }
   }
`

export const CART_ITEMS_FOR_REGISTERING = gql`
   query CartItems {
      organizationPurchaseOrders_purchaseOrderItem(
         order_by: { id: asc }
         where: { status: { _eq: "PENDING" } }
      ) {
         id
         packaging {
            id
            packagingName

            length
            width
            height
            gusset
            thickness
            LWHUnit
            loadVolume
            loadCapacity
            assets
            packagingPurchaseOptions(
               order_by: { quantity: asc }
               where: { quantity: { _is_null: false } }
               limit: 1
            ) {
               id
               quantity
            }
            packagingSpecification {
               id
               innerWaterResistant
               outerWaterResistant
               recyclable
               compostable
               fdaCompliant
               innerGreaseResistant
               outerGreaseResistant

               packagingMaterial {
                  id
                  materials
               }
            }
            purchaseOrderItems {
               id
            }
            packagingCompanyBrand {
               id
               packagingCompany {
                  id
                  supplierName: name
               }
            }
         }
         quantity
         multiplier
      }
   }
`

export const PACKAGE_LENGTH_FILTER_OPTIONS = gql`
   query HeightFilters($categoryId: Int!, $width: numeric) {
      packagingHub_packaging_aggregate(
         distinct_on: height
         where: {
            length: { _is_null: false }
            packagingTypeId: { _eq: $categoryId }
            width: { _eq: $width, _is_null: false }
         }
      ) {
         nodes {
            id
            length
            LWHUnit
         }
      }
   }
`
export const PACKAGE_WIDTH_FILTER_OPTIONS = gql`
   query WidthFilters($categoryId: Int!, $length: numeric) {
      packagingHub_packaging_aggregate(
         distinct_on: width
         where: {
            width: { _is_null: false }
            packagingTypeId: { _eq: $categoryId }
            length: { _eq: $length, _is_null: false }
         }
      ) {
         nodes {
            id
            width
            LWHUnit
         }
      }
   }
`
