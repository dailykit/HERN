import { Expo } from 'expo-server-sdk'

let expo = new Expo()

export const sendExpoNotification = async notificationData => {
   const { notificationTokens, title, body, data } = notificationData
   // Create the messages that you want to send to clients
   let messages = []
   for (let pushToken of notificationTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
         console.error(`Push token ${pushToken} is not a valid Expo push token`)
         continue
      }

      messages.push({
         to: pushToken,
         sound: 'default',
         body: body,
         data: data,
         title: title
      })
   }

   let chunks = expo.chunkPushNotifications(messages)
   let tickets = []

   for (let chunk of chunks) {
      try {
         let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
         tickets.push(...ticketChunk)
      } catch (error) {
         console.error(error)
         return {
            status: 'error',
            message: error
         }
      }
   }

   let receiptIds = []
   for (let ticket of tickets) {
      if (ticket.id) {
         receiptIds.push(ticket.id)
      }
   }

   let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds)

   for (let chunk of receiptIdChunks) {
      try {
         let receipts = await expo.getPushNotificationReceiptsAsync(chunk)
         for (let receiptId in receipts) {
            let { status, message, details } = receipts[receiptId]
            if (status === 'ok') {
               continue
            } else if (status === 'error') {
               console.error(
                  `There was an error sending a notification: ${message}`
               )
               if (details && details.error) {
                  console.error(`The error code is ${details.error}`)
               }
            }
         }
      } catch (error) {
         console.error(error)
         return {
            status: 'error',
            message: error
         }
      }
   }
   return {
      status: 'ok',
      message: 'Notification has been sent'
   }
}
