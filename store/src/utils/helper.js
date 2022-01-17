import getSymbolFromCurrency from 'currency-symbol-map'

export const getCurrencySymbol = currency => {
   if (!currency) {
      return ''
   }
   return getSymbolFromCurrency(currency)
}
