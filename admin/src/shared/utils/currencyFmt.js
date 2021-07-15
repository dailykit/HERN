import { get_env } from './get_env'

export const currencyFmt = (amount = 0) =>
   new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: get_env('REACT_APP_CURRENCY'),
   }).format(amount)
