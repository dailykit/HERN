import axios from 'axios'
import { client } from '../../lib/graphql'
import gen_env from '../../../get_env'

const parseur = {
   one: async (req, res) => {
      try {
         const { id = null } = req.params

         if (!id) throw { message: 'Mailbox id is required!', status_code: 409 }

         const PARSEUR_API_URL = await get_env('PARSEUR_API_URL')
         const PARSEUR_API_KEY = await get_env('PARSEUR_API_KEY')
         const { data = {} } = await axios({
            method: 'GET',
            url: `${PARSEUR_API_URL}/parser/${id}`,
            headers: {
               Authorization: `Token ${PARSEUR_API_KEY}`
            }
         })
         res.status(200).json({ success: true, data })
      } catch (error) {
         const code =
            'status_code' in error && error.status_code
               ? error.status_code
               : 500
         res.status(code).json({ success: false, error })
      }
   },
   insert: async (req, res) => {
      try {
         const { brand = {} } = req.body

         if (!('id' in brand) && !brand.id)
            throw { message: 'Brand id is required!', status_code: 409 }

         const PLATFORM_URL = await get_env('PLATFORM_URL')
         const ORGANIZATION_ID = await get_env('ORGANIZATION_ID')
         const { status, data = {} } = await axios({
            method: 'POST',
            url: `${PLATFORM_URL}/api/parseur`,
            data: { brand, organization: { id: ORGANIZATION_ID } }
         })
         if (status === 200 && 'success' in data && data.success) {
            if ('data' in data && Object.keys(data.data).length > 0) {
               try {
                  await client.request(UPDATE_BRAND, {
                     id: brand.id,
                     _set: {
                        parseurMailBoxId: data.data.id
                     }
                  })
               } catch (_) {
                  throw {
                     message: 'Failed to set parseur mailbox id!'
                  }
               }
            }
         }
         res.status(200).json({ success: true, data })
      } catch (error) {
         const code =
            'status_code' in error && error.status_code
               ? error.status_code
               : 500
         res.status(code).json({ success: false, error })
      }
   },
   delete: async (req, res) => {
      try {
         const { brand = {}, mailbox = {} } = req.body

         if (!('id' in brand) && !brand.id)
            throw { message: 'Brand id is required!', status_code: 409 }
         if (!('id' in mailbox) && !mailbox.id)
            throw { message: 'Mailbox id is required!', status_code: 409 }

         const PLATFORM_URL = await get_env('PLATFORM_URL')
         const { status, data = {} } = await axios({
            method: 'DELETE',
            url: `${PLATFORM_URL}/api/parseur/${mailbox.id}`
         })
         if (status === 200) {
            try {
               await client.request(UPDATE_BRAND, {
                  id: brand.id,
                  _set: {
                     parseurMailBoxId: null
                  }
               })
            } catch (error) {
               throw {
                  stack_trace: error,
                  status_code: 500,
                  message: 'Failed to remove mailbox id!'
               }
            }
         }
         res.status(200).json({ success: true, data })
      } catch (error) {
         const code =
            'status_code' in error && error.status_code
               ? error.status_code
               : 500
         res.status(code).json({ success: false, error })
      }
   }
}

export default parseur

const UPDATE_BRAND = `
   mutation updateBrand($id: Int!, $_set: brands_brand_set_input!) {
      updateBrand(pk_columns: { id: $id }, _set: $_set) {
         id
      }
   }
`
