import gql from 'graphql-tag'
import { useSubscription } from '@apollo/react-hooks'

export const useProductConfig = (identifier, id) => {
   const {
      error,
      loading,
      data: { products_productSetting = {} } = {},
   } = useSubscription(PRODUCT_SETTING, {
      variables: {
         identifier: {
            _eq: identifier,
         },
         productId: { _eq: id },
      },
   })

   return {
      value: products_productSetting[0]?.setting[0]?.value,
   }
}

const PRODUCT_SETTING = gql`
   subscription productSetting(
      $identifier: String_comparison_exp!
      $productId: Int_comparison_exp!
   ) {
      products_productSetting(where: { identifier: $identifier }) {
         setting: product_productSettings(where: { productId: $productId }) {
            value
         }
      }
   }
`
