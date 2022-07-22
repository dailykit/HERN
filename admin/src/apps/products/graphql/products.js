import gql from 'graphql-tag'

export const PRODUCTS = {
   COUNT: gql`
      subscription ProductsCount {
         productsAggregate(where: { isArchived: { _eq: false } }) {
            aggregate {
               count
            }
         }
      }
   `,
   CREATE: gql`
      mutation CreateProduct($object: products_product_insert_input!) {
         createProduct(object: $object) {
            id
            name
         }
      }
   `,
   CREATE_PRODUCTS: gql`
      mutation CreateProducts($objects: [products_product_insert_input!]!) {
         createProducts(objects: $objects) {
            affected_rows
            returning {
               id
               name
            }
         }
      }
   `,
   DELETE: gql`
      mutation UpdateProduct($id: Int!) {
         updateProduct(pk_columns: { id: $id }, _set: { isArchived: true }) {
            id
         }
      }
   `,
   LIST: gql`
      subscription Products($where: products_product_bool_exp) {
         products(where: $where) {
            id
            name
            title: name
            isPublished
            price
            relatedProductIds
            convertToMealProductId
         }
      }
   `,
}

export const PRODUCT = {
   UPDATE: gql`
      mutation UpdateProduct($id: Int!, $_set: products_product_set_input) {
         updateProduct(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
   VIEW: gql`
      subscription Product($id: Int!) {
         product(id: $id) {
            id
            name
            type
            assets
            tags
            additionalText
            description
            price
            discount
            isPopupAllowed
            isValid
            isPublished
            isAvailable
            posist_baseItemId
            defaultProductOptionId
            subCategory
            VegNonVegType
            productOptions(
               where: { isArchived: { _eq: false } }
               order_by: { position: desc_nulls_last }
            ) {
               id
               position
               type
               label
               price
               isPublished
               isAvailable
               discount
               quantity
               posist_baseItemId
               simpleRecipeYield {
                  id
                  yield
                  simpleRecipe {
                     id
                     name
                  }
               }
               inventoryProductBundle {
                  id
                  label
               }
               modifier {
                  id
                  name
               }
               additionalModifiers {
                  productOptionId
                  modifierId
                  label
                  type
                  modifier {
                     name
                  }
               }
               operationConfig {
                  id
                  name
               }
            }
            customizableProductComponents(
               where: { isArchived: { _eq: false } }
               order_by: { position: desc_nulls_last }
            ) {
               id
               options
               selectedOptions {
                  productOption {
                     id
                     label
                     quantity
                  }
                  price
                  discount
               }
               linkedProduct {
                  id
                  name
                  type
                  assets
               }
            }
            comboProductComponents(
               where: { isArchived: { _eq: false } }
               order_by: { position: desc_nulls_last }
            ) {
               id
               label
               options
               selectedOptions {
                  productOption {
                     id
                     label
                     quantity
                  }
                  price
                  discount
               }
               linkedProduct {
                  id
                  name
                  type
                  assets
               }
            }
         }
      }
   `,
   //SEO SETTINGS
   UPDATE_PRODUCT_SETTING: gql`
      mutation upsertProductSetting(
         $object: [products_product_productSetting_insert_input!]!
      ) {
         upsertProductSetting: insert_products_product_productSetting(
            objects: $object
            on_conflict: {
               constraint: product_productSetting_pkey
               update_columns: value
            }
         ) {
            returning {
               value
            }
         }
      }
   `,
   //for seo settings(lazy query)
   PRODUCT_PAGE_SETTINGS: gql`
      query productSettings(
         $identifier: String_comparison_exp!
         $type: String_comparison_exp!
         $productId: Int_comparison_exp!
         $brandId: Int_comparison_exp!
      ) {
         products_productSetting(
            where: { identifier: $identifier, type: $type }
         ) {
            id
            product: product_productSettings(
               where: { productId: $productId, brandId: $brandId }
            ) {
               productId
               value
            }
         }
      }
   `,

   //product setting
   SETTING: gql`
      subscription productSettings($productId: Int!, $brandId: Int!) {
         products_product_productSetting(
            where: {
               _and: {
                  productId: { _eq: $productId }
                  productSetting: { isDynamicForm: { _eq: true } }
                  brandId: { _eq: $brandId }
               }
            }
         ) {
            productId
            value
            productSetting {
               id
               identifier
               type
               isDynamicForm
            }
         }
      }
   `,
   UPDATE_PRODUCT_SETTING: gql`
      mutation upsertProductSetting(
         $object: products_product_productSetting_insert_input!
      ) {
         upsertProductSetting: insert_products_product_productSetting_one(
            object: $object
            on_conflict: {
               constraint: product_productSetting_pkey
               update_columns: value
            }
         ) {
            value
         }
      }
   `,
}

export const PRODUCT_OPTION = {
   CREATE: gql`
      mutation CreateProductOption(
         $object: products_productOption_insert_input!
      ) {
         createProductOption(object: $object) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation UpdateProductOption($id: Int!) {
         updateProductOption(
            pk_columns: { id: $id }
            _set: { isArchived: true }
         ) {
            id
         }
      }
   `,
   LIST_QUERY: gql`
      query ProductOptions($where: products_productOption_bool_exp) {
         productOptions(where: $where) {
            id
            label
            price
            discount
            product {
               id
               name
               assets
            }
         }
      }
   `,
   LIST: gql`
      subscription ProductOptions($where: products_productOption_bool_exp) {
         productOptions(where: $where) {
            id
            label
            price
            discount
            product {
               id
               name
            }
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateProductOption(
         $id: Int!
         $_set: products_productOption_set_input
      ) {
         updateProductOption(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
}

export const CUSTOMIZABLE_PRODUCT_COMPONENT = {
   CREATE: gql`
      mutation CreateCustomizableProductComponent(
         $object: products_customizableProductComponent_insert_input!
      ) {
         createCustomizableProductComponent(object: $object) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation UpdateCustomizableProductComponent($id: Int!) {
         updateCustomizableProductComponent(
            pk_columns: { id: $id }
            _set: { isArchived: true }
         ) {
            id
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateCustomizableProductComponent(
         $id: Int!
         $_set: products_customizableProductComponent_set_input
      ) {
         updateCustomizableProductComponent(
            pk_columns: { id: $id }
            _set: $_set
         ) {
            id
         }
      }
   `,
}

export const COMBO_PRODUCT_COMPONENT = {
   CREATE: gql`
      mutation CreateComboProductComponent(
         $objects: [products_comboProductComponent_insert_input!]!
      ) {
         createComboProductComponents(objects: $objects) {
            returning {
               id
            }
         }
      }
   `,
   DELETE: gql`
      mutation UpdateComboProductComponent($id: Int!) {
         updateComboProductComponent(
            pk_columns: { id: $id }
            _set: { isArchived: true }
         ) {
            id
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateComboProductComponent(
         $id: Int!
         $_set: products_comboProductComponent_set_input
      ) {
         updateComboProductComponent(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
}

export const PRODUCT_OPTION_TYPES = {
   LIST: gql`
      subscription ProductOptionTypes {
         productOptionTypes {
            id: title
            title
            orderMode
         }
      }
   `,
}
export const ADDITIONAL_MODIFIER = {
   CREATE: gql`
      mutation creteAdditionalModifier(
         $object: products_productOption_modifier_insert_input!
      ) {
         insert_products_productOption_modifier_one(object: $object) {
            modifierId
            productOptionId
         }
      }
   `,
   VIEW: gql`
      subscription MySubscription($productOptionId: Int!) {
         products_productOption_modifier(
            where: { productOptionId: { _eq: $productOptionId } }
         ) {
            label
            modifier {
               name
            }
         }
      }
   `,
   DELETE: gql`
      mutation deleteAdditionalModifier(
         $productOptionId: Int!
         $modifierId: Int!
      ) {
         delete_products_productOption_modifier(
            where: {
               productOptionId: { _eq: $productOptionId }
               modifierId: { _eq: $modifierId }
            }
         ) {
            affected_rows
         }
      }
   `,

   UPDATE: gql`
      mutation updateAdditionalModifier(
         $_set: products_productOption_modifier_set_input!
         $modifierId: Int!
         $productOptionId: Int!
      ) {
         update_products_productOption_modifier(
            where: {
               modifierId: { _eq: $modifierId }
               productOptionId: { _eq: $productOptionId }
            }
            _set: $_set
         ) {
            affected_rows
         }
      }
   `,
}

// getting productSettingId using identifier
export const PRODUCT_ID = gql`
   query MyQuery(
      $identifier: String_comparison_exp!
      $brandId: Int_comparison_exp!
   ) {
      products_product_productSetting(
         where: {
            productSetting: { identifier: $identifier }
            brandId: $brandId
         }
         limit: 1
      ) {
         productSettingId
      }
   }
`
