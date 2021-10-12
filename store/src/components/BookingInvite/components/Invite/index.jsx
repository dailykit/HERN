import React, { useState } from 'react'
import jwt from 'jsonwebtoken'
import { useToasts } from 'react-toast-notifications'
import { useMutation } from '@apollo/client'
import { Wrapper } from './styles'
import {
   Button,
   Modal,
   InviteThrough,
   CopyIcon,
   SocialShare
} from '../../../../components'
import useModal from '../../../useModal'
import { theme } from '../../../../theme'
import { useUser } from '../../../../Providers'
import {
   SEND_EMAIL,
   SEND_SMS,
   CREATE_EXPERIENCE_BOOKING_PARTICIPANT
} from '../../../../graphql'
import { useWindowDimensions, get_env, isNumeric } from '../../../../utils'

export default function Invite({ experienceBooking, isPollClosed }) {
   console.log('Check expBookingINfo', experienceBooking)
   const { ModalContainer, show, hide, isShow } = useModal()
   const { addToast } = useToasts()
   const { width } = useWindowDimensions()
   const { state: userState } = useUser()
   const { user = {} } = userState
   const [inviteList, setInviteList] = useState([])
   const [isReset, setIsReset] = useState(false)
   const [copyBtnClasses, setCopyBtnClasses] = useState(['customBtn text6'])
   const payload = {
      experienceBookingId: experienceBooking?.id,
      experienceBookingCartId: experienceBooking?.cartId,
      invitedBy: {
         name: user?.name,
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
         }
      }
   )
   const [sendEmail, { loading: isSendingEmail }] = useMutation(SEND_EMAIL, {
      onError: error => {
         console.log(error)
         addToast('Something went wrong!', { appearance: 'error' })
      }
   })
   const [sendSms, { loading: isSendingSms }] = useMutation(SEND_SMS, {
      onError: error => {
         console.log(error)
         addToast('Something went wrong!', { appearance: 'error' })
      }
   })

   const openDrawer = () => {
      setIsReset(false)
      show()
   }

   const copyHandler = async () => {
      if (!isPollClosed) {
         setCopyBtnClasses(prev => [...prev, 'blink_me'])
         navigator.clipboard
            .writeText(
               `${window.location.origin}/bookingInviteResponse?token=${token}`
            )
            .then(
               function () {
                  console.log('Async: Copying to clipboard was successful!')
                  setCopyBtnClasses(['customBtn'])
               },
               function (err) {
                  console.error('Async: Could not copy text: ', err)
               }
            )
      }
   }

   const sendInvitation = async () => {
      if (!isPollClosed) {
         const updatedCartItems = {
            ...experienceBooking?.experienceClass?.experience
               ?.experience_products[0]?.product?.productOptions[0]?.cartItem,
            experienceClassId: experienceBooking?.parentCart?.experienceClassId,
            experienceClassTypeId:
               experienceBooking?.parentCart?.experienceClassTypeId
         }
         inviteList.forEach(async inviteAddress => {
            const email = isNumeric(inviteAddress) ? null : inviteAddress
            const phone = isNumeric(inviteAddress) ? inviteAddress : null
            const { data: { createExperienceBookingParticipant = {} } = {} } =
               await createParticipant({
                  variables: {
                     object: {
                        experienceBookingId: experienceBooking?.id,
                        email,
                        phone,
                        childCart: {
                           data: {
                              parentCartId: experienceBooking?.parentCart?.id,
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
            if (isNumeric(inviteAddress)) {
               await sendSms({
                  variables: {
                     message: `Hey ${user?.email} has invited you, Here are Invite details: Invite Url: ${window.location.origin}/bookingInviteResponse?token=${inviteToken}`,
                     phone: `+91${inviteAddress}`
                  }
               })
            } else {
               await sendEmail({
                  variables: {
                     emailInput: {
                        subject: `Invitation for ${experienceBooking?.experienceClass?.experience?.title} Experience.`,
                        to: inviteAddress,
                        from: get_env('NO_REPLY_EMAIL'),
                        html: `<h3>Hello ${user?.email} has invited you for ${experienceBooking?.experienceClass?.experience?.title} experience , Here are Invite details: Invite Url: ${window.location.origin}/bookingInviteResponse?token=${inviteToken}</h3>`,
                        attachments: []
                     }
                  }
               })
            }
         })
         addToast('Booking Invitation successfully send.', {
            appearance: 'success'
         })
         setInviteList([])
         setIsReset(true)
         hide()
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
                  className={copyBtnClasses}
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
                  url={`https://primanti.dailykit.org/pollResponse/${token}`}
                  title="Booking Invitation"
                  quote={`${experienceBooking?.experienceClass?.experience?.title} Booking Invite`}
                  hashtag="#BookingInvite"
               />
            </div>
            <p className="or">OR</p>
            <Button
               disabled={isPollClosed}
               onClick={openDrawer}
               className="customBtn text6"
            >
               Invite via Email & Phone
            </Button>
         </div>

         <ModalContainer isShow={isShow}>
            <Modal
               isOpen={isShow}
               close={hide}
               type="popup"
               showActionButton={true}
               actionButtonTitle="Send Invite"
               actionHandler={sendInvitation}
               disabledActionButton={
                  isSendingEmail || isSendingSms || inviteList.length === 0
               }
            >
               <InviteThrough
                  isReset={isReset}
                  onChange={list => setInviteList(list)}
               />
            </Modal>
         </ModalContainer>
      </Wrapper>
   )
}
