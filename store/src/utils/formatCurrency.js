import { get_env } from './get_env'
import { isClient } from './isClient'

export const formatCurrency = (input = 0) => {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: isClient ? get_env('CURRENCY') : 'USD',
   }).format(input)
}
