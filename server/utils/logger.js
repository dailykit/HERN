import fs from 'fs'
import path from 'path'
import moment from 'moment'
import axios from 'axios'
import get_env from '../../get_env'

export const logger2 = async args => {
   try {
      const PLATFORM_URL = await get_env('PLATFORM_URL')
      const DATA_HUB = await get_env('DATA_HUB')
      await axios({
         method: 'POST',
         url: `${PLATFORM_URL}/api/report/error`,
         data: {
            ...args,
            from: {
               url: new URL(DATA_HUB).origin
            }
         }
      })
   } catch (error) {
      console.log('failed to report error', error)
   }
}

export const logger = (endpoint, error) => {
   const stream = fs.createWriteStream(
      path.join(__dirname, '../logs/errors.log'),
      { flags: 'a' }
   )
   stream.write(
      `[${endpoint}] | [${moment().format(
         'YYYY-MM-DD HH:MM:SSA Z'
      )}] | [${error}]\n`
   )
   stream.end()
}
