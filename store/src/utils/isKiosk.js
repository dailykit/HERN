import { useQueryParamState } from './useQueryParamState'
export const isKiosk = () => {
   const [params] = useQueryParamState('oiType')
   return params === 'Kiosk Ordering'
}
