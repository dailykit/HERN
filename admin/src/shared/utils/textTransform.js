/**
 *
 * @param {string} string
 */
export const fromSnakeCase = string => {
   return string.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())
}

/**
 *
 * @param {string} string
 */
// prettier-ignore
export const fromCamelCase = string => {
   return string.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

/**
 *
 * @param {string} string
 */
// prettier-ignore
export const fromMixed = string => {
   return string.split(' ').map(string => fromCamelCase(fromSnakeCase(string))).join(' ').trim()
}
