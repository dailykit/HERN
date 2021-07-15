const axios = require('axios')

import get_env from '../../../get_env'
import { client } from '../../lib/graphql'
import { template_compiler } from '../../utils'
import {
   FETCH_TYPE,
   PRINT_JOB,
   SEND_MAIL,
   CREATE_NOTIFICATION
} from './graphql'

export const manage = async (req, res) => {
   try {
      const { trigger } = req.body

      const { notificationTypes } = await client.request(FETCH_TYPE, {
         name: {
            _eq: trigger.name
         }
      })

      const {
         id,
         template,
         isLocal,
         isGlobal,
         emailFrom,
         emailConfigs,
         printConfigs
      } = notificationTypes[0]

      /*
      if (isLocal || isGlobal) {
         const parsed = JSON.parse(
            template_compiler(JSON.stringify(template), req.body.event.data)
         )

         await client.request(CREATE_NOTIFICATION, {
            object: {
               typeId: id,
               content: parsed
            }
         })
      }
      */

      await Promise.all(
         printConfigs.map(async config => {
            try {
               const parsed = JSON.parse(
                  template_compiler(
                     JSON.stringify(config.template),
                     req.body.event.data
                  )
               )
               const DATA_HUB = await get_env('DATA_HUB')
               const { origin } = new URL(DATA_HUB)
               const data = JSON.stringify(parsed.template.data)
               const template = JSON.stringify(parsed.template.template)

               const url = `${origin}/template/?template=${template}&data=${data}`

               const { printJob } = await client.request(PRINT_JOB, {
                  url,
                  title: trigger.name,
                  source: 'Admin',
                  contentType: 'pdf_uri',
                  printerId: config.printerPrintNodeId
               })
               return printJob
            } catch (error) {
               throw error
            }
         })
      )

      await Promise.all(
         emailConfigs.map(async config => {
            try {
               let html = await getHtml(config.template, req.body.event.data)

               if (!config.email) return
               await client.request(SEND_MAIL, {
                  emailInput: {
                     from: `"${emailFrom.name}" ${emailFrom.email}`,
                     to: config.email,
                     subject: trigger.name,
                     attachments: [],
                     html
                  }
               })
            } catch (error) {
               throw error
            }
         })
      )

      return res
         .status(200)
         .json({ success: true, message: 'Notification Sent!' })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

export const trigger = async (req, res) => {
   try {
      const { event } = req.body
      if (event.data.new.isActive === true) {
         // create the trigger
         const createPayloadData = {
            type: 'create_event_trigger',
            args: {
               name: event.data.new.name,
               table: {
                  name: event.data.new.table,
                  schema: event.data.new.schema
               },
               webhook: '{{DAILYOS_SERVER_URL}}/webhook/notification/manage',
               replace: false
            }
         }
         switch (event.data.new.op) {
            case 'INSERT': {
               createPayloadData.args['insert'] = {
                  columns: '*'
               }
               await hasuraTrigger(createPayloadData)
               break
            }
            case 'UPDATE': {
               createPayloadData.args['update'] = event.data.new.fields
               await hasuraTrigger(createPayloadData)
               break
            }
            case 'DELETE': {
               createPayloadData.args['delete'] = '*'
               await hasuraTrigger(createPayloadData)
               break
            }
            default:
               throw Error('Unknown operation type')
         }
         return res
            .status(200)
            .json({ success: true, message: 'Event Trigger Created!' })
      } else {
         // delete the trigger
         await hasuraTrigger({
            type: 'delete_event_trigger',
            args: {
               name: event.data.new.name
            }
         })
         return res
            .status(200)
            .json({ success: true, message: 'Event Trigger Deleted!' })
      }
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

const hasuraTrigger = async payloadData => {
   const DATA_HUB = await get_env('DATA_HUB')
   const HASURA_GRAPHQL_ADMIN_SECRET = await get_env(
      'HASURA_GRAPHQL_ADMIN_SECRET'
   )
   const url = new URL(DATA_HUB).origin + '/datahub/v1/query'
   await axios({
      url,
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'x-hasura-role': 'admin',
         'x-hasura-admin-secret': HASURA_GRAPHQL_ADMIN_SECRET
      },
      data: payloadData
   })
}

const getHtml = async (template, data) => {
   try {
      const parsed = JSON.parse(
         template_compiler(JSON.stringify(template), data)
      )

      const { origin } = new URL(get_env('DATA_HUB'))
      const template_data = encodeURI(JSON.stringify(parsed.template.data))
      const template_options = encodeURI(
         JSON.stringify(parsed.template.template)
      )

      const url = `${origin}/template/?template=${template_options}&data=${template_data}`

      const { data: html } = await axios.get(url)
      return html
   } catch (error) {
      throw error
   }
}
