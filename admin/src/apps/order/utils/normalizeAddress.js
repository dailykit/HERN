export const normalizeAddress = address =>
   `${address.line1}${address.line2 && `, ${address.line2}`}, ${
      address.city
   }, ${address.state}, ${address.zipcode}`
