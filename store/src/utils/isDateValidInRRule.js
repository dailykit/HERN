import moment from 'moment'

export const isDateValidInRRule = (rString, date = null) => {
   // const rString = "RRULE:FREQ=DAILY;COUNT=10;WKST=MO;BYDAY=MO,TU,WE,TH,SA";

   const rStringWithoutRRULE = rString.replace('RRULE:', '') // remove RRULE from string
   const rStringParamsArray = rStringWithoutRRULE.split(';') // split by ; remaining string

   // create an object which contain all params from string
   let rRuleParamObject = {}
   rStringParamsArray.forEach(eachParam => {
      const pair = keyValuePairFromString(eachParam)
      rRuleParamObject = { ...rRuleParamObject, ...pair }
   })
   // {FREQ: "DAILY", COUNT: "10", WKST: "MO", BYDAY: "MO,TU,WE,TH,SA"}
   let availableDays
   const dateToBeCheck = date
      ? moment(date).format('dd').toLocaleUpperCase()
      : moment().format('dd').toLocaleUpperCase()

   if (rRuleParamObject?.BYDAY) {
      availableDays = rRuleParamObject?.BYDAY.split(',')
   } else {
      if (rRuleParamObject.FREQ === 'DAILY') {
         availableDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
      } else {
         availableDays = [dateToBeCheck]
      }
   }

   // check current day code exist in available by day
   const indexOfCurrentDay = availableDays.indexOf(dateToBeCheck)
   if (indexOfCurrentDay === -1) {
      return false
   } else {
      return true
   }
}

// this fn will create an bject from string which conatin '='
// example
// companyName="HERN" --> {companyName:"HERN"}
const keyValuePairFromString = stringWithEqual => {
   const valueArray = stringWithEqual.split('=')
   const keyValueObj = {}
   keyValueObj[valueArray[0]] = valueArray[1]
   return keyValueObj
}
