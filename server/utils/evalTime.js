import moment from 'moment'

export const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

export const getDuration = string => {
   const duration = moment.duration(string)
   return {
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds()
   }
}

export const getDateIntArray = date => {
   const result = moment(date).toArray()
   result.splice(-1, 2)
   return result
}
