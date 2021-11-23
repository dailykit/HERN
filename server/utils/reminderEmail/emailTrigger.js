import axios from 'axios'
import { client } from '../../lib/graphql'
import { template_compiler } from '../template'
import { SEND_MAIL } from '../../entities/occurence/graphql'
import get_env from '../../../get_env'

export const GET_TEMPLATE_SETTINGS = `
   query templateSettings($title: String!) {
      templateSettings: notifications_emailTriggers(
         where: { title: { _eq: $title } }
      ) {
         id
         title
         requiredVar: var
         subjectLineTemplate
         functionFile {
            fileName
            path
         }
         fromEmail
      }
   }
`

const getHtml = async (functionFile, variables, subjectLineTemplate) => {
   try {
      const DATA_HUB = await get_env('DATA_HUB')
      const { origin } = new URL(DATA_HUB)
      const template_variables = encodeURI(JSON.stringify({ ...variables }))
      if (subjectLineTemplate) {
         const template_options = encodeURI(
            JSON.stringify({
               path: functionFile.path,
               format: 'html',
               readVar: true
            })
         )
         const url = `${origin}/template/?template=${template_options}&data=${template_variables}`
         const { data } = await axios.get(url)
         const result = template_compiler(subjectLineTemplate, data)
         return result
      }
      if (!subjectLineTemplate) {
         const template_options = encodeURI(
            JSON.stringify({
               path: functionFile.path,
               format: 'html'
            })
         )
         const url = `${origin}/template/?template=${template_options}&data=${template_variables}`

         const { data: html } = await axios.get(url)

         return html
      }
   } catch (error) {
      console.log('error from getHtml', error)
      throw error
   }
}

export const emailTrigger = async ({
   title,
   variables = {},
   to,
   brandId,
   includeHeader,
   includeFooter
}) => {
   try {
      console.log('entering emailTrigger', { title, variables, to })
      const { templateSettings = [] } = await client.request(
         GET_TEMPLATE_SETTINGS,
         {
            title
         }
      )
      if (templateSettings.length === 1) {
         const [
            {
               requiredVar = [],
               subjectLineTemplate,
               fromEmail,
               functionFile = {}
            }
         ] = templateSettings

         let proceed = true
         requiredVar.every(item => {
            proceed = Object.prototype.hasOwnProperty.call(variables, item)
            return proceed
         })
         if (proceed) {
            const html = await getHtml(functionFile, variables)
            console.log('html', typeof html)
            const subjectLine = await getHtml(
               functionFile,
               variables,
               subjectLineTemplate
            )

            const { sendEmail } = await client.request(SEND_MAIL, {
               emailInput: {
                  from: fromEmail,
                  to,
                  subject: subjectLine,
                  attachments: [],
                  html,
                  ...(brandId && { brandId }),
                  ...(includeHeader && { includeHeader }),
                  ...(includeFooter && { includeFooter })
               }
            })
            return sendEmail
         }
         if (!proceed) {
            console.log(
               'Could not send email as required variables were not provided'
            )
            return {
               success: false,
               message:
                  'Could not send email as required variables were not provided'
            }
         }
      }
   } catch (error) {
      console.log(error)
      return {
         success: false,
         message: 'Failed to send email.',
         error: error.message
      }
   }
}
