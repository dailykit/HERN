/**
 * checks is the passed object is an 'object' and constructed by Object.
 *
 * @param {{[string]: any}} object
 */

// Read more about constructor check: https://www.samanthaming.com/tidbits/94-how-to-check-if-object-is-empty/#why-do-we-need-an-additional-constructor-check

export const isObject = object => {
   return typeof object === 'object' && object?.constructor === Object
}
