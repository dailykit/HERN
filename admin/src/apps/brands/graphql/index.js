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
               created_at
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
   SETTINGS_TYPES: gql`
      subscription brandSettings {
         brandSettings {
            id
            type
            identifier
         }
      }
   `,
   UPDATE_BRAND_SETTING: gql`
      mutation upsertBrandSetting(
         $object: brands_brand_brandSetting_insert_input!
      ) {
         upsertBrandSetting: insert_brands_brand_brandSetting_one(
            object: $object
            on_conflict: {
               constraint: brand_brandSetting_pkey
               update_columns: value
            }
         ) {
            value
         }
      }
   `,

   SETTING: gql`
      subscription brandSettings($brandId: Int!) {
         brands_brand_brandSetting(
            where: {
               _and: {
                  brandId: { _eq: $brandId }
                  brandSetting: { isDynamicForm: { _eq: true } }
               }
            }
         ) {
            brandId
            value
            brandSetting {
               id
               identifier
               type
               isDynamicForm
            }
         }
      }
   `,

   //for seo settings(lazy query)
   SETTINGS: gql`
      query brandSettings(
         $identifier: String_comparison_exp!
         $type: String_comparison_exp!
         $brandId: Int_comparison_exp!
      ) {
         brandSettings(where: { identifier: $identifier, type: $type }) {
            id
            brand: brand_brandSettings(where: { brandId: $brandId }) {
               brandId
               value
            }
            configTemplate
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

export const LOCATIONS = {
   LIST: gql`
      subscription locations {
         brands_location(order_by: { id: asc }) {
            id
            label
            city
            country
            state
            zipcode
            brand_locations_aggregate {
               aggregate {
                  count
               }
            }
         }
      }
   `,
}
