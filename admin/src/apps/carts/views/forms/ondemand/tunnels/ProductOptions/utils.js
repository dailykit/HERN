export const getCartItemWithModifiers = (
   cartItemInput,
   selectedModifiersInput
) => {
   const finalCartItem = { ...cartItemInput }

   const combinedModifiers = selectedModifiersInput.reduce(
      (acc, obj) => [...acc, ...obj.data],
      []
   )

   const dataArr = finalCartItem?.childs?.data[0]?.childs?.data
   const dataArrLength = dataArr.length

   if (dataArrLength === 0) {
      finalCartItem.childs.data[0].childs.data = combinedModifiers
      return finalCartItem
   } else {
      for (let i = 0; i < dataArrLength; i++) {
         const objWithModifiers = {
            ...dataArr[i],
            childs: {
               data: combinedModifiers,
            },
         }
         finalCartItem.childs.data[0].childs.data[i] = objWithModifiers
      }
      return finalCartItem
   }
}
