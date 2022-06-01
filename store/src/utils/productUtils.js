// remove duplicate items
let uniq = array => [...new Set(array)]

// this will return all additionalModifierTemplateId available in additionalModifier array and modifier's modifierOption
export const nestedModifierTemplateIds = productData => {
   let modifierTemplateIds = []

   if (productData.productOptions && productData.productOptions.length > 0) {
      productData.productOptions.forEach(option => {
         option.additionalModifiers.forEach(additionalModifier => {
            if (additionalModifier.modifier) {
               additionalModifier.modifier.categories.forEach(eachCategory => {
                  eachCategory.options.forEach(eachOption => {
                     if (eachOption.additionalModifierTemplateId) {
                        modifierTemplateIds.push(
                           eachOption.additionalModifierTemplateId
                        )
                     }
                  })
               })
            }
         })
         // for single modifiers
         if (option.modifier) {
            option.modifier.categories.forEach(eachCategory => {
               eachCategory.options.forEach(eachOption => {
                  if (eachOption.additionalModifierTemplateId) {
                     modifierTemplateIds.push(
                        eachOption.additionalModifierTemplateId
                     )
                  }
               })
            })
         }
      })
   }
   return uniq(modifierTemplateIds)
}
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
         console.log("foundModifierIndex",foundModifierIndex,finalCartItem,eachNestedModifierInput)
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
