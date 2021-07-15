import { isEmpty } from 'lodash'

export const normalizeAddress = (address = {}) => {
   if (isEmpty(address)) return 'No Address added yet!'
   let result = ''
   if (address?.line1) {
      result += address.line1
   }
   if (address?.line2) {
      result += ', ' + address.line2
   }
   if (address?.city) {
      result += ', ' + address.city
   }
   if (address?.state) {
      result += ', ' + address.state
   }
   if (address?.country) {
      result += ', ' + address.country
   }
   if (address?.zipcode) {
      result += ', ' + address.zipcode
   }
   return result
}
