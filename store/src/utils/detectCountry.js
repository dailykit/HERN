import axios from 'axios'

export const detectCountry = async () => {
   const { data } = await axios.get('http://ip-api.com/json')
   return data
}
