import gql from 'graphql-tag'

export const MODIFIERS = {
   CREATE: gql`
      mutation CreateModifier($object: onDemand_modifier_insert_input!) {
         createModifier(object: $object) {
            id
            title: name
         }
      }
   `,
}

export const MODIFIER = {
   UPDATE: gql`
      mutation UpdateName($id: Int!, $_set: onDemand_modifier_set_input) {
         updateModifier(pk_columns: { id: $id }, _set: $_set) {
            id
            title: name
         }
      }
   `,
   VIEW: gql`
      subscription Modifier($id: Int!) {
         modifier(id: $id) {
            id
            name
            categories(order_by: { created_at: asc_nulls_last }) {
               id
               name
               categoryType
               isRequired
               isVisible
               type
               limits
               options(order_by: { created_at: asc_nulls_last }) {
                  id
                  posist_baseItemId
                  name
                  originalName
                  price
                  discount
                  quantity
                  image
                  isActive
                  isVisible
                  additionalModifierTemplateId
                  operationConfig {
                     id
                     name
                  }
               }
            }
         }
      }
   `,
}

export const MODIFIER_CATEGORIES = {
   CREATE: gql`
      mutation CreateModifierCategory(
         $object: onDemand_modifierCategory_insert_input!
      ) {
         createModifierCategory(object: $object) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation DeleteModifierCategory($id: Int!) {
         deleteModifierCategory(id: $id) {
            id
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateModifierCategory(
         $id: Int!
         $_set: onDemand_modifierCategory_set_input
      ) {
         updateModifierCategory(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
}

export const MODIFIER_OPTION = {
   CREATE: gql`
      mutation CreateModifierOption(
         $object: onDemand_modifierCategoryOption_insert_input!
      ) {
         createModifierOption(object: $object) {
            id
         }
      }
   `,
   DELETE: gql`
      mutation DeleteOption($id: Int!) {
         deleteModifierOption(id: $id) {
            id
         }
      }
   `,
   UPDATE: gql`
      mutation UpdateOption(
         $id: Int!
         $_set: onDemand_modifierCategoryOption_set_input
      ) {
         updateModifierOption(pk_columns: { id: $id }, _set: $_set) {
            id
         }
      }
   `,
}
export const ADDITIONAL_MODIFIERS = {
   CREATE: gql`
      mutation createAdditionalModifiers(
         $objects: [products_productOption_modifier_insert_input!]!
      ) {
         insert_products_productOption_modifier(objects: $objects) {
            affected_rows
         }
      }
   `,
   VIEW: gql`
      subscription viewAdditionalModifier($productOptionId: Int!) {
         products_productOption_modifier(
            where: { productOptionId: { _eq: $productOptionId } }
         ) {
            modifierId
            productOptionId
            type
            label
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
}
