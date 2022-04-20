import axios from 'axios'
import { get, groupBy, isEmpty } from 'lodash'
import { createEvent } from 'ics'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import path from 'path'
import { client } from '../../lib/graphql'
import { globalTemplate } from '../../utils'
import get_env from '../../../get_env'
import { GET_SES_DOMAIN, API_KEYS } from './graphql'
import aws from '../../lib/aws'

const nodemailer = require('nodemailer')

const transportEmail = async (transporter, message) =>
   new Promise((resolve, reject) => {
      transporter.sendMail(message, (err, info) => {
         if (err) {
            reject(err)
         } else {
            resolve(info)
         }
      })
   })

export const sendMail = async (req, res) => {
   try {
      const { emailInput, inviteInput = {} } = req.body.input
      const AWS = await aws()
      const inputDomain = emailInput.from.split('@')[1]
      const {
         includeHeader = false,
         includeFooter = false,
         brandId = null
      } = emailInput
      const updatedAttachments = []

      // Get the DKIM details from dailycloak
      const dkimDetails = await client.request(GET_SES_DOMAIN, {
         domain: inputDomain
      })

      if (dkimDetails.aws_ses.length === 0) {
         return res.status(400).json({
            success: false,
            message: `Domain ${inputDomain} is not registered. Cannot send emails.`
         })
      }
      // create nodemailer transport
      const transport = nodemailer.createTransport({
         SES: new AWS.SES({ apiVersion: '2010-12-01' }),
         dkim: {
            domainName: dkimDetails.aws_ses[0].domain,
            keySelector: dkimDetails.aws_ses[0].keySelector,
            privateKey: dkimDetails.aws_ses[0].privateKey.toString('binary')
         }
      })

      // build the invite event
      if (Object.keys(inviteInput).length) {
         const event = {
            start: inviteInput.start,
            duration: inviteInput.duration,
            title: inviteInput.title,
            description: inviteInput.description,
            location: inviteInput.location,
            url: inviteInput.url,
            geo: inviteInput.geo,
            categories: inviteInput.categories,
            status: inviteInput.status,
            busyStatus: inviteInput.busyStatus,
            organizer: inviteInput.organizer,
            attendees: inviteInput.attendees
         }
         createEvent(event, async (error, value) => {
            if (error) {
               console.log(error)
               return
            }
            console.log('EVENT OUTPUT', value)
            await writeFileSync(
               `${__dirname}/calendarInvite/${inviteInput.title.replace(
                  ' ',
                  '_'
               )}.ics`,
               value
            )
         })
         updatedAttachments.push({
            filename: `${inviteInput.title.replace(' ', '_')}.ics`,
            path: `${__dirname}/calendarInvite/${inviteInput.title.replace(
               ' ',
               '_'
            )}.ics`,
            contentType: 'text/calendar'
         })
      }

      emailInput.attachments.forEach(attachment => {
         updatedAttachments.push(attachment)
      })

      let html = emailInput.html
      if (includeHeader) {
         // getting the header html and concatenating it with the email html
         const headerHtml = await globalTemplate({
            brandId,
            identifier: 'globalEmailHeader' // this identifier should also come from datahub and not hardcoded
         })
         html = headerHtml ? headerHtml + html : html
      }
      if (includeFooter) {
         // getting the footer html and concatenating it with the email html
         const footerHtml = await globalTemplate({
            brandId,
            identifier: 'globalEmailFooter'
         })
         html = footerHtml ? html + footerHtml : html
      }

      // build and send the message
      const message = {
         from: emailInput.from,
         to: emailInput.to.split(','), // so that you can send to multiple recipients just pass mutiple emails separated by comma
         subject: emailInput.subject,
         html,
         attachments: updatedAttachments
      }

      if (dkimDetails.aws_ses[0].isVerified === true) {
         await transportEmail(transport, message)
      } else {
         throw new Error(
            `Domain - ${inputDomain} - is not verified. Cannot send emails.`
         )
      }

      return res.status(200).json({
         success: true,
         message: 'Email sent successfully!'
      })
   } catch (error) {
      console.log(error)
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}

export const placeAutoComplete = async (req, res) => {
   try {
      const { key, input, location, components, language, types } = req.query
      if (key && input) {
         const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${key}&language=${language}&components=${components}&location=${location}`
         const response = await axios.get(url)
         return res.json(response.data)
      } else {
         throw Error('No key or input provided!')
      }
   } catch (err) {
      return res.status(400).json({
         success: false,
         message: err.message
      })
   }
}

export const placeDetails = async (req, res) => {
   try {
      const { key, placeid, language } = req.query
      if (key && placeid) {
         const url = `https://maps.googleapis.com/maps/api/place/details/json?key=${key}&placeid=${placeid}&language=${language}&fields=formatted_address,name,geometry,address_component`
         const response = await axios.get(url)
         return res.json(response.data)
      } else {
         throw Error('No key or place id provided!')
      }
   } catch (err) {
      return res.status(400).json({
         success: false,
         message: err.message
      })
   }
}

export const getDistance = async (req, res) => {
   try {
      const { key, lat1, lon1, lat2, lon2 } = req.body
      if (key && lat1 && lon1 && lat2 && lon2) {
         const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${key}`
         const response = await axios.get(url)
         return res.json(response.data)
      } else {
         throw Error('No key or coordinates provided!')
      }
   } catch (err) {
      return res.status(400).json({
         success: false,
         message: err.message
      })
   }
}

const STAFF_USERS = `
   query users($email: String_comparison_exp!) {
      users: settings_user(where: { email: $email }) {
         id
         email
         keycloakId
      }
   }
`

const UPDATE_STAFF_USER = `
   mutation updateUser(
      $where: settings_user_bool_exp!
      $_set: settings_user_set_input!
   ) {
      updateUser: update_settings_user(where: $where, _set: $_set) {
         affected_rows
      }
   }
`

export const authorizeRequest = async (req, res) => {
   try {
      const staffId = req.body.headers['Staff-Id']
      const staffEmail = req.body.headers['Staff-Email']

      const keycloakId = req.body.headers['Keycloak-Id']
      const cartId = req.body.headers['Cart-Id']
      const brandId = req.body.headers['Brand-Id']
      const brandCustomerId = req.body.headers['Brand-Customer-Id']
      const source = req.body.headers['Source']
      const apiKeyHeaderValue = req.body.headers['Api-Key']

      let apiKeyExists = false
      let staffUserExists = false
      if (apiKeyHeaderValue) {
         const apiKeys = await client.request(API_KEYS, {
            apiKey: apiKeyHeaderValue
         })
         if (
            apiKeys.developer_apiKey &&
            apiKeys.developer_apiKey[0].isDeactivated == false
         ) {
            apiKeyExists = true
         }
      }
      if (staffId) {
         const { users = [] } = await client.request(STAFF_USERS, {
            email: { _eq: staffEmail }
         })
         if (users.length > 0) {
            staffUserExists = true
            const [user] = users
            if (user.keycloakId !== staffId) {
               await client.request(UPDATE_STAFF_USER, {
                  where: { email: { _eq: staffEmail } },
                  _set: { keycloakId: staffId }
               })
            }
         }
      }

      return res.status(200).json({
         'X-Hasura-Role': keycloakId ? 'consumer' : 'guest-consumer',
         'X-Hasura-Source': source,
         'X-Hasura-Brand-Id': brandId,
         ...(keycloakId && {
            'X-Hasura-Keycloak-Id': keycloakId
         }),
         ...(cartId && { 'X-Hasura-Cart-Id': cartId }),
         ...(brandCustomerId && {
            'X-Hasura-Brand-Customer-Id': brandCustomerId
         }),
         ...(staffId &&
            staffUserExists && {
               'X-Hasura-Role': 'admin',
               'X-Hasura-Staff-Id': staffId,
               'X-Hasura-Email-Id': staffEmail
            }),
         ...(apiKeyHeaderValue &&
            apiKeyExists && {
               'X-Hasura-Role': 'apiKeyRole',
               'X-Hasura-Api-Key': apiKeyHeaderValue
            })
      })
   } catch (error) {
      return res.status(404).json({ success: false, error: error.message })
   }
}
const ENVS = `
   query envs {
      envs: settings_env {
         id
         title
         value
         belongsTo
      }
   }
`
const ENVS2 = `
query envs {
  envs: settings_env {
    id
    title
    value
    belongsTo
    config
  }
  payment: brands_availablePaymentOption(where: {isActive: {_eq: true}}) {
    label
    privateCreds
    publicCreds
  }
}
`
/*
used to create env config files and populate with relevant envs
*/

export const createEnvFiles = async () => {
   const { envs } = await client.request(ENVS)
   console.log('initializing createEnvfiles')
   if (isEmpty(envs)) {
      return await syncEnvsFromPlatform()
   }
   const grouped = groupBy(envs, 'belongsTo')

   const server = {}

   get(grouped, 'server', {}).forEach(node => {
      server[node.title] = node.value
   })

   writeFileSync(
      path.join(__dirname, '../../../', 'config.js'),
      `module.exports = ${JSON.stringify(server, null, 2)}`
   )

   const store = {}

   get(grouped, 'store', {}).forEach(node => {
      store[node.title] = node.value
   })

   const PATH_TO_SUBS = path.join(
      __dirname,
      '../../../',
      'store',
      'public',
      'env-config.js'
   )
   const dirPath = path.join(__dirname, '../../../hern/')
   const isDirectoryExist = existsSync(dirPath)
   if (!isDirectoryExist) {
      mkdirSync(dirPath, { recursive: true })
   }
   writeFileSync(
      path.join(dirPath, 'env-config.js'),
      `window._env_ = ${JSON.stringify(store, null, 2)}`
   )
   writeFileSync(
      PATH_TO_SUBS,
      `window._env_ = ${JSON.stringify(store, null, 2)}`
   )

   const admin = {}

   get(grouped, 'admin', []).forEach(node => {
      admin[node.title] = node.value
   })

   if (process.env.NODE_ENV === 'development') {
      const PATH_TO_ADMIN = path.join(
         __dirname,
         '../../../',
         'admin',
         'public',
         'env-config.js'
      )
      writeFileSync(
         PATH_TO_ADMIN,
         `window._env_ = ${JSON.stringify(admin, null, 2)}`
      )
   } else {
      const PATH_TO_ADMIN = path.join(
         __dirname,
         '../../../',
         'admin',
         'build',
         'env-config.js'
      )
      writeFileSync(
         PATH_TO_ADMIN,
         `window._env_ = ${JSON.stringify(admin, null, 2)}`
      )
   }
   return { server, store, admin }
}
export const createEnvFiles2 = async () => {
   const { envs, payment } = await client.request(ENVS2)
   console.log('initializing createEnvFiles2')
   if (isEmpty(envs) || isEmpty(payment)) {
      return await syncEnvsFromPlatform()
   }
   const grouped = groupBy(envs, 'belongsTo')

   const server = {}

   payment.forEach(node => {
      node.privateCreds.private.forEach(node2 => {
         server[node2.label] = node2.value
      })
   })

   console.log('server', server)
   get(grouped, 'server', {}).forEach(node => {
      server[node.config.env_details.label] = node.config.env_details.value
   })
   // console.log('server', server)
   writeFileSync(
      path.join(__dirname, '../../../', 'config.js'),
      `module.exports = ${JSON.stringify(server, null, 2)}`
   )

   const store = {}

   {
      payment.forEach(node => {
         node.publicCreds.public.forEach(node2 => {
            store[node2.label] = node2.value
         })
      })
   }
   get(grouped, 'store', {}).forEach(node => {
      store[node.config.env_details.label] = node.config.env_details.value
   })

   const PATH_TO_SUBS = path.join(
      __dirname,
      '../../../',
      'store',
      'public',
      'env-config.js'
   )
   const dirPath = path.join(__dirname, '../../../hern/')
   const isDirectoryExist = existsSync(dirPath)
   if (!isDirectoryExist) {
      mkdirSync(dirPath, { recursive: true })
   }
   writeFileSync(
      path.join(dirPath, 'env-config.js'),
      `window._env_ = ${JSON.stringify(store, null, 2)}`
   )
   writeFileSync(
      PATH_TO_SUBS,
      `window._env_ = ${JSON.stringify(store, null, 2)}`
   )

   const admin = {}

   payment.forEach(node => {
      node.publicCreds.public.forEach(node2 => {
         admin[node2.label] = node2.value
      })
   })

   get(grouped, 'admin', {}).forEach(node => {
      admin[node.config.env_details.label] = node.config.env_details.value
   })

   if (process.env.NODE_ENV === 'development') {
      const PATH_TO_ADMIN = path.join(
         __dirname,
         '../../../',
         'admin',
         'public',
         'env-config.js'
      )
      writeFileSync(
         PATH_TO_ADMIN,
         `window._env_ = ${JSON.stringify(admin, null, 2)}`
      )
   } else {
      const PATH_TO_ADMIN = path.join(
         __dirname,
         '../../../',
         'admin',
         'build',
         'env-config.js'
      )
      writeFileSync(
         PATH_TO_ADMIN,
         `window._env_ = ${JSON.stringify(admin, null, 2)}`
      )
   }
   return { server, store, admin }
}

export const populate_env = async (req, res) => {
   try {
      console.log('initiating populate_env')
      const data = await createEnvFiles2()
      if (!data) {
         throw Error('No envs found!')
      }
      return res.status(200).json({
         success: true,
         data
      })
   } catch (error) {
      return res.status(404).json({ success: false, error: error.message })
   }
}

export const syncEnvsFromPlatform = async () => {
   try {
      console.log('initializing syncEnv')
      const PLATFORM_URL = process.env.PLATFORM_URL
      const organizationId = process.env.ORGANIZATION_ID
      let url = `${PLATFORM_URL}/getenvs?organizationId=${organizationId}`

      const { data: { success, data = {} } = {} } = await axios.get(url)
      if (success) {
         const { insert_settings_env = {} } = await client.request(
            UPSERT_SETTINGS_ENV,
            {
               objects: data
            }
         )
         if (
            !isEmpty(insert_settings_env) &&
            !isEmpty(insert_settings_env.returning)
         ) {
            console.log('updated successfully')
            await createEnvFiles2()
         }
      } else {
         throw "Couldn't update envs"
      }
   } catch (error) {
      console.log(error)
   }
}

const UPSERT_SETTINGS_ENV = `
mutation upsertEnvs($objects: [settings_env_insert_input!]!) {
   insert_settings_env(on_conflict: {constraint: env_pkey, update_columns: value}, objects: $objects) {
      returning {
         id
       }
   }
 }
 `
