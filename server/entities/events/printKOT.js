import axios from 'axios'
import { uniq, uniqBy } from 'lodash'
import get_env from '../../../get_env'
import { client } from '../../lib/graphql'

export const printKOT = async (req, res) => {
   try {
      const { id = '', status = '' } = req.body.event.data.new

      if (status !== 'ORDER_UNDER_PROCESSING')
         return res.status(200).json({
            success: true,
            message: 'Not valid for this order status!'
         })

      const { settings = [] } = await client.request(SETTINGS, {
         type: {
            _eq: 'kot'
         }
      })

      const printAutomatically = settings.find(
         node => node.identifier === 'print automatically'
      ).value

      if (
         printAutomatically.isActive ||
         Object.keys(req.body.event.data.new).length === 2
      ) {
         const DATA_HUB = await get_env('DATA_HUB')
         const { data: { data = {}, success } = {} } = await axios.get(
            `${new URL(DATA_HUB).origin}/server/api/kot-urls?id=${id}`
         )

         if (success) {
            await Promise.all(
               data.map(async node => {
                  await print_job(
                     node.url,
                     `KOT for ORD#${id}`,
                     node.printer.id
                  )
               })
            )
         }
         return res
            .status(200)
            .json({ success: true, message: 'Successfully printed KOT!' })
      }
      return res
         .status(200)
         .json({ success: true, message: 'Print automation is turned off!' })
   } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
   }
}

const print_job = async (url, title, printerId) => {
   await client.request(PRINT_JOB, {
      url,
      title,
      printerId,
      source: 'Admin',
      contentType: 'pdf_uri'
   })
   return
}

export const getKOTUrls = async (req, res) => {
   try {
      const { id } = req.query
      const { settings = [] } = await client.request(SETTINGS, {
         type: {
            _eq: 'kot'
         }
      })

      if (settings.length === 0) throw Error('KOT settings are not available!')

      const groupByStation = settings.find(
         node => node.identifier === 'group by station'
      ).value

      const groupByProductType = settings.find(
         node => node.identifier === 'group by product type'
      ).value

      const defaultKotPrinter = settings.find(
         node => node.identifier === 'default kot printer'
      ).value

      const { cartItems = [] } = await client.request(CART_ITEMS)

      const data = { order: { id } }
      const DATA_HUB = get_env('DATA_HUB')
      const { origin } = new URL(DATA_HUB)

      const productStations = uniqBy(
         cartItems
            .filter(node => node.levelType === 'orderItem')
            .map(node => node.operationConfig),
         'station.id'
      )
         .filter(Boolean)
         .map(node => node.station)
      const sachetStations = uniqBy(
         cartItems
            .filter(node =>
               ['orderItemSachet', 'orderItemSachetComponent'].includes(
                  node.levelType
               )
            )
            .map(node => node.operationConfig),
         'station.id'
      )
         .filter(Boolean)
         .map(node => node.station)
      const productTypes = uniq(
         cartItems.map(node => node.productOptionType)
      ).filter(Boolean)

      const productTemplateOptions = encodeURI(
         JSON.stringify({
            name: 'product_kot1',
            type: 'kot',
            format: 'pdf'
         })
      )

      const sachetTemplateOptions = encodeURI(
         JSON.stringify({
            name: 'sachet_kot1',
            type: 'kot',
            format: 'pdf'
         })
      )

      const urlList = []

      if (groupByStation.isActive) {
         /*
            print product kot
         */
         if (groupByProductType.isActive) {
            /*
               group by stations = true x group by product type = true
                  station 13
                     mealkit
                     inventory
                     ready to eat
                  station 14
                     mealkit
                     inventory
                     ready to eat
            */
            let urls = []
            if (productStations.length > 0) {
               urls = productStations.map(station => {
                  return productTypes.map(type => {
                     const template_data = encodeURI(
                        JSON.stringify({
                           ...data,
                           product: { types: [type] },
                           station: { ids: [station.id] }
                        })
                     )
                     const url = `${origin}/template/?template=${productTemplateOptions}&data=${template_data}`

                     let printerId
                     if (station.defaultKotPrinterId) {
                        printerId = station.defaultKotPrinterId
                     } else if (station.kotPrinters.length > 0) {
                        const [printer] = station.kotPrinters
                        printerId = printer.id
                     } else if (
                        'printNodeId' in defaultKotPrinter &&
                        defaultKotPrinter.printNodeId
                     ) {
                        printerId = defaultKotPrinter.printNodeId
                     }

                     if (printerId) {
                        return { url, printer: { id: printerId } }
                     }
                     return
                  })
               })
            } else {
               urls = productTypes.map(type => {
                  const template_data = encodeURI(
                     JSON.stringify({
                        ...data,
                        product: { types: [type] },
                        station: { ids: [] }
                     })
                  )
                  const url = `${origin}/template/?template=${productTemplateOptions}&data=${template_data}`

                  let printerId
                  if (
                     'printNodeId' in defaultKotPrinter &&
                     defaultKotPrinter.printNodeId
                  ) {
                     printerId = defaultKotPrinter.printNodeId
                  }

                  if (printerId) {
                     return { url, printer: { id: printerId } }
                  }
                  return
               })
            }

            urlList.push(
               ...urls.reduce((acc, i) => acc.concat(i), []).filter(Boolean)
            )
         } else if (!groupByProductType.isActive) {
            /*
               group by stations = true x group by product type = false
                  station 13
                     mealkit x inventory x ready to eat
                  station 14
                     mealkit x inventory x ready to eat
            */

            let urls = []
            if (productStations.length > 0) {
               productStations.map(station => {
                  const template_data = encodeURI(
                     JSON.stringify({
                        ...data,
                        station: { ids: [station.id] },
                        product: { types: productTypes }
                     })
                  )
                  const url = `${origin}/template/?template=${productTemplateOptions}&data=${template_data}`

                  let printerId
                  if (station.defaultKotPrinterId) {
                     printerId = station.defaultKotPrinterId
                  } else if (station.kotPrinters.length > 0) {
                     const [printer] = station.kotPrinters
                     printerId = printer.id
                  } else if (
                     'printNodeId' in defaultKotPrinter &&
                     defaultKotPrinter.printNodeId
                  ) {
                     printerId = defaultKotPrinter.printNodeId
                  }

                  if (printerId) {
                     return { url, printer: { id: printerId } }
                  }
                  return
               })
            } else {
               const template_data = encodeURI(
                  JSON.stringify({
                     ...data,
                     station: { ids: [] },
                     product: { types: productTypes }
                  })
               )
               const url = `${origin}/template/?template=${productTemplateOptions}&data=${template_data}`

               let printerId
               if (
                  'printNodeId' in defaultKotPrinter &&
                  defaultKotPrinter.printNodeId
               ) {
                  printerId = defaultKotPrinter.printNodeId
               }

               if (printerId) {
                  urls = [{ url, printer: { id: printerId } }]
               }
            }

            urlList.push(
               ...urls.reduce((acc, i) => acc.concat(i), []).filter(Boolean)
            )
         }

         /*
            print mealk kit sachet kot
         */
         let urls = []
         if (sachetStations.length > 0) {
            urls = sachetStations.map(station => {
               const sachetTemplateData = encodeURI(
                  JSON.stringify({
                     ...data,
                     station: { ids: [station.id] }
                  })
               )
               const url = `${origin}/template/?template=${sachetTemplateOptions}&data=${sachetTemplateData}`

               let printerId
               if (station.defaultKotPrinterId) {
                  printerId = station.defaultKotPrinterId
               } else if (station.kotPrinters.length > 0) {
                  const [printer] = station.kotPrinters
                  printerId = printer.id
               } else if (
                  'printNodeId' in defaultKotPrinter &&
                  defaultKotPrinter.printNodeId
               ) {
                  printerId = defaultKotPrinter.printNodeId
               }

               if (printerId) {
                  return { url, printer: { id: printerId } }
               }
               return
            })
         } else {
            const sachetTemplateData = encodeURI(
               JSON.stringify({
                  ...data,
                  station: { ids: [] }
               })
            )
            const url = `${origin}/template/?template=${sachetTemplateOptions}&data=${sachetTemplateData}`

            let printerId
            if (
               'printNodeId' in defaultKotPrinter &&
               defaultKotPrinter.printNodeId
            ) {
               printerId = defaultKotPrinter.printNodeId
            }

            if (printerId) {
               urls = [{ url, printer: { id: printerId } }]
            }
         }

         urlList.push(...urls.filter(Boolean))
      } else if (!groupByStation.isActive) {
         /*
            print product kot
         */
         if (groupByProductType.isActive) {
            /*
               group by stations = false x group by product type = true
                  mealkit
                     station 13 x station 14 x ... x station N
                  inventory
                     station 13 x station 14 x ... x station N
                  ready to eat
                     station 13 x station 14 x ... x station N
            */

            const urls = productTypes.map(type => {
               const template_data = encodeURI(
                  JSON.stringify({
                     ...data,
                     product: { types: [type] },
                     station: { ids: productStations.map(node => node.id) }
                  })
               )
               const url = `${origin}/template/?template=${productTemplateOptions}&data=${template_data}`
               return url
            })

            if (defaultKotPrinter.printNodeId) {
               urlList.push(
                  ...urls.map(url => ({
                     url,
                     printer: { id: defaultKotPrinter.printNodeId }
                  }))
               )
            }
         } else if (!groupByProductType.isActive) {
            /*
               group by stations = false x group by product type = false
                  mealkit x inventory x ready to eat x station 13 x station 14 x ... x station N
            */

            const template_data = encodeURI(
               JSON.stringify({
                  ...data,
                  product: { types: productTypes },
                  station: { ids: productStations.map(node => node.id) }
               })
            )
            const url = `${origin}/template/?template=${productTemplateOptions}&data=${template_data}`

            if (defaultKotPrinter.printNodeId) {
               urlList.push({
                  url,
                  printer: { id: defaultKotPrinter.printNodeId }
               })
            }
         }

         /*
            print mealk kit sachet kot
         */

         const sachetTemplateData = encodeURI(
            JSON.stringify({
               ...data,
               station: { ids: productStations.map(node => node.id) }
            })
         )
         const url = `${origin}/template/?template=${sachetTemplateOptions}&data=${sachetTemplateData}`

         if (defaultKotPrinter.printNodeId) {
            urlList.push({
               url,
               printer: { id: defaultKotPrinter.printNodeId }
            })
         }
      }

      return res.status(200).json({ success: true, data: urlList })
   } catch (error) {
      console.log('getKOTUrls -> error', error)
      return res.status(400).json({ success: false, error: error.message })
   }
}

const SETTINGS = `
   query settings($type: String_comparison_exp!) {
      settings: settings_appSettings(where: { type: $type }) {
         id
         value
         identifier
      }
   }
`

const PRINT_JOB = `
   mutation createPrintJob(
      $url: String!
      $title: String!
      $printerId: Int!
      $source: String!
      $contentType: String!
   ) {
      createPrintJob(
         url: $url
         title: $title
         source: $source
         printerId: $printerId
         contentType: $contentType
      ) {
         message
         success
      }
   }
`

const CART_ITEMS = `
   query cartItems {
      cartItems(
         where: {
            levelType: {
               _in: ["orderItem", "orderItemSachet", "orderItemSachetComponent"]
            }
            cart: { orderId: { _is_null: false } }
         }
      ) {
         id
         operationConfigId
         operationConfig {
            stationId
            station {
               id
               name
               defaultKotPrinterId
               kotPrinters: attachedKotPrinters {
                  id: printNodeId
               }
            }
         }
         levelType
         productOptionType
      }
   }
`
