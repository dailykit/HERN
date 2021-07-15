// used in combo and customizable
export const isIncludedInOptions = (id, options) => {
   const option = options?.find(({ optionId }) => optionId === id)
   if (option) {
      return true
   }
   return false
}
