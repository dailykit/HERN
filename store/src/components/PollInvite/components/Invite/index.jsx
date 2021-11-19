import React, { useState } from 'react'
import jwt from 'jsonwebtoken'
import { useToasts } from 'react-toast-notifications'
import axios from 'axios'
import { message, Result, Spin } from 'antd'
import { useMutation } from '@apollo/client'
import { Wrapper } from './styles'
import {
   Button,
   Modal,
   InviteThrough,
   CopyIcon,
   SocialShare
} from '../../../../components'
import { theme } from '../../../../theme'
import { useUser } from '../../../../Providers'
import {
   SEND_EMAIL,
   SEND_SMS,
   CREATE_EXPERIENCE_BOOKING_PARTICIPANT
} from '../../../../graphql'
import {
   useWindowDimensions,
   get_env,
   isNumeric,
   isClient,
   getDateWithTime
} from '../../../../utils'

export default function Invite({ experienceBooking, isPollClosed }) {
   const { addToast } = useToasts()
   const { width } = useWindowDimensions()
   const { state: userState } = useUser()
   const { user = {} } = userState
   const [isModalVisible, setIsModalVisible] = useState(false)
   const [inviteList, setInviteList] = useState([])
   const [isReset, setIsReset] = useState(false)
   const [isSendingEmail, setIsSendingEmail] = useState(false)
   const payload = {
      experienceBookingId: experienceBooking?.id,
      experienceBookingCartId: experienceBooking?.cartId,
      invitedBy: {
         name: user?.name,
         email: user?.email
      },
      cutoffDate: experienceBooking?.cutoffTime
   }
   const token = jwt.sign(payload, 'secret-key')

   //   mutation for creating experinceBookingParticipant
   const [createParticipant] = useMutation(
      CREATE_EXPERIENCE_BOOKING_PARTICIPANT,
      {
         onError: error => {
            console.error(error)
            setInviteList([])
            setIsReset(true)
            setIsSendingEmail(false)
            setIsModalVisible(false)
         }
      }
   )

   const [sendEmail] = useMutation(SEND_EMAIL, {
      onError: error => {
         console.log(error)
         addToast('Something went wrong!', { appearance: 'error' })
         setInviteList([])
         setIsReset(true)
         setIsSendingEmail(false)
         setIsModalVisible(false)
      }
   })
   const [sendSms, { loading: isSendingSms }] = useMutation(SEND_SMS, {
      onError: error => {
         console.log(error)
         addToast('Something went wrong!', { appearance: 'error' })
      }
   })

   const openModal = () => {
      setIsReset(false)
      setIsModalVisible(true)
   }

   const copyHandler = async () => {
      if (!isPollClosed) {
         navigator.clipboard
            .writeText(
               `${window.location.origin}/pollInviteResponse?token=${token}`
            )
            .then(
               function () {
                  message.success('Copied succesfully!')
               },
               function (err) {
                  message.error('Fail to copy!')
                  console.error('Async: Could not copy text: ', err)
               }
            )
      }
   }

   const sendInvitation = async () => {
      try {
         if (!isPollClosed) {
            setIsSendingEmail(true)
            await Promise.all(
               inviteList.map(async inviteAddress => {
                  const email = isNumeric(inviteAddress) ? null : inviteAddress
                  const phone = isNumeric(inviteAddress) ? inviteAddress : null
                  const {
                     data: { createExperienceBookingParticipant = {} } = {}
                  } = await createParticipant({
                     variables: {
                        object: {
                           experienceBookingId: experienceBooking?.id,
                           email,
                           phone,
                           childCart: {
                              data: {
                                 parentCartId: experienceBooking?.cartId
                              }
                           }
                        }
                     }
                  })
                  const inviteToken = jwt.sign(
                     {
                        ...payload,
                        participantId: createExperienceBookingParticipant?.id,
                        cartId: createExperienceBookingParticipant?.cartId,
                        invitee: {
                           name: '',
                           email,
                           phone
                        }
                     },
                     'secret-key'
                  )
                  if (isNumeric(inviteAddress)) {
                     await sendSms({
                        variables: {
                           message: `Hey ${user?.email} has invited you, Here are Invite details: Invite Url: ${window.location.origin}/pollInviteResponse?token=${inviteToken}`,
                           phone: `+91${inviteAddress}`
                        }
                     })
                  } else {
                     // getting header, main body and footer email template from template service
                     const template_variables = encodeURI(
                        JSON.stringify({
                           brandCustomerId: user?.brandCustomers[0].id,
                           bookingId: experienceBooking?.id,
                           pollInviteUrl: `${window.location.origin}/pollInviteResponse?token=${inviteToken}`
                        })
                     )
                     const header_template_options = encodeURI(
                        JSON.stringify({
                           path: '/stayin-folds/emails/GlobalEmailHeader/index.js',
                           format: 'html'
                        })
                     )
                     const body_template_options = encodeURI(
                        JSON.stringify({
                           path: '/stayin-folds/emails/PollInvitation/index.js',
                           format: 'html'
                        })
                     )
                     const body_template_options2 = encodeURI(
                        JSON.stringify({
                           path: '/emails/PollInvitation/index.js',
                           format: 'html'
                        })
                     )
                     const footer_template_options = encodeURI(
                        JSON.stringify({
                           path: '/stayin-folds/emails/GlobalEmailFooter/index.js',
                           format: 'html'
                        })
                     )
                     const base_url = 'https://testhern.dailykit.org'
                     const base_url2 = window.location.origin
                     const templateHeaderUrl = `${base_url}/template/?template=${header_template_options}&data=${template_variables}`
                     const templatebodyUrl = `${base_url2}/template/?template=${body_template_options2}&data=${template_variables}`
                     const templateFooterUrl = `${base_url}/template/?template=${footer_template_options}&data=${template_variables}`

                     const { data: headerHtml } = await axios.get(
                        templateHeaderUrl
                     )
                     const { data: bodyHtml } = await axios.get(templatebodyUrl)
                     const { data: FooterHtml } = await axios.get(
                        templateFooterUrl
                     )
                     const html = `${headerHtml}${bodyHtml}${FooterHtml}`
                     await sendEmail({
                        variables: {
                           emailInput: {
                              subject: `${user.fullName} SEND YOU A POLL FOR ${experienceBooking?.experience?.title} WITH ${experienceBooking?.experience?.experience_experts[0]?.expert?.fullName} ON STAYIN SOCIAL`,
                              to: inviteAddress,
                              from: get_env('NO_REPLY_EMAIL'),
                              html,
                              attachments: []
                           }
                        }
                     })
                  }
               })
            )
            addToast('Poll Invitation successfully send.', {
               appearance: 'success'
            })
            setInviteList([])
            setIsReset(true)
            setIsSendingEmail(false)
            setIsModalVisible(false)
         }
      } catch (error) {
         setInviteList([])
         setIsReset(true)
         setIsSendingEmail(false)
         setIsModalVisible(false)
      }
   }

   return (
      <Wrapper
         disabled={isPollClosed}
         title={isPollClosed && 'Poll cutoff date has expired'}
      >
         <div className="invitation-div">
            <div className="invite-msg-div">
               <Button
                  className="customBtn text6"
                  onClick={copyHandler}
                  disabled={isPollClosed}
               >
                  <span>
                     <CopyIcon
                        size={theme.sizes.h4}
                        color={theme.colors.textColor4}
                     />
                  </span>
                  Copy Poll Invite
               </Button>
            </div>
            <div style={{ margin: '1rem 0' }}>
               <SocialShare
                  url={`${
                     isClient ? window.location.origin : ''
                  }/pollInviteResponse?token=${token}`}
                  title="Poll Invitation"
                  quote={`${experienceBooking?.experienceBookingOptions[0]?.experienceClass?.experience?.title} Poll Invite`}
                  hashtag="#pollInvite"
               />
            </div>
            <p className="or">OR</p>
            <Button
               disabled={isPollClosed}
               onClick={openModal}
               className="customBtn text6"
            >
               Invite via Email & Phone
            </Button>
         </div>
         <Modal
            isOpen={isModalVisible}
            close={() => setIsModalVisible(false)}
            showActionButton={!isSendingEmail || !isSendingSms}
            actionButtonTitle="Send Invite"
            actionHandler={sendInvitation}
            disabledActionButton={
               isSendingEmail || isSendingSms || inviteList.length === 0
            }
         >
            {isSendingEmail || isSendingSms ? (
               <Result
                  icon={<Spin size="large" />}
                  title="Processing"
                  subTitle="Please wait while we are sending your email."
               />
            ) : (
               <InviteThrough
                  isReset={isReset}
                  onChange={list => setInviteList(list)}
               />
            )}
         </Modal>
      </Wrapper>
   )
}
