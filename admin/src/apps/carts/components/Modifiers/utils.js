export const getModifiersValidator = modifiers => {
   const checks = {}
   for (let category of modifiers.categories) {
      checks[category.name] = {}

      if (category.type === 'multiple') {
         checks[category.name].min = category.isRequired
            ? category.limits.min || 1
            : 0
         checks[category.name].max =
            category.limits.max || category.options.length
      }

      if (category.type === 'single') {
         checks[category.name].min = category.isRequired ? 1 : 0
         checks[category.name].max = 1
      }

      checks[category.name].optionIds = category.options.map(op => op.id)
   }

   function canOptionBeAdded(selectedModifiers, option) {
      const [category] = Object.entries(checks).find(([, v]) =>
         v.optionIds.includes(option.id)
      )

      const alreadySelectedCount = selectedModifiers.filter(modifierCartItem =>
         checks[category].optionIds.includes(
            modifierCartItem.data[0].modifierOptionId
         )
      ).length

      if (alreadySelectedCount === checks[category].max) {
         return false
      } else {
         return true
      }
   }

   function isModifiersStateValid(selectedModifiers) {
      const isValid = Object.entries(checks).every(([, v]) => {
         const alreadySelectedCount = selectedModifiers.filter(
            modifierCartItem =>
               v.optionIds.includes(modifierCartItem.data[0].modifierOptionId)
         ).length
         if (alreadySelectedCount < v.min || alreadySelectedCount > v.max) {
            return false
         }
         return true
      })
      return isValid
   }

   return [canOptionBeAdded, isModifiersStateValid]
}
