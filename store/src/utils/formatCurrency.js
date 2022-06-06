import { get_env } from './get_env'
import { isClient } from './isClient'
import { getCurrencySymbol } from './helper'

export const formatCurrency = (input = 0) => {
   const CURRENCY = get_env('CURRENCY')
   const currencySymbol = getCurrencySymbol(CURRENCY)
   return `${currencySymbol} ${input}`
   // return new Intl.NumberFormat('en-US', {
   //    style: 'currency',
   //    currency: isClient ? get_env('CURRENCY') : 'USD',
   // }).format(input)
}
