/*

dataset = {
    from: date,
    to: date,
    data:[]
}


timeUnit = 'month' || 'day' || 'hour' (groupBy)

key to be need in each generated data object with default value
keys = {
    a:defaultValue,
    b:defaultValue,
}

isCompare --> need data with compare extension
*/

/*use case
 admin\src\shared\components\Reports\ReportTiles\Customers\Tunnels\customerOverTime.js
*/
import moment from 'moment'

const DataGeneratorBetweenToDates = (
   dataset,
   timeUnit,
   keys,
   isCompare = false
) => {
   const { from, to, data } = dataset
   const type = isCompare ? 'past' : 'present'
   const dataKeys = Object.keys(keys)
   if (timeUnit == 'hour') {
      let hourBundle = [] // contain generated data
      let startHourWithDate = from
      let uniqueId = 1
      //loop use to create a number of data (newBundle) per hour between 'from' to 'to' date
      while (startHourWithDate.diff(to, 'hours') <= 0) {
         //data in needed format
         let newBundle = {
            uniqueId: uniqueId,
            [type]: moment(from).format(),
         }
         dataKeys.forEach(x => {
            newBundle[x + type] = keys[x]
         })
         hourBundle.push(newBundle)
         startHourWithDate = startHourWithDate.add(1, 'hour')
         uniqueId++
      }

      /*create date in available data to easily differentiate when have same hour ex. 14 from 15-12-2020 and 14 from 14-11-2021*/
      const dataForHourWithDate = data.map(each => {
         let newDate = `${each.year}-${each.month}-${each.day}`
         each[type] = newDate
         return each
      })
      //merging process
      dataForHourWithDate.forEach(eachData => {
         //check, where available data's day and hour match
         const matchIndex = hourBundle.findIndex(eachHour => {
            return (
               moment(eachHour[type]).isSame(eachData[type], 'day') &&
               moment(eachHour[type]).format('HH') == eachData.hour
            )
         })
         //if match not found then matchIndex = -1 else...
         if (matchIndex >= 0) {
            dataKeys.forEach(x => {
               hourBundle[matchIndex][x + type] += eachData[x]
            })
         }
      })
      return hourBundle
   } else if (timeUnit == 'day') {
      let daysBundle = []
      let startDate = from
      let uniqueId = 1
      while (startDate.diff(to, 'days') <= 0) {
         const newBundle = {
            uniqueId: uniqueId,
            [type]: moment(startDate).format(),
         }
         dataKeys.forEach(x => {
            newBundle[x + type] = keys[x]
         })
         daysBundle.push(newBundle)
         startDate = startDate.add(1, 'day')
         uniqueId++
      }

      const dataWithDate = data.map(eachData => {
         let newDate = `${eachData.year}-${eachData.month}-${eachData.day}`
         eachData[type] = newDate
         return eachData
      })
      dataWithDate.forEach(eachData => {
         const matchIndex = daysBundle.findIndex(eachDay =>
            moment(eachDay[type]).isSame(eachData[type])
         )
         if (matchIndex >= 0) {
            dataKeys.forEach(x => {
               daysBundle[matchIndex][x + type] += eachData[x]
            })
         }
      })
      return daysBundle
   } else if (timeUnit == 'week') {
      let weekBundle = []
      let startWeek = from
      let uniqueId = 1
      while (startWeek.diff(to, 'weeks') <= 0) {
         const newBundle = {
            uniqueId: uniqueId,
            [type]: moment(startWeek).format(),
            weekNumber: moment(startWeek).format('WW'),
         }
         dataKeys.forEach(x => {
            newBundle[x + type] = keys[x]
         })
         weekBundle.push(newBundle)
         startWeek = startWeek.add(1, 'week').startOf('isoWeek')
         uniqueId++
      }
      data.forEach(eachData => {
         const matchIndex = weekBundle.findIndex(
            eachWeek =>
               moment(eachWeek[type]).format('YYYY') == eachData.year &&
               eachWeek.weekNumber == eachData.week
         )
         if (matchIndex >= 0) {
            dataKeys.forEach(x => {
               weekBundle[matchIndex][x + type] += eachData[x]
            })
         }
      })
      return weekBundle
   } else {
      let monthsBundle = []
      let startMonth = from
      let uniqueId = 1
      //create an array for group with year, month with data count and total call monthBundle
      while (startMonth.diff(to, 'months') <= 0) {
         const newBundle = {
            uniqueId: uniqueId,
            [type]: moment(startMonth).format(),
         }
         dataKeys.forEach(x => {
            newBundle[x + type] = keys[x]
         })
         monthsBundle.push(newBundle)
         startMonth = startMonth.add(1, 'month')
         uniqueId++
      }

      //in a monthBundle change to month data which has some value by dataForMonths
      data.forEach(eachData => {
         const matchIndex = monthsBundle.findIndex(
            eachMonth =>
               moment(eachMonth[type]).isSame(eachData[type], 'year') &&
               moment(eachMonth[type]).format('MM') == eachData.month
         )
         if (matchIndex >= 0) {
            dataKeys.forEach(x => {
               monthsBundle[matchIndex][x + type] += eachData[x]
            })
         }
      })
      return monthsBundle
   }
}
export default DataGeneratorBetweenToDates
