import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { useToasts } from 'react-toast-notifications'
import { Wrapper } from './styles'
import BookingOption from '../BookingOption'
import {
   CREATE_EXPERIENCE_BOOKING_PARTICIPANT,
   UPDATE_EXPERIENCE_BOOKING_PARTICIPANT,
   CREATE_EXPERIENCE_BOOKING_PARTICIPANT_CHOICE,
   DELETE_EXPERIENCE_BOOKING_PARTICIPANT_CHOICE
} from '../../../graphql'
import { Input, Button, Error, Spacer } from '../../../components'
import { useUser } from '../../../Providers'
import {
   getDate,
   IsEmailValid,
   isEmpty,
   isPhoneNumberValid
} from '../../../utils'

export default function SubmitResponse({
   decodedToken,
   startCelebration,
   options,
   isPollClosed,
   experienceBookingParticipant,
   localStorageData
}) {
   const { addToast } = useToasts()
   const { state: userState } = useUser()
   const { user = {} } = userState
   const [isPublicUrl] = useState(Boolean(!decodedToken?.participantId))
   const [participantId, setParticipantId] = useState(null)
   const [isDisabled, setIsDisabled] = useState(true)
   const [selectedOptions, setSelectedOptions] = useState([])
   const [responseDetail, setResponseDetail] = useState({
      email: {
         value: decodedToken?.invitee?.email,
         error: ''
      },
      phone: {
         value: '',
         error: ''
      }
   })

   //   mutation for creating experinceBookingParticipant
   const [createParticipant, { loading: isCreatingParticipant }] = useMutation(
      CREATE_EXPERIENCE_BOOKING_PARTICIPANT,
      {
         onCompleted: async ({ createExperienceBookingParticipant }) => {
            setParticipantId(createExperienceBookingParticipant?.id)
            const dataToBeStore = {
               participantId: createExperienceBookingParticipant?.id
            }
            await localStorage.setItem(
               'participantInfo',
               JSON.stringify(dataToBeStore)
            )
         },
         onError: error => {
            console.error(error)
         }
      }
   )

   const [updateParticipant, { loading: isUpdatingParticipant }] = useMutation(
      UPDATE_EXPERIENCE_BOOKING_PARTICIPANT,
      {
         onError: error => {
            addToast('Something went wrong!', { appearance: 'error' })
            console.log(error)
         }
      }
   )
   const [createParticipantChoice, { loading: isCreatingParticipantChoice }] =
      useMutation(CREATE_EXPERIENCE_BOOKING_PARTICIPANT_CHOICE, {
         onError: error => {
            addToast('Something went wrong!', { appearance: 'error' })
            console.log(error)
         }
      })
   const [deleteParticipantChoice, { loading: isDeletingParticipantChoice }] =
      useMutation(DELETE_EXPERIENCE_BOOKING_PARTICIPANT_CHOICE, {
         onError: error => {
            addToast('Something went wrong!', { appearance: 'error' })
            console.log(error)
         }
      })

   const checkBoxHandler = (e, option) => {
      const { checked } = e.target

      console.log({ optionId: option?.id, checked, selectedOptions })
      const selectedOptionIndex = selectedOptions.findIndex(
         opt => opt?.experienceBookingOptionId === option?.id
      )
      console.log('CheckBoxHandler', checked, selectedOptionIndex)
      if (selectedOptionIndex === -1) {
         console.log('not in selectedOptions', {
            experienceBookingOptionId: option?.id
         })
         setSelectedOptions(prev => {
            return [...prev, { experienceBookingOptionId: option?.id }]
         })
      } else {
         const updatedSelectedOptions = selectedOptions
         console.log(
            ' in selectedOptions',
            selectedOptions,
            typeof selectedOptions,
            typeof updatedSelectedOptions
         )
         updatedSelectedOptions.splice(selectedOptionIndex, 1)
         setSelectedOptions([...updatedSelectedOptions])
      }
   }

   const inputHandler = e => {
      const { name, value } = e.target
      setResponseDetail(prev => {
         return {
            ...prev,
            [name]: { ...prev[name], value, error: '' }
         }
      })
      if (name === 'email') {
         if (!IsEmailValid(value)) {
            console.log('email not valid')
            setResponseDetail(prev => {
               return {
                  ...prev,
                  [name]: {
                     ...prev[name],
                     error: 'Please Provide a valid input!'
                  }
               }
            })
         }
      } else {
         if (!isPhoneNumberValid(value)) {
            console.log('isphonevalid func', value, name)
            setResponseDetail(prev => {
               return {
                  ...prev,
                  [name]: {
                     ...prev[name],
                     error: 'Please Provide a valid input!'
                  }
               }
            })
         }
      }
   }

   const submitResponseHandler = async () => {
      if (!isDisabled && !isPollClosed) {
         if (participantId) {
            await deleteParticipantChoice({
               variables: {
                  experienceBookingParticipantId: participantId
               }
            })
            await updateParticipant({
               variables: {
                  id: participantId,
                  _set: {
                     experienceBookingId: decodedToken?.experienceBookingId,
                     email: responseDetail?.email?.value,
                     phone: responseDetail?.phone?.value,
                     keycloakId: user.keycloakId ? user?.keycloakId : null
                  }
               }
            })
            selectedOptions.forEach(async opt => {
               await createParticipantChoice({
                  variables: {
                     experienceBookingParticipantId: participantId,
                     experienceBookingOptionId: opt?.experienceBookingOptionId
                  }
               })
            })

            startCelebration()
         }
      }
   }

   useEffect(() => {
      // this effect is used for mainting the disable state for the form submit button
      if (
         isPollClosed ||
         selectedOptions?.length === 0 ||
         isCreatingParticipant ||
         isCreatingParticipantChoice ||
         isDeletingParticipantChoice ||
         isUpdatingParticipant ||
         !responseDetail?.email?.value ||
         !responseDetail?.phone?.value ||
         responseDetail?.email?.error ||
         responseDetail?.phone?.error
      ) {
         setIsDisabled(true)
      } else {
         setIsDisabled(false)
      }
   }, [
      isPollClosed,
      isCreatingParticipant,
      isCreatingParticipantChoice,
      isUpdatingParticipant,
      isDeletingParticipantChoice,
      responseDetail,
      selectedOptions
   ])

   useEffect(() => {
      // if particant is not created already that means invite link is a publicUrl
      // and we create the participant for the experienceBookingId given in token
      // as soon as they open the link
      if (!isPollClosed) {
         if (!localStorageData?.participantId && isPublicUrl) {
            createParticipant({
               variables: {
                  object: {
                     experienceBookingId: decodedToken?.experienceBookingId,
                     keycloakId: user.keycloakId ? user?.keycloakId : null,
                     childCart: {
                        data: {
                           parentCartId: decodedToken?.experienceBookingCartId
                        }
                     }
                  }
               }
            })
         }
      }
   }, [])

   useEffect(() => {
      // if participant is already created and given a response already,
      // then we set the participant info and their response
      // like id, email, phone and selected option  to prefill the form
      if (
         experienceBookingParticipant &&
         !isEmpty(experienceBookingParticipant)
      ) {
         setParticipantId(experienceBookingParticipant?.id)
         setResponseDetail({
            email: {
               value: experienceBookingParticipant?.email || '',
               error: ''
            },
            phone: {
               value: experienceBookingParticipant?.phone || '',
               error: ''
            }
         })
         setSelectedOptions([
            ...experienceBookingParticipant?.participantChoices
         ])
      }
   }, [experienceBookingParticipant])

   return (
      <Wrapper>
         <div className="slots-wrapper">
            {options.map((option, index) => {
               return (
                  <BookingOption
                     key={option?.id}
                     option={option}
                     index={index}
                     selectedOptions={selectedOptions}
                     onOptionClick={e => {
                        checkBoxHandler(e, option)
                     }}
                  />
               )
            })}
         </div>
         <div className="modal-content-div">
            <div style={{ padding: '1rem' }}>
               <h3 className="League-Gothic text6 response-sub-head">
                  Enter your information below and we’ll send you and invite
                  with the date and time that{' '}
                  {decodedToken?.invitedBy?.name ||
                     decodedToken?.invitedBy?.email}{' '}
                  selects!
               </h3>
               <Input
                  className="custom-response-input"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={responseDetail?.email?.value}
                  onChange={inputHandler}
               />
               {responseDetail?.email?.error ? (
                  <Error margin="8px 0 1rem 0">
                     {responseDetail?.email?.error}
                  </Error>
               ) : (
                  <Spacer yAxis="0.5rem" />
               )}
               <Input
                  className="custom-response-input"
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={responseDetail?.phone?.value}
                  onChange={inputHandler}
               />
               {responseDetail?.phone?.error && (
                  <Error margin="8px 0 1rem 0">
                     {responseDetail?.phone?.error}
                  </Error>
               )}
            </div>
            <Spacer yAxis="1rem" />
            {/* sticky submit button  */}
         </div>
         <div className="footer-sticky-btn-div">
            {/* <p className="Proxima-Nova text8 poll-expiry-msg">
               poll expires on {getDate(decodedToken?.cutoffDate)}
            </p> */}
            <Button
               onClick={submitResponseHandler}
               disabled={isDisabled}
               className="custom-submit-btn text3"
            >
               Submit Response
            </Button>
         </div>
      </Wrapper>
   )
}
