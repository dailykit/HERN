const concatAddress = address => {
   if (
      !address?.line1 &&
      !address?.line2 &&
      !address?.city &&
      !address?.zipcode &&
      !address?.state &&
      !address?.country
   ) {
      return 'N/A'
   }
   return `${address?.line1}, ${address?.line2}, ${address?.city}, ${address?.zipcode}, ${address?.state}, ${address?.country}`
}

export default concatAddress
