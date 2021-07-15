import { useMutation } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   Spacer,
   Text,
   Tunnel,
   TunnelHeader,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { toast } from 'react-toastify'
import { Tooltip, Banner } from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'
import { Camera } from '../../../../assets/icons'
import { TunnelContainer } from '../../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../../constants/errorMessages'
import { SUPPLIER_CONTACT_INFO_ADDED } from '../../../../constants/successMessages'
import { UPDATE_SUPPLIER } from '../../../../graphql'
import { validators } from '../../../../utils/validators'
import { CircleButton } from '../styled'
import PhotoTunnel from './PhotoTunnel'

const address = 'apps.inventory.views.forms.supplier.tunnels.'

export default function PersonContactTunnel({ close, formState }) {
   const [photoTunnel, openPhotoTunnel, closePhotoTunnel] = useTunnel(1)
   const contactPerson = formState.contactPerson || {}

   const { t } = useTranslation()

   const [firstName, setFirstName] = useState({
      value: contactPerson.firstName || '',
      meta: {
         isValid: contactPerson.firstName ? true : false,
         errors: [],
         isTouched: false,
      },
   })
   const [lastName, setLastName] = useState({
      value: contactPerson.lastName || '',
      meta: {
         isValid: contactPerson.lastName ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [email, setEmail] = useState({
      value: contactPerson.email || '',
      meta: {
         isValid: contactPerson.email ? true : false,
         isTouched: false,
         errors: [],
      },
   })
   const [phoneNumber, setPhoneNumber] = useState({
      value: contactPerson.phoneNumber || '',
      meta: {
         isValid: contactPerson.phoneNumber ? true : false,
         isTouched: false,
         errors: [],
      },
   })

   const [updateSupplier, { loading }] = useMutation(UPDATE_SUPPLIER, {
      onCompleted: () => {
         toast.info(SUPPLIER_CONTACT_INFO_ADDED)
         close(1)
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
         close(1)
      },
   })

   const checkForm = () => {
      if (!firstName.value || !firstName.meta.isValid)
         return 'first name is required'
      if (!phoneNumber.value) return 'phone number is required'

      return true
   }
   const checkPhoneNumber = value => {
      if (!value)
         return { isValid: false, errors: ['phone number is required'] }

      return { isValid: true, errors: [] }
   }

   const handleNext = () => {
      const checkValues = checkForm()
      if (!checkValues.length)
         updateSupplier({
            variables: {
               id: formState.id,
               object: {
                  contactPerson: {
                     ...formState.contactPerson,
                     firstName: firstName.value.trim(),
                     lastName: lastName.value.trim(),
                     email: email.value.trim(),
                     phoneNumber: phoneNumber.value,
                  },
               },
            },
         })
      else toast.error(checkValues)
   }

   return (
      <>
         <Tunnels tunnels={photoTunnel}>
            <Tunnel layer={1}>
               <PhotoTunnel close={closePhotoTunnel} formState={formState} />
            </Tunnel>
         </Tunnels>
         <TunnelHeader
            title={t(address.concat('add person of contact'))}
            close={() => close(1)}
            right={{
               title: loading ? 'Saving...' : 'Save',
               action: handleNext,
            }}
            description={`add person of contact for ${formState.name}`}
            tooltip={
               <Tooltip identifier="suppliers_form_add_person_of_contact_tunnel_header" />
            }
         />
         <Banner id="inventory-apps-suppliers-person-of-contact-tunnel-top" />
         <TunnelContainer>
            <Flex container justifyContent="space-between" width="100%">
               <div>
                  <Flex container>
                     <Form.Group>
                        <Form.Label htmlFor="firstName" title="firstName">
                           {t(address.concat('first name'))}*
                        </Form.Label>
                        <Form.Text
                           name="firstName"
                           id="firstName"
                           value={firstName.value}
                           onChange={e =>
                              setFirstName({
                                 value: e.target.value,
                                 meta: { ...firstName.meta },
                              })
                           }
                           onBlur={e => {
                              const { isValid, errors } = validators.name(
                                 e.target.value,
                                 'first name'
                              )
                              setFirstName({
                                 value: e.target.value,
                                 meta: { isValid, errors, isTouched: true },
                              })
                           }}
                        />
                        {firstName.meta.isTouched &&
                           !firstName.meta.isValid && (
                              <Form.Error>
                                 {firstName.meta.errors[0]}
                              </Form.Error>
                           )}
                     </Form.Group>
                     <Spacer xAxis size="8px" />
                     <Form.Group>
                        <Form.Label htmlFor="lastName" title="lastName">
                           {t(address.concat('last name'))}
                        </Form.Label>
                        <Form.Text
                           id="lastName"
                           name="lastName"
                           value={lastName.value}
                           onChange={e =>
                              setLastName({
                                 value: e.target.value,
                                 meta: { ...lastName.meta },
                              })
                           }
                        />
                     </Form.Group>
                  </Flex>

                  <Spacer size="16px" />

                  <Form.Group>
                     <Form.Label htmlFor="email" title="email">
                        {t(address.concat('email'))}
                     </Form.Label>
                     <Form.Text
                        id="email"
                        name="email"
                        value={email.value}
                        onChange={e =>
                           setEmail({
                              value: e.target.value,
                              meta: { ...email.meta },
                           })
                        }
                     />
                  </Form.Group>

                  <Spacer size="16px" />

                  <Form.Group>
                     <Form.Label title="phoneNumber" htmlFor="phoneNumber">
                        {t(address.concat('phone number'))}*
                     </Form.Label>

                     <PhoneInput
                        id="phoneNumber"
                        country="us"
                        value={phoneNumber.value}
                        onChange={phone =>
                           setPhoneNumber({
                              value: phone,
                              meta: { ...phoneNumber.meta },
                           })
                        }
                        onBlur={e => {
                           const { isValid, errors } = checkPhoneNumber(
                              e.target.value
                           )
                           setPhoneNumber({
                              ...phoneNumber,
                              meta: { isValid, errors, isTouched: true },
                           })
                        }}
                     />

                     {phoneNumber.meta.isTouched &&
                        !phoneNumber.meta.isValid && (
                           <Form.Error>{phoneNumber.meta.errors[0]}</Form.Error>
                        )}
                  </Form.Group>
               </div>

               <Flex
                  container
                  margin="0 0 0 20px"
                  width="70%"
                  justifyContent="center"
               >
                  <CircleButton onClick={() => openPhotoTunnel(1)}>
                     {formState.contactPerson?.imageUrl ? (
                        <img
                           src={formState.contactPerson.imageUrl}
                           alt="profile"
                        />
                     ) : (
                        <Camera color="#555B6E" size="44" />
                     )}
                  </CircleButton>
               </Flex>
            </Flex>
         </TunnelContainer>
         <Banner id="inventory-apps-suppliers-person-of-contact-tunnel-bottom" />
      </>
   )
}
