// remove duplicate items
let uniq = array => [...new Set(array)]

// this will return all additionalModifierTemplateId available in additionalModifier array and modifier's modifierOption
export const nestedModifierTemplateIds = productData => {
   let modifierTemplateIds = []
   console.log('productI', productData)
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
