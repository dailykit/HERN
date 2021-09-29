import axios from 'axios'
import { uploadFile } from '../../utils'
import moment from 'moment'
const fileType = require('file-type')
import {
   EXPERIENCE_CLASS_INFO,
   SEND_EMAIL,
   CREATE_INVITE,
   CREATE_WORKSPACE_METADATA,
   WORKSPACE_RECORDINGS,
   WORKSPACE_RECORDING_METADATA,
   WORKSPACE_CHATS,
   WORKSPACE_USERS,
   UPDATE_EXPERIENCE_BOOKING_PARTICIPANTS,
   CUSTOMER
} from './graphql'
import { client } from '../../lib/graphql'
import { getDuration, getDateIntArray } from '../../utils'

export const experienceBookingEmail = async (req, res) => {
   try {
      const { id, experienceBookingId, email, rsvp } = req.body.event.data.new
      console.log('body', req.body.event.data.new)
      const ohyay_userId = req.header('ohyay_userId')
      const noReplyEmail = req.header('no_reply_email')
      if (email && rsvp) {
         const { experiences_experienceClass: experienceClass = [] } =
            await client.request(EXPERIENCE_CLASS_INFO, {
               where: {
                  experienceBookings: {
                     id: {
                        _eq: experienceBookingId
                     }
                  }
               }
            })
         const { customers = [] } = await client.request(CUSTOMER, {
            experienceBookingId
         })
         const [organizer] = customers
         console.log('Organizer', organizer, customers)
         console.log('experience:', experienceClass)
         const { ohyay_createInvites } = await client.request(CREATE_INVITE, {
            userId: ohyay_userId,
            wsid: experienceClass[0].ohyay_wsid,
            invites: [{}]
         })
         console.log('invites:', ohyay_createInvites)
         if (ohyay_createInvites.inviteUrl.length > 0) {
            const { sendEmail } = await client.request(SEND_EMAIL, {
               emailInput: {
                  subject: `${experienceClass[0].experience.title} Booking URL`,
                  to: email,
                  from: noReplyEmail,
                  html: `<h2>Hey Your Booking URL for the ${experienceClass[0].experience.title} experience is given below </h2><br><p>Experince Class joining url:${ohyay_createInvites.inviteUrl[0]}</p>`,
                  attachments: []
               },
               inviteInput: {
                  start: getDateIntArray(experienceClass[0].startTimeStamp),
                  duration: getDuration(experienceClass[0].duration),
                  title: experienceClass[0].experience.title,
                  description: experienceClass[0].experience.description,
                  url: ohyay_createInvites.inviteUrl[0],
                  status: 'CONFIRMED',
                  busyStatus: 'BUSY',
                  organizer: {
                     name: 'Admin',
                     email: organizer.email
                  }
               }
            })
            console.log('sendEmail:', sendEmail)
            if (sendEmail.success) {
               return res.status(200).json({
                  success: true,
                  message: `Successfully send the booking url`
               })
            }
         }
      }
   } catch (error) {
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}

export const storeWorkspaceMetaDetails = async (req, res) => {
   try {
      const { wsid } = req.body
      const userId = req.header('ohyay_userId')
      // const { id, experienceBookingId, email, rsvp } = req.body.event.data.new
      const { ohyay_workspaceRecordings: recordings = [] } =
         await client.request(WORKSPACE_RECORDINGS, {
            userId,
            wsid
         })
      const { ohyay_workspaceChats: { chats = [] } = {} } =
         await client.request(WORKSPACE_CHATS, {
            userId,
            wsid
         })
      const { ohyay_workspaceUsers: usersList = [] } = await client.request(
         WORKSPACE_USERS,
         {
            userId,
            wsid
         }
      )
      const updatedParticipants = await Promise.all(
         usersList.map(async user => {
            try {
               const {
                  updateExperienceBookingParticipants: { returning = [] } = {}
               } = await client.request(
                  UPDATE_EXPERIENCE_BOOKING_PARTICIPANTS,
                  {
                     email: user.email,
                     _set: {
                        ohyay_userId: user.userId
                     }
                  }
               )
               return returning[0]
            } catch (error) {
               console.log(error)
            }
         })
      )

      const recordingMetaData = await Promise.all(
         recordings.map(async recording => {
            try {
               const { ohyay_workspaceRecordingMetaData: metaData = {} } =
                  await client.request(WORKSPACE_RECORDING_METADATA, {
                     userId,
                     wsid,
                     recordingId: recording.recordingId
                  })
               return metaData
            } catch (error) {
               console.log(error)
            }
         })
      )

      recordingMetaData.forEach(async rec => {
         const addedMetaDataList = await Promise.all(
            rec.emojis.map(async emoji => {
               try {
                  const { createWorkspaceMetaData = {} } = await client.request(
                     CREATE_WORKSPACE_METADATA,
                     {
                        object: {
                           ohyay_userId: emoji.userId,
                           emoji: emoji.emoji,
                           emojiCount: emoji.count,
                           emojiTimestamp: moment(emoji.timestamp).toISOString()
                        }
                     }
                  )
                  return createWorkspaceMetaData
               } catch (error) {
                  console.log(error)
               }
            })
         )
         console.log('createWorkspaceMetaData', addedMetaDataList)
      })

      const uploadedData = await Promise.all(
         recordings.map(async recording => {
            try {
               const response = await axios.get(recording.downloadUrl, {
                  responseType: 'arraybuffer'
               })
               const buffer = response.data
               let type = await fileType.fromBuffer(buffer)
               const timestamp = Date.now().toString()
               let name = `videos/recording/recording-${timestamp}`
               const data = await uploadFile(buffer, name, type)
               return data
            } catch (error) {
               console.log(error)
            }
         })
      )

      return res.json({
         success: true,
         usersList,
         recordings,
         chats,
         recordingMetaData,
         uploadedData
      })
   } catch (error) {
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}
