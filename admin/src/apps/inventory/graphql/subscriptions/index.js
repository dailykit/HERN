import gql from 'graphql-tag'

export const SUPPLIER_ITEMS_SUBSCRIPTION = gql`
   subscription SupplierItems {
      supplierItems {
         id
         name
         bulkItemAsShippedId
         supplier {
            id
            name
            contactPerson
         }
         bulkItems {
            id
            processingName
            awaiting
            onHand
            committed
            parLevel
            maxLevel
            bulkDensity
            yield
            shelfLife
            isAvailable
            labor
            unit
         }
      }
   }
`

export const PURCHASE_ORDERS_PACKAGING_SUBSCRIPTION = gql`
   subscription Packagings {
      packagings {
         id
         name

         supplier {
            id
         }
      }
   }
`

export const BULK_ITEM = gql`
   subscription BulkItem($id: Int!) {
      bulkItem(id: $id) {
         id
         name: processingName
         awaiting
         onHand
         committed
         parLevel
         maxLevel
         nutritionInfo
         allergens
         isAvailable
         shelfLife
         unit
         image
         labor
         yield
         consumed
         bulkDensity
         sachetItems {
            id
            onHand
            awaiting
            consumed
            unit
            unitSize
            parLevel
            committed
         }
      }
   }
`

export const SUPPLIER_ITEM_SUBSCRIPTION = gql`
   subscription SupplierItem($id: Int!) {
      supplierItem(id: $id) {
         id
         name
         bulkItemAsShippedId
         bulkItemAsShipped {
            id
            name: processingName
            awaiting
            onHand
            committed
            parLevel
            maxLevel
            isAvailable
            shelfLife
            unit
            yield
            consumed
            nutritionInfo
            allergens
            image
            labor
            bulkDensity
            bulkItemUnitConversions {
               id
               unitConversion {
                  id
                  inputUnitName
                  outputUnitName
                  conversionFactor
               }
            }
            sachetItems {
               id
               onHand
               awaiting
               consumed
               unit
               unitSize
               parLevel
               committed
               maxLevel
            }
         }
         unit
         unitSize
         prices
         sku

         leadTime
         supplier {
            id
            name
            contactPerson
         }
         bulkItems {
            id
            name: processingName
            awaiting
            onHand
            committed
            parLevel
            maxLevel
            nutritionInfo
            allergens
            isAvailable
            shelfLife
            unit
            image
            labor
            yield
            consumed
            bulkDensity
            bulkItemUnitConversions {
               id
               unitConversion {
                  id
                  inputUnitName
                  outputUnitName
                  conversionFactor
               }
            }
            sachetItems {
               id
               onHand
               awaiting
               consumed
               unit
               unitSize
               parLevel
               committed
               maxLevel
            }
         }
      }
   }
`

export const BULK_WORK_ORDERS_SUBSCRIPTION = gql`
   subscription BulkWorkOrders {
      bulkWorkOrders {
         id
         status
         name
         scheduledOn
         station {
            id
            name
         }
         user {
            id
            firstName
            lastName
         }
      }
   }
`

export const SACHET_WORK_ORDERS_SUBSCRIPTION = gql`
   subscription SachetWorkOrders {
      sachetWorkOrders {
         id
         status
         scheduledOn
         station {
            id
            name
         }
         user {
            id
            firstName
            lastName
         }
      }
   }
`

export const PURCHASE_ORDERS_SUBSCRIPTION = gql`
   subscription PurchaseOrderItems($type: String!) {
      purchaseOrderItems(where: { type: { _eq: $type } }) {
         id
         type
         created_at
         orderQuantity
         unit
         supplierItem {
            id
            name
         }
         status
         packaging {
            id
            name
         }
      }
   }
`

export const SUPPLIER_SUBSCRIPTION = gql`
   subscription Supplier($id: Int!) {
      supplier(id: $id) {
         id
         name
         logo
         contactPerson
         available
         address
         paymentTerms
         shippingTerms
      }
   }
`

export const SUPPLIERS_SUBSCRIPTION = gql`
   subscription Suppliers {
      suppliers(where: { available: { _eq: true } }) {
         id
         name
         contactPerson
         available
      }
   }
`
export const ALL_SUPPLIERS_SUBSCRIPTION = gql`
   subscription AllSuppliers {
      suppliers {
         id
         name
         available
         contactPerson
      }
   }
`

export const PACKAGING_SUBSCRIPTION = gql`
   subscription Packaging($id: Int!) {
      packaging(id: $id) {
         id
         packagingName: name
         packagingSku

         images: assets(path: "images")

         supplier {
            id
            name
            contactPerson
         }

         leadTime
         minOrderValue
         unitPrice
         caseQuantity
         unitQuantity

         length
         width
         height
         LWHUnit

         parLevel
         maxLevel
         onHand
         awaiting
         committed
         consumed
      }
   }
`

export const PACKAGINGS_LIST_SUBSCRIPTION = gql`
   subscription Packagings {
      packagings {
         id
         name
      }
   }
`

export const ALL_AVAILABLE_SUPPLIERS_COUNT_SUBSCRIPTION = gql`
   subscription Suppliers {
      suppliersAggregate(where: { available: { _eq: true } }) {
         aggregate {
            count
         }
      }
   }
`

export const SUPPLIERS_COUNT_SUBSCRIPTION = gql`
   subscription Suppliers {
      suppliersAggregate {
         aggregate {
            count
         }
      }
   }
`
export const SUPPLIER_ITEMS_COUNT_SUBSCRIPTION = gql`
   subscription SupplierItems {
      supplierItemsAggregate {
         aggregate {
            count
         }
      }
   }
`
export const BULK_WORK_ORDERS_COUNT_SUBSCRIPTION = gql`
   subscription BulkWorkOrders {
      bulkWorkOrdersAggregate {
         aggregate {
            count
         }
      }
   }
`
export const SACHET_WORK_ORDERS_COUNT_SUBSCRIPTION = gql`
   subscription SachetWorkOrders {
      sachetWorkOrdersAggregate {
         aggregate {
            count
         }
      }
   }
`

export const PURCHASE_ORDERS_COUNT_SUBSCRIPTION = gql`
   subscription PurchaseOrders {
      purchaseOrderItemsAggregate {
         aggregate {
            count
         }
      }
   }
`

export const PACKAGINGS_COUNT_SUBSCRIPTION = gql`
   subscription Packagings {
      packagingAggregate {
         aggregate {
            count
         }
      }
   }
`
export const UNITS_SUBSCRIPTION = gql`
   subscription Units {
      units {
         id
         title: name
      }
   }
`

export const MASTER_PROCESSINGS_SUBSCRIPTION = gql`
   subscription MasterProcessings($supplierItemId: Int!) {
      masterProcessingsAggregate(
         where: {
            _not: { bulkItems: { supplierItemId: { _eq: $supplierItemId } } }
         }
      ) {
         nodes {
            id
            title: name
            description
         }
      }
   }
`
export const MASTER_ALLERGENS_SUBSCRIPTION = gql`
   subscription {
      masterAllergens {
         id
         title: name
         description
      }
   }
`

export const SETTINGS_USERS_SUBSCRIPTION = gql`
   subscription {
      settings_user {
         lastName
         firstName
         id
      }
   }
`

export const STATIONS_SUBSCRIPTION = gql`
   subscription {
      stations {
         id
         name
         bulkWorkOrders {
            id
         }
      }
   }
`

export const SACHET_ITEMS_SUBSCRIPTION = gql`
   subscription SachetItems($bulkItemId: Int!) {
      sachetItems(where: { bulkItemId: { _eq: $bulkItemId } }) {
         id
         parLevel
         unitSize
         unit
         onHand
         committed
         consumed
      }
   }
`

export const BULK_WORK_ORDER_SUBSCRIPTION = gql`
   subscription BulkWorkOrder($id: Int!, $from: String!) {
      bulkWorkOrder(id: $id) {
         id
         status
         isPublished
         station {
            name
            id
         }
         user {
            id
            lastName
            firstName
         }
         scheduledOn
         outputYield
         outputBulkItem {
            id
            yield
            processingName
            onHand
            unit
            shelfLife
            bulkItemUnitConversions {
               id
               unitConversion {
                  id
                  inputUnitName
                  outputUnitName
               }
            }
            unit_conversions(
               args: {
                  from_unit: $from
                  to_unit: ""
                  quantity: 1
                  from_unit_bulk_density: -1
                  to_unit_bulk_density: -1
               }
            ) {
               id
               data
            }
         }
         supplierItem {
            id
            name
         }
         outputQuantity
         inputBulkItem {
            id
            processingName
            onHand
            unit
            shelfLife
            unit_conversions(
               args: {
                  from_unit: $from
                  to_unit: ""
                  quantity: 1
                  from_unit_bulk_density: -1
                  to_unit_bulk_density: -1
               }
            ) {
               id
               data
            }
         }
      }
   }
`

export const SACHET_WORK_ORDER_SUBSCRIPTION = gql`
   subscription SachetWorkOrder($id: Int!) {
      sachetWorkOrder(id: $id) {
         id
         status
         isPublished
         station {
            name
            id
         }
         user {
            id
            lastName
            firstName
         }
         scheduledOn
         outputQuantity
         outputSachetItem {
            id
            onHand
            parLevel
            unitSize
            unit
         }

         supplierItem {
            id
            name
         }

         packaging {
            id
            name
         }
         label

         bulkItem {
            id
            processingName
            onHand
            unit
            shelfLife
            supplierItem {
               id
               name
            }
         }
      }
   }
`

export const PURCHASE_ORDER_SUBSCRIPTION = gql`
   subscription PurchaseOrderItem($id: Int!) {
      purchaseOrderItem(id: $id) {
         id
         supplierItem {
            id
            name
            bulkItemAsShipped {
               id
               unit
               bulkItemUnitConversions {
                  id
                  unitConversion {
                     id
                     inputUnitName
                     outputUnitName
                  }
               }
            }
         }
         status
         orderQuantity
         unit
      }
   }
`

export const PACKAGING_PURCHASE_ORDER_SUBSCRIPTION = gql`
   subscription PurchaseOrderItem($id: Int!) {
      purchaseOrderItem(id: $id) {
         id
         packaging {
            id
            packagingName: name
            onHand
         }
         status
         orderQuantity
         unit
      }
   }
`

export const PACKAGINGS_LISTINGS_SUBSCRIPTION = gql`
   subscription PackagingsListings {
      packagings {
         id
         packagingName: name
         supplier {
            id
            name
         }

         type

         parLevel
         onHand
         maxLevel
         awaiting
         committed
      }
   }
`

export const PACKAGING_SPECS_SUBSCRIPTION = gql`
   subscription Packaging($id: Int!) {
      packaging(id: $id) {
         id
         packagingSpecification {
            id
            fdaCompliant
            innerWaterResistant
            outerWaterResistant
            innerGreaseResistant
            outerGreaseResistant
            compostable
            recyclable
            microwaveable
            recycled
            opacity
            compressibility
            packagingMaterial
         }
      }
   }
`

export const GET_BULK_ITEMS_SUBSCRIPTION = gql`
   subscription GetBulkItems($supplierItemId: Int!) {
      bulkItems(where: { supplierItemId: { _eq: $supplierItemId } }) {
         id
         processingName
         shelfLife
         onHand
         unit
      }
   }
`
export const NUTRITION_INFO = gql`
   subscription NutriInfo($id: Int!) {
      bulkItem(id: $id) {
         nutritionInfo
         allergens
      }
   }
`

export const SUPPLIER_ITEMS_LISTINGS_BULK = gql`
   subscription SupplierItems {
      bulkItems {
         id
         processingName
         awaiting
         onHand
         committed
         parLevel
         maxLevel

         supplierItem {
            id
            name

            supplier {
               id
               name
            }
         }
      }
   }
`

export const SUPPLIER_ITEM_LISTINGS = gql`
   subscription SupplierItemsListings {
      supplierItems {
         id
         name
         supplier {
            id
            name
         }
         bulkItems_aggregate {
            aggregate {
               count
            }
         }
      }
   }
`
export const BULK_ITEM_HISTORIES = gql`
   subscription BulkItemHistories($bulkItemId: Int!) {
      bulkItemHistories(where: { bulkItemId: { _eq: $bulkItemId } }) {
         id
         unit
         status
         bulkWorkOrder {
            id
            scheduledOn
            outputBulkItem {
               id
               processingName
            }
            outputQuantity
         }
      }
   }
`

export const SACHET_ITEM_HISTORIES = gql`
   subscription SachetItemHistories($sachetId: Int!) {
      sachetItemHistories(where: { sachetItemId: { _eq: $sachetId } }) {
         id
         sachetWorkOrder {
            id
            scheduledOn
            outputQuantity
            bulkItem {
               id
               processingName
            }
         }
         status
      }
   }
`

export const BULK_ITEM_UNIT_CONVERSIONS = gql`
   subscription BulkItemUnitConversions($id: Int!) {
      bulkItem(id: $id) {
         bulkItemUnitConversions {
            id
            unitConversion {
               id
               inputUnitName
               outputUnitName
               conversionFactor
            }
         }
      }
   }
`

export const SACHET_ITEM_UNIT_CONVERSIONS = gql`
   subscription SachetItemUnitConversions($id: Int!) {
      sachetItem(id: $id) {
         sachetItemUnitConversions {
            id
            unitConversion {
               id
               inputUnitName
               outputUnitName
               conversionFactor
            }
         }
      }
   }
`
