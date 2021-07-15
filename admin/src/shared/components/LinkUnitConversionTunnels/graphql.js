import gql from 'graphql-tag'

export const UNIT_CONVERSIONS = {
   LIST: gql`
      subscription UnitConversions {
         unitConversions {
            id
            inputUnitName
            outputUnitName
            conversionFactor
         }
      }
   `,
   CREATE: gql`
      mutation CreateUnitConversions(
         $objects: [master_unitConversion_insert_input!]!
      ) {
         createUnitConversion(objects: $objects) {
            affected_rows
         }
      }
   `,
   SUPPLIER_ITEMS: {
      CREATE: gql`
         mutation UpsertSupplierItemUnitConversion(
            $objects: [inventory_supplierItem_unitConversion_insert_input!]!
         ) {
            insert_inventory_supplierItem_unitConversion(
               objects: $objects
               on_conflict: {
                  constraint: supplierItem_unitConversion_pkey
                  update_columns: []
               }
            ) {
               returning {
                  id
               }
            }
         }
      `,
   },
   BULK_ITEMS: {
      CREATE: gql`
         mutation UpsertBulkItemUnitConversion(
            $objects: [inventory_bulkItem_unitConversion_insert_input!]!
         ) {
            insert_inventory_bulkItem_unitConversion(
               objects: $objects
               on_conflict: {
                  constraint: bulkItem_unitConversion_pkey
                  update_columns: []
               }
            ) {
               returning {
                  id
               }
            }
         }
      `,
   },
   SACHET_ITEMS: {
      CREATE: gql`
         mutation UpsertSachetItemUnitConversion(
            $objects: [inventory_sachetItem_unitConversion_insert_input!]!
         ) {
            insert_inventory_sachetItem_unitConversion(
               objects: $objects
               on_conflict: {
                  constraint: sachetItem_unitConversion_pkey
                  update_columns: []
               }
            ) {
               returning {
                  id
               }
            }
         }
      `,
   },
}

export const UNITS = {
   LIST: gql`
      subscription Units {
         units {
            id
            name
            title: name
            isStandard
         }
      }
   `,
}
