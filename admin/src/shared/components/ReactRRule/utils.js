const doubleDigit = number => {
   if (number.toString().length === 1) {
      number = '0' + number
   }
   return number
}

export const getUTCDate = date => {
   const d = new Date(date)
   return new Date(
      Date.UTC(
         d.getUTCFullYear(),
         d.getUTCMonth(),
         d.getUTCDate(),
         d.getUTCHours(),
         d.getUTCMinutes(),
         d.getUTCSeconds()
      )
   )
}

const getFreqNumber = freq => {
   switch (freq) {
      case 'YEARLY':
         return 0
      case 'MONTHLY':
         return 1
      case 'WEEKLY':
         return 2
      case 'DAILY':
         return 3
      case 'HOURLY':
         return 4
      case 'MINUTELY':
         return 5
      case 'SECONDLY':
         return 6
      default:
         return 1
   }
}

const getFreq = freq => {
   switch (freq) {
      case 0:
         return 'YEARLY'
      case 1:
         return 'MONTHLY'
      case 2:
         return 'WEEKLY'
      case 3:
         return 'DAILY'
      case 4:
         return 'HOURLY'
      case 5:
         return 'MINUTELY'
      case 6:
         return 'SECONDLY'
      default:
         return 'MONTHLY'
   }
}

const getWkstNumber = wkst => {
   switch (wkst) {
      case 'MO':
         return 0
      case 'TU':
         return 1
      case 'WE':
         return 2
      case 'TH':
         return 3
      case 'FR':
         return 4
      case 'SA':
         return 5
      case 'SU':
         return 6
      default:
         return 0
   }
}

const getWkst = wkst => {
   switch (wkst) {
      case 0:
         return 'MO'
      case 1:
         return 'TU'
      case 2:
         return 'WE'
      case 3:
         return 'TH'
      case 4:
         return 'FR'
      case 5:
         return 'SA'
      case 6:
         return 'SU'
      default:
         return 'MO'
   }
}

const getByweekday = byweekday => {
   // if (byweekday.length > 1) {
   return byweekday.map(day => `${day}`)
   // } else {
   //   return `RRule.${byweekday[0]}`
   // }
}

export const getPSQLRule = rule => {
   const master = {}
   const object = { ...rule }

   delete object.dtstart
   delete object.until

   object.freq = getFreq(object.freq)
   object.wkst = getWkst(object.wkst)

   if (!object.count.toString().trim()) {
      object.count = 60
   } else {
      object.count = +object.count
   }

   if (!object.interval.toString().trim()) {
      object.interval = 1
   } else {
      object.interval = +object.interval
   }

   if (object.freq === 'DAILY') {
      delete object.byweekday
   }

   if (object.byweekday?.length) {
      object.byday = getByweekday(object.byweekday)
      delete object.byweekday
   }

   master.rrule = object

   if (rule.dtstart) {
      master.dtstart = `${rule.dtstart.getFullYear()}-${doubleDigit(
         rule.dtstart.getMonth() + 1
      )}-${doubleDigit(rule.dtstart.getDate())}`
   }
   if (rule.until) {
      master.dtend = `${rule.until.getFullYear()}-${doubleDigit(
         rule.until.getMonth() + 1
      )}-${doubleDigit(rule.until.getDate())}`
   }
   return master
}

export const reversePSQLObject = value => {
   let obj = {}
   if (value.dtstart) {
      obj.dtstart = value.dtstart
   }
   if (value.dtend) {
      obj.until = value.dtend
   }
   obj = Object.assign(obj, value.rrule)
   if (obj.byday) {
      obj.byweekday = obj.byday
      delete obj.byday
   }
   obj.wkst = getWkstNumber(obj.wkst)
   obj.freq = getFreqNumber(obj.freq)
   delete obj.text
   return obj
}
