export const calcDiscountedPrice = (price, discount) => {
   return price - price * (discount / 100)
}
