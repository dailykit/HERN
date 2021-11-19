import React, { useState, useEffect } from 'react'
import jwt from 'jsonwebtoken'
import { useToasts } from 'react-toast-notifications'
import { useMutation } from '@apollo/client'
import { message, Result, Spin } from 'antd'
import axios from 'axios'
import { Wrapper } from './styles'
import {
   Button,
   Modal,
   InviteThrough,
   CopyIcon,
   SocialShare,
   SpinnerIcon
} from '../../../../components'
import { theme } from '../../../../theme'
import { useUser } from '../../../../Providers'
import {
   SEND_EMAIL,
   SEND_SMS,
   CREATE_EXPERIENCE_BOOKING_PARTICIPANT
} from '../../../../graphql'
import {
   get_env,
   isNumeric,
   isClient,
   getDateWithTime
} from '../../../../utils'

export default function Invite({ experienceBooking, isPollClosed }) {
   const [isInviteModalVisible, setIsInviteModalVisible] = useState(false)
   const { addToast } = useToasts()
   const { state: userState } = useUser()
   const { user = {} } = userState
   const [inviteList, setInviteList] = useState([])
   const [isReset, setIsReset] = useState(false)
   const [isSendingEmail, setIsSendingEmail] = useState(false)
   const [emailTemplate, setEmailTemplate] = useState('')
   const [invitationToken, setInvitationToken] = useState('')
   const payload = {
      experienceBookingId: experienceBooking?.id,
      experienceBookingCartId: experienceBooking?.cartId,
      invitedBy: {
         name: user?.fullName,
         email: user?.email
      },
      cutoffDate: experienceBooking?.cutoffTime,
      experienceClassId: experienceBooking?.experienceClassId,
      parentShare: 100
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
            setIsInviteModalVisible(false)
         }
      }
   )
   const [sendEmail] = useMutation(SEND_EMAIL, {
      onError: error => {
         console.log(error)
         setInviteList([])
         setIsReset(true)
         setIsSendingEmail(false)
         setIsInviteModalVisible(false)
         addToast('Something went wrong!', { appearance: 'error' })
      }
   })
   const [sendSms, { loading: isSendingSms }] = useMutation(SEND_SMS, {
      onError: error => {
         console.log(error)
         addToast('Something went wrong!', { appearance: 'error' })
      }
   })

   const openInviteModal = () => {
      setIsReset(false)
      setIsInviteModalVisible(true)
   }

   const copyHandler = async () => {
      if (!isPollClosed) {
         navigator.clipboard
            .writeText(
               `${window.location.origin}/bookingInviteResponse?token=${token}`
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
            const updatedCartItems = {
               ...experienceBooking?.experienceClass?.experience
                  ?.experience_products[0]?.product?.productOptions[0]
                  ?.cartItem,
               experienceClassId:
                  experienceBooking?.parentCart?.experienceClassId,
               experienceClassTypeId:
                  experienceBooking?.parentCart?.experienceClassTypeId
            }
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
                                 parentCartId:
                                    experienceBooking?.parentCart?.id,
                                 experienceClassId:
                                    experienceBooking?.parentCart
                                       ?.experienceClassId,
                                 experienceClassTypeId:
                                    experienceBooking?.parentCart
                                       ?.experienceClassTypeId,
                                 cartItems: {
                                    data: [
                                       updatedCartItems,
                                       {
                                          experienceClassId:
                                             experienceBooking?.parentCart
                                                ?.experienceClassId,
                                          experienceClassTypeId:
                                             experienceBooking?.parentCart
                                                ?.experienceClassTypeId
                                       }
                                    ]
                                 }
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
                  setInvitationToken(inviteToken)
                  if (isNumeric(inviteAddress)) {
                     await sendSms({
                        variables: {
                           message: `Hey ${user?.email} has invited you, Here are Invite details: Invite Url: ${window.location.origin}/bookingInviteResponse?token=${inviteToken}`,
                           phone: `+91${inviteAddress}`
                        }
                     })
                  } else {
                     // getting header, main body and footer email template from template service
                     const template_variables = encodeURI(
                        JSON.stringify({
                           brandCustomerId: user?.brandCustomers[0].id,
                           bookingId: experienceBooking?.id,
                           rsvpUrl: `${window.location.origin}/bookingInviteResponse?token=${inviteToken}`
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
                           path: '/stayin-folds/emails/ExperienceInvitation/index.js',
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
                     const templateHeaderUrl = `${base_url}/template/?template=${header_template_options}&data=${template_variables}`
                     const templatebodyUrl = `${base_url}/template/?template=${body_template_options}&data=${template_variables}`
                     const templateFooterUrl = `${base_url}/template/?template=${footer_template_options}&data=${template_variables}`

                     const { data: headerHtml } = await axios.get(
                        templateHeaderUrl
                     )
                     const { data: bodyHtml } = await axios.get(templatebodyUrl)
                     const { data: FooterHtml } = await axios.get(
                        templateFooterUrl
                     )
                     const html = `${headerHtml}${bodyHtml}${FooterHtml}`

                     // send email mutation
                     await sendEmail({
                        variables: {
                           emailInput: {
                              subject: `${user.fullName} HAS INVITED YOU TO ${
                                 experienceBooking?.experienceClass?.experience
                                    ?.title
                              } ON ${getDateWithTime(
                                 experienceBooking?.experienceClass
                                    ?.startTimeStamp
                              )} WITH ${
                                 experienceBooking?.experienceClass?.expert
                                    ?.fullName
                              } ON STAYIN SOCIAL ${
                                 window.location.origin
                              }/bookingInviteResponse?token=${inviteToken}`,
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
            addToast('Booking Invitation successfully send.', {
               appearance: 'success'
            })
            setInviteList([])
            setIsReset(true)
            setIsSendingEmail(false)
            setIsInviteModalVisible(false)
         }
      } catch (error) {
         setInviteList([])
         setIsReset(true)
         setIsSendingEmail(false)
         setIsInviteModalVisible(false)
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
                  background={theme.colors.secondaryColor}
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
                  Copy Booking Invite
               </Button>
            </div>
            <div style={{ margin: '1rem 0' }}>
               <SocialShare
                  url={`${
                     isClient ? window.location.origin : ''
                  }/pollResponse/${token}`}
                  title="Booking Invitation"
                  quote={`${experienceBooking?.experienceClass?.experience?.title} Booking Invite`}
                  hashtag="#BookingInvite"
               />
            </div>
            <p className="or">OR</p>
            <Button
               disabled={isPollClosed}
               onClick={openInviteModal}
               className="customBtn text6"
            >
               Invite via Email & Phone
            </Button>
         </div>

         <Modal
            isOpen={isInviteModalVisible}
            title="Invite Participants"
            close={() => setIsInviteModalVisible(false)}
            type="popup"
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
