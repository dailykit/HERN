import * as Sentry from '@sentry/react'

export const logger = error => {
   if (window._env_.NODE_ENV === 'development') {
      console.log(error)
   } else {
      Sentry.captureException(error)
   }
}
