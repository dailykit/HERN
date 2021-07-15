import { isEmpty } from 'lodash'

export const findAndSelectSachet = ({
   product,
   isSuperUser,
   station,
   dispatch,
}) => {
   const sachet = product.orderSachets
      ?.filter(node => isSuperUser || node.packingStationId === station?.id)
      .find(node => node.status === 'PENDING')
   if (!isEmpty(sachet)) {
      dispatch({
         type: 'SELECT_SACHET',
         payload: {
            id: sachet.id,
            product: {
               name: product?.simpleRecipeProduct?.name || '',
            },
         },
      })
   }
}
