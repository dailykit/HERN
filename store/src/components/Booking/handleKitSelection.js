export const useKitSelection = () => {
   const handleKitSelection = ({
      kitCount = 0,
      isKitMandatory = false,
      isKitAdded = false
   }) => {
      let goToKitSelection = false
      let footerDisable = false
      if (kitCount > 1) {
         goToKitSelection = true
         if (isKitMandatory) {
            footerDisable = !isKitAdded
         } else {
            footerDisable = false
         }
      } else {
         if (isKitMandatory) {
            goToKitSelection = false
         } else {
            if (kitCount === 1) {
               goToKitSelection = true
               footerDisable = false
            } else {
               goToKitSelection = false
            }
         }
      }

      return {
         goToKitSelection,
         footerDisable
      }
   }

   return {
      handleKitSelection
   }
}
