import gql from 'graphql-tag'

export const BRANDS = {
   AGGREGATE: gql`
      subscription brands {
         brandsAggregate(where: { isArchived: { _eq: false } }) {
            aggregate {
               count
            }
         }
      }
   `,
   LIST: gql`
      subscription brands {
         brands: brandsAggregate(where: { isArchived: { _eq: false } }) {
            aggregate {
               count(columns: id)
            }
            nodes {
               id
               domain
               title
               isDefault
               isPublished
            }
         }
      }
   `,
   BRAND: gql`
      subscription brand($id: Int!) {
         brand(id: $id) {
            id
            domain
            title
            isDefault
            isPublished
            parseurMailBoxId
         }
      }
   `,
   CREATE_BRAND: gql`
      mutation createBrand($object: brands_brand_insert_input!) {
         createBrand(object: $object) {
            id
         }
      }
   `,
   CREATE_BRANDS: gql`
      mutation createBrands($objects: [brands_brand_insert_input!]!) {
         createBrands(objects: $objects) {
            returning {
               id
               domain
            }
            affected_rows
         }
      }
   `,
   UPDATE_BRAND: gql`
      mutation updateBrand($id: Int!, $_set: brands_brand_set_input!) {
         updateBrand(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
   ON_DEMAND_SETTINGS_TYPES: gql`
      subscription storeSettings {
         storeSettings {
            id
            type
            identifier
         }
      }
   `,
   SUBSCRIPTION_SETTINGS_TYPES: gql`
      subscription subscriptionSettings {
         subscriptionSettings: brands_subscriptionStoreSetting {
            id
            type
            identifier
         }
      }
   `,
   UPDATE_ONDEMAND_SETTING: gql`
      mutation upsertBrandOnDemandSetting(
         $object: brands_brand_storeSetting_insert_input!
      ) {
         upsertBrandOnDemandSetting: insert_brands_brand_storeSetting_one(
            object: $object
            on_conflict: {
               constraint: shop_storeSetting_pkey
               update_columns: value
            }
         ) {
            value
         }
      }
   `,
   UPDATE_SUBSCRIPTION_SETTING: gql`
      mutation upsertBrandSubscriptionSetting(
         $object: brands_brand_subscriptionStoreSetting_insert_input!
      ) {
         upsertBrandSubscriptionSetting: insert_brands_brand_subscriptionStoreSetting_one(
            object: $object
            on_conflict: {
               constraint: brand_subscriptionStoreSetting_pkey
               update_columns: value
            }
         ) {
            value
         }
      }
   `,
   ONDEMAND_SETTING: gql`
      subscription storeSettings(
         $identifier: String_comparison_exp!
         $type: String_comparison_exp!
      ) {
         storeSettings(where: { identifier: $identifier, type: $type }) {
            id
            brand {
               brandId
               value
            }
         }
      }
   `,
   SUBSCRIPTION_SETTING: gql`
      subscription subscriptionSetting(
         $identifier: String_comparison_exp!
         $type: String_comparison_exp!
      ) {
         subscriptionSetting: brands_subscriptionStoreSetting(
            where: { type: $type, identifier: $identifier }
         ) {
            id
            brand {
               brandId
               value
            }
         }
      }
   `,
   UPSERT_BRAND_COLLECTION: gql`
      mutation upsertBrandCollection(
         $object: onDemand_brand_collection_insert_input!
      ) {
         upsertBrandCollection: createBrandCollection(
            object: $object
            on_conflict: {
               constraint: shop_collection_pkey
               update_columns: isActive
            }
         ) {
            isActive
         }
      }
   `,
   UPSERT_BRAND_TITLE: gql`
      mutation upsertBrandTitle(
         $object: subscription_brand_subscriptionTitle_insert_input!
      ) {
         upsertBrandTitle: insert_subscription_brand_subscriptionTitle_one(
            object: $object
            on_conflict: {
               constraint: shop_subscriptionTitle_pkey
               update_columns: isActive
            }
         ) {
            isActive
         }
      }
   `,
}

export const COLLECTIONS = {
   LIST: gql`
      subscription collections($brandId: Int_comparison_exp!) {
         collections: collectionsAggregate {
            aggregate {
               count(columns: id)
            }
            nodes {
               id
               name
               details {
                  productsCount
                  categoriesCount
               }
               totalBrands: brands_aggregate {
                  aggregate {
                     count(columns: brandId)
                  }
               }
               brands(where: { brandId: $brandId }) {
                  isActive
               }
            }
         }
      }
   `,
}

export const PLANS = {
   LIST: gql`
      subscription titles($brandId: Int_comparison_exp!) {
         titles: subscription_subscriptionTitle_aggregate {
            aggregate {
               count
            }
            nodes {
               id
               title
               totalBrands: brands_aggregate {
                  aggregate {
                     count(columns: brandId)
                  }
               }
               brands(where: { brandId: $brandId }) {
                  isActive
               }
            }
         }
      }
   `,
}
