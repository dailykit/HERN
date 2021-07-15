import unflatten from 'unflatten'
import { isObject } from './isObject'
import { dateFmt } from './dateFmt'

const _dateMatcher = new RegExp(/created_at|date|month|year/i)

export const buildOptions = (object, prefix = '') => {
   let result = {}

   if (Object.keys(object).some(key => key.startsWith('_'))) {
      const temp = prefix.trim()
      result[temp] = object
   } else
      Object.keys(object).forEach(key => {
         const tempKey = `${prefix} ${key}`.trim()
         if (!isObject(object[key])) {
            if (key !== '__typename') {
               result[tempKey] = object[key]
            }
         } else {
            const otherResults = buildOptions(object[key], `${prefix} ${key} `)
            result = { ...otherResults, ...result }
         }
      })

   return result
}

export const buildOptionVariables = data => {
   return unflatten(data, { separator: '  ' })
}

export function flattenObject(object) {
   let result = {}
   Object.keys(object).forEach(key => {
      if (!isObject(object[key])) {
         if (key !== '__typename') {
            if (_dateMatcher.test(key)) {
               result[key] = dateFmt.format(new Date(object[key]))
            } else result[key] = object[key]
         }
      } else {
         const otherResults = flattenObject(object[key])
         result = { ...otherResults, ...result }
      }
   })

   return result
}

function flattenQuery(entities) {
   const results = []
   if (entities.nodes && Array.isArray(entities.nodes))
      entities.nodes.forEach(node => {
         let result = {}
         if (!isObject(node)) {
            if (node !== '__typename') result[node] = node
         } else {
            const temp = flattenObject(node)
            result = { ...result, ...temp }
         }

         results.push(result)
      })

   return results
}

/**
 * Transforms the gql query response to use for tabulator data and chart data
 *
 * @param {string} queryResponse
 * @param {string} queryName
 * @returns {Array} flattened query response
 *
 * **Usage**
 *
 * ```js
 * transformer(query, 'queryName')
 * ```
 */
export const transformer = (queryResponse, nodeKey) => {
   const entities = queryResponse[nodeKey] || {}
   const result = flattenQuery(entities)

   return result
}
