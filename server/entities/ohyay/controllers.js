import axios from 'axios'
import { client } from '../../lib/graphql'
import {
   EXPERIENCE_INFO,
   CLONE_WORKSPACE,
   UPDATE_EXPERIENCE_CLASS,
   EXPERIENCE_CLASS_INFO,
   CREATE_INVITE
} from './graphql'

export const cloneWorkspace = async (req, res) => {
   try {
      const { id, experienceId } = req.body.event.data.new
      const ohyay_userId = req.header('ohyay_userId')
      const ohyay_region = req.header('ohyay_region')
      const { experiences_experience_by_pk: experience } = await client.request(
         EXPERIENCE_INFO,
         {
            id: experienceId
         }
      )

      if (experience && experience.ohyay_wsid) {
         const { ohyay_cloneWorkspace: cloneWorkspace } = await client.request(
            CLONE_WORKSPACE,
            {
               cloneWorkspaceInp: {
                  userId: ohyay_userId,
                  wsid: experience.ohyay_wsid,
                  region: ohyay_region,
                  title: `experienceClass-${id}`
               }
            }
         )
         if (cloneWorkspace && cloneWorkspace.wsid) {
            const {
               update_experiences_experienceClass_by_pk: updatedExperience
            } = await client.request(UPDATE_EXPERIENCE_CLASS, {
               id,
               ohyay_wsid: cloneWorkspace.wsid
            })
            if (updatedExperience) {
               return res.status(200).json({
                  success: true,
                  message: `Successfully cloned workspace:${experience.ohyay_wsid}`
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

export const createInvite = async (req, res) => {
   try {
      const { id, experienceClassId, parentCartId } = req.body.event.data.new
      console.log('req', req.body.event.data.new)
      if (parentCartId === null) {
         const { experiences_experienceClass_by_pk: experienceClass } =
            await client.request(EXPERIENCE_CLASS_INFO, {
               id: experienceClassId
            })
         if (experienceClass) {
            const { ohyay_createInvites } = await client.request(
               CREATE_INVITE,
               {
                  userId: ohyay_userId,
                  wsid: experienceClass.ohyay_wsid,
                  invites: [{}, {}]
               }
            )
            console.log('Invite links', ohyay_createInvites.inviteUrl)
         }
      }
   } catch (error) {
      return res.status(400).json({
         success: false,
         message: error.message
      })
   }
}
