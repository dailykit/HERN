/**
 *
 * convert a value from a given range to a value of a certain range.
 * old{Base,High} - is the old range [oldBase..oldHigh]
 * new{Base,newHigh} - is the new range [newBase..newHigh]
 *
 * https://www.gamedev.net/forums/topic/432454-convert-value-in-arbitrary-range-to-a-0-100-range/
 *
 * @param {number} oldBase
 * @param {number} oldHigh
 * @param {number} value
 * @param {number} newBase
 * @param {number} newHigh
 */
export const convertRange = (
   oldBase,
   oldHigh,
   value,
   newBase = 0,
   newHigh = 100
) => {
   const multiplier = (newHigh - newBase) / (oldHigh - oldBase)
   return (value - oldBase) * multiplier + newBase
}
