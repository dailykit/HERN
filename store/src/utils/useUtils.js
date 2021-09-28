import moment from 'moment'
import { get_env } from './get_env'

export const getCurrencySymbol = () => {
   var currency_symbols = {
      USD: '$', // US Dollar
      EUR: '€', // Euro
      CRC: '₡', // Costa Rican Colón
      GBP: '£', // British Pound Sterling
      ILS: '₪', // Israeli New Sheqel
      INR: '₹', // Indian Rupee
      JPY: '¥', // Japanese Yen
      KRW: '₩', // South Korean Won
      NGN: '₦', // Nigerian Naira
      PHP: '₱', // Philippine Peso
      PLN: 'zł', // Polish Zloty
      PYG: '₲', // Paraguayan Guarani
      THB: '฿', // Thai Baht
      UAH: '₴', // Ukrainian Hryvnia
      VND: '₫' // Vietnamese Dong
   }
   return currency_symbols[get_env('CURRENCY')]
}
export const currency = getCurrencySymbol(get_env('CURRENCY'))

export const getDate = date => {
   return moment.utc(date).format('MMM DD, YYYY')
}

export const getTime = time => {
   return moment.utc(time).format('hh:mm A')
}

export const getDateWithTime = date => {
   return moment.utc(date).format('MMM DD, YYYY, hh:mm A')
}

export const getTimeStamp = date => {
   const updatedDate = date.toString().replace(/[+-]\w+/g, '')
   return new Date(updatedDate).toISOString()
}

export const getMinute = time => {
   return moment.duration(time).asMinutes()
}

export const isExpired = (firstDate, secondDate) => {
   // it checks if the first date is less than or equal to the second date
   return moment(firstDate).isSameOrBefore(moment(secondDate))
}

export const omitDate = (baseDate = new Date(), amount, unit) => {
   return moment(baseDate).add(amount, unit).toISOString()
}

export const getAvailableSlots = classes => {
   const availableSlots = []
   classes.forEach(expCls => {
      const datesArrIndex = availableSlots.findIndex(
         obj => getDate(obj.date) === getDate(expCls.startTimeStamp)
      )
      if (datesArrIndex === -1) {
         availableSlots.push({
            id: expCls.id,
            date: getDate(expCls.startTimeStamp),
            slots: [
               {
                  id: expCls.id,
                  date: getDate(expCls.startTimeStamp),
                  time: getTime(expCls.startTimeStamp),
                  isBooked: expCls.isBooked,
                  isActive: expCls.isActive
               }
            ]
         })
      } else {
         availableSlots[datesArrIndex] = {
            ...availableSlots[datesArrIndex],
            slots: [
               ...availableSlots[datesArrIndex].slots,
               {
                  id: expCls.id,
                  time: getTime(expCls.startTimeStamp),
                  date: getDate(expCls.startTimeStamp),
                  isBooked: expCls.isBooked,
                  isActive: expCls.isActive
               }
            ]
         }
      }
   })
   return availableSlots
}

const browserVersion = (userAgent, regex) => {
   return userAgent.match(regex) ? userAgent.match(regex)[2] : null
}

const getBrowser = () => {
   const userAgent = navigator.userAgent
   let browser = 'unkown'
   // Detect browser name
   browser = /ucbrowser/i.test(userAgent) ? 'UCBrowser' : browser
   browser = /edg/i.test(userAgent) ? 'Edge' : browser
   browser = /googlebot/i.test(userAgent) ? 'GoogleBot' : browser
   browser = /chromium/i.test(userAgent) ? 'Chromium' : browser
   browser =
      /firefox|fxios/i.test(userAgent) && !/seamonkey/i.test(userAgent)
         ? 'Firefox'
         : browser
   browser =
      /; msie|trident/i.test(userAgent) && !/ucbrowser/i.test(userAgent)
         ? 'IE'
         : browser
   browser =
      /chrome|crios/i.test(userAgent) &&
      !/opr|opera|chromium|edg|ucbrowser|googlebot/i.test(userAgent)
         ? 'Chrome'
         : browser
   browser =
      /safari/i.test(userAgent) &&
      !/chromium|edg|ucbrowser|chrome|crios|opr|opera|fxios|firefox/i.test(
         userAgent
      )
         ? 'Safari'
         : browser
   browser = /opr|opera/i.test(userAgent) ? 'Opera' : browser
   // detect browser version
   switch (browser) {
      case 'UCBrowser':
         return `${browser}/${browserVersion(
            userAgent,
            /(ucbrowser)\/([\d\.]+)/i
         )}`
      case 'Edge':
         return `${browser}/${browserVersion(
            userAgent,
            /(edge|edga|edgios|edg)\/([\d\.]+)/i
         )}`
      case 'GoogleBot':
         return `${browser}/${browserVersion(
            userAgent,
            /(googlebot)\/([\d\.]+)/i
         )}`
      case 'Chromium':
         return `${browser}/${browserVersion(
            userAgent,
            /(chromium)\/([\d\.]+)/i
         )}`
      case 'Firefox':
         return `${browser}/${browserVersion(
            userAgent,
            /(firefox|fxios)\/([\d\.]+)/i
         )}`
      case 'Chrome':
         return `${browser}/${browserVersion(
            userAgent,
            /(chrome|crios)\/([\d\.]+)/i
         )}`
      case 'Safari':
         return `${browser}/${browserVersion(
            userAgent,
            /(safari)\/([\d\.]+)/i
         )}`
      case 'Opera':
         return `${browser}/${browserVersion(
            userAgent,
            /(opera|opr)\/([\d\.]+)/i
         )}`
      case 'IE':
         const version = browserVersion(userAgent, /(trident)\/([\d\.]+)/i)
         // IE version is mapped using trident version
         // IE/8.0 = Trident/4.0, IE/9.0 = Trident/5.0
         return version
            ? `${browser}/${parseFloat(version) + 4.0}`
            : `${browser}/7.0`
      default:
         return `unknown/0.0.0.0`
   }
}

export const isKeycloakSupported = () => {
   const [browser, version] = getBrowser().split('/')
   console.log({ browser, version })
   const v = +version.split('.')[0]
   const { userAgent } = window.navigator
   if (userAgent.includes('Mac') || userAgent.includes('Apple')) {
      return false
   }
   if (browser === 'Chrome' && v >= 66) {
      return true
   } else if (browser === 'Firefox' && v >= 60) {
      return true
   } else {
      return false
   }
}

export const isClient =
   typeof window !== 'undefined' && window.document ? true : false

export const isEmpty = value => {
   return (
      value === undefined ||
      value === null ||
      value === NaN ||
      (typeof value === 'object' && Object.keys(value).length === 0) ||
      (typeof value === 'string' && value.trim().length === 0)
   )
}

export const formatCurrency = (input = 0) => {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: get_env('CURRENCY')
   }).format(input)
}

export const createDataTree = ({ dataset, rootIdKeyName, parentIdKeyName }) => {
   const hashTable = Object.create(null)
   dataset.forEach(
      aData =>
         (hashTable[aData[rootIdKeyName]] = {
            ...aData,
            childNodes: [],
            isChildOpen: false
         })
   )
   const dataTree = []
   dataset.forEach(aData => {
      if (aData[parentIdKeyName]) {
         console.log(hashTable[aData[parentIdKeyName]])
         hashTable[aData[parentIdKeyName]].isChildOpen = true
         hashTable[aData[parentIdKeyName]].childNodes.push(
            hashTable[aData[rootIdKeyName]]
         )
      } else {
         dataTree.push(hashTable[aData[rootIdKeyName]])
      }
   })
   return dataTree
}

export function isNumeric(str) {
   if (typeof str != 'string') return false // we only process strings!
   return (
      !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
   ) // ...and ensure strings of whitespace fail
}
export function IsEmailValid(email) {
   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isPhoneNumberValid(input) {
   var phoneno = /^\d{10}$/
   if (input.match(phoneno)) {
      return true
   } else {
      return false
   }
}

export function getDigitLength(number) {
   return number.toString().length
}

export const replaceSpaceChar = (string, replaceBy = '') => {
   if (!string) return string
   return string.trim().replaceAll(' ', replaceBy)
}
