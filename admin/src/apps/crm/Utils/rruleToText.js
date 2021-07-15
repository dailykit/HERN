const rrule = require('rrule')
const capitalizeString = require('./capitalizeString')

const rRuleDay = customerRRule => {
   let day = ''
   if (customerRRule) {
      const rule = rrule?.RRule?.fromString(customerRRule)
      const text = rule?.toText()
      day = capitalizeString(text)
   }
   return day
}

export default rRuleDay
