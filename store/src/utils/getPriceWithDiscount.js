export const getPriceWithDiscount = (price, discount) => {
   return price - (price * discount) / 100
}
