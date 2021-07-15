import get_env from '../../../get_env'
import { client } from '../../lib/graphql'

export const printLabel = async (req, res) => {
   try {
      const { id, status } = req.body.event.data.new

      if (status !== 'READY')
         return res.status(200).json({
            success: true,
            message: `Not available for status: ${status}`
         })

      const { cartItems = [] } = await client.request(CART_ITEM, {
         id: { _eq: id }
      })

      const [cartItem] = cartItems

      if (['productItem', 'productItemComponent'].includes(cartItem.levelType))
         return res.status(200).json({
            success: true,
            message: `Not available for level: ${cartItem.levelType}`
         })

      if (!cartItem.operationConfigId)
         return res
            .status(200)
            .json({ success: true, message: 'No operation config is linked.' })
      if (!cartItem.operationConfig.labelTemplateId)
         return res
            .status(200)
            .json({ success: true, message: 'No label template is provided.' })
      if (!cartItem.operationConfig.stationId)
         return res
            .status(200)
            .json({ success: true, message: 'Assembly station Id is missing.' })

      const station = cartItem.operationConfig.station

      if (
         !station.defaultLabelPrinterId &&
         station.attachedLabelPrinters.length === 0
      ) {
         throw Error('Assigned station has no printers available.')
      }

      const { settings } = await client.request(PRINT_SETTINGS, {
         app: { _eq: 'order' },
         identifier: { _eq: 'print simulation' }
      })

      if (settings.length > 0) {
         const [setting] = settings
         if (setting.isActive) {
            return res
               .status(200)
               .json({ success: true, message: 'Print simulation is on!' })
         } else {
            const labelTemplate = cartItem.operationConfig.labelTemplate

            const printerId =
               station.defaultLabelPrinterId ||
               station.attachedLabelPrinters[0].printNodeId

            const DATA_HUB = await get_env('DATA_HUB')
            const url = new URL(DATA_HUB).origin + '/template/'
            const template = `{"name":"${labelTemplate.name}","type":"label","format":"pdf"}`

            await client.request(PRINT_JOB, {
               printerId,
               source: 'Admin',
               contentType: 'pdf_uri',
               url: `${url}?template=${template}&data={"id":${id}}`,
               title: `Order ${
                  cartItem.levelType === 'orderItem' ? 'Product' : 'Sachet'
               }: ${cartItem.displayName}`
            })

            return res.status(200).json({
               success: true,
               message: `Printing ${
                  cartItem.levelType === 'orderItem' ? 'Product' : 'Sachet'
               }: ${cartItem.displayName} label!`
            })
         }
      }
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

const PRINT_SETTINGS = `
   query settings(
      $identifier: String_comparison_exp!
      $app: String_comparison_exp!
   ) {
      settings: settings_appSettings(
         where: { app: $app, identifier: $identifier }
      ) {
         id
         isActive: value(path: "isActive")
      }
   }
`

const PRINT_JOB = `
   mutation createPrintJob(
      $contentType: String!
      $printerId: Int!
      $source: String!
      $title: String!
      $url: String!
   ) {
      createPrintJob(
         contentType: $contentType
         printerId: $printerId
         source: $source
         title: $title
         url: $url
      ) {
         message
         success
      }
   }
`

const CART_ITEM = `
   query cartItems($id: Int_comparison_exp!) {
      cartItems(where: { id: $id }) {
         id
         status
         levelType
         displayName
         processingName
         operationConfigId
         operationConfig {
            stationId
            station {
               id
               defaultLabelPrinter {
                  printNodeId
               }
               attachedLabelPrinters {
                  printNodeId
               }
            }
            labelTemplateId
            labelTemplate {
               id
               name
            }
         }
      }
   }
`
