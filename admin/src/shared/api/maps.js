import axios from 'axios'
import { get_env } from '../utils'

export const getdrivableDistance = async ({ lat1, lon1, lat2, lon2 }) => {
   const response = await axios.post(
      `${get_env('REACT_APP_DAILYOS_SERVER_URI')}/api/distance-matrix`,
      {
         lat1,
         lon1,
         lat2,
         lon2,
         key: get_env('REACT_APP_MAPS_API_KEY'),
      }
   )
   return response.data
}
