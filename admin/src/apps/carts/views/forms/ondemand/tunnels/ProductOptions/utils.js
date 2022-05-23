export const getCartItemWithModifiers = (
   cartItemInput,
   selectedModifiersInput,
   nestedModifiersInput
) => {
   // clone cartItemInput (deep clone)
   const finalCartItem = JSON.parse(JSON.stringify(cartItemInput))

   const combinedModifiers = selectedModifiersInput.reduce(
      (acc, obj) => [...acc, ...obj.data],
      []
   )
   const dataArr = finalCartItem?.childs?.data[0]?.childs?.data
   const dataArrLength = dataArr.length

   finalCartItem.childs.data[0].childs.data = [...dataArr, ...combinedModifiers]

   if (nestedModifiersInput) {
      nestedModifiersInput.forEach(eachNestedModifierInput => {
         const foundModifierIndex =
            finalCartItem.childs.data[0].childs.data.findIndex(
               y =>
                  eachNestedModifierInput.parentModifierOptionId ==
                  y.modifierOptionId
            )
         const xCombinedModifier = eachNestedModifierInput.data
            .map(z => z.cartItem)
            .reduce((acc, obj) => [...acc, ...obj.data], [])
         finalCartItem.childs.data[0].childs.data[foundModifierIndex].childs =
            {}
         finalCartItem.childs.data[0].childs.data[foundModifierIndex].childs[
            'data'
         ] = xCombinedModifier
      })
   }

   return finalCartItem
}