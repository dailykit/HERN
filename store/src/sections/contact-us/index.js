import React, { useState } from 'react'
import { MailIcon } from '../../assets/icons/Mail'
import { PhoneIcon } from '../../assets/icons/Phone'
import { AddressIcon } from '../../assets/icons/AddressIcon'
import { useToasts } from 'react-toast-notifications'
import { useMutation } from '@apollo/react-hooks'
import { SEND_MAIL } from '../../graphql/mutations'
import { get_env } from '../../utils/get_env'

export const ContactUs = ({ config }) => {
   const { addToast } = useToasts()
   const [noReplyEmail, setNoReplyEmail] = useState('')
   const [sendMail, { loading }] = useMutation(SEND_MAIL, {
      onCompleted: () => {
         addToast('Form submitted succesfully', { appearance: 'success' })
      },
      onError: error => {
         addToast(error.message, { appearance: 'error' })
      },
   })
   const getEnvs = async () => {
      const noReplyEmail = await get_env('NO_REPLY_EMAIL')
      setNoReplyEmail(noReplyEmail)
   }
   getEnvs()
   const send = () => {
      const emailFrom = document.getElementById('input_email').value
      const emailTo = config?.email?.value || false
      const phone = document.getElementById('input_phone').value
      const subject = document.getElementById('input_subject').value
      const message = document.getElementById('textarea_message').value
      const emailValidation = validateEmail(emailFrom)
      const phoneValidation = validatePhone(phone)
      console.log('messgae', message, subject)
      if (emailFrom == '' || !emailValidation) {
         addToast('Please fill a valid email', { appearance: 'error' })
      } else if (phone == '' || !phoneValidation) {
         addToast('Please fill a valid phone number', { appearance: 'error' })
      } else if (emailTo == false) {
         console.log('no email value in config')
      } else {
         sendMail({
            variables: {
               emailInput: {
                  from: noReplyEmail,
                  to: emailTo,
                  subject: subject || '',
                  html: message || '',
                  attachments: [],
               },
            },
         })
      }
   }
   const validateEmail = email => {
      return email.match(
         /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
   }
   const validatePhone = phone => {
      return phone.match(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g)
   }
   return (
      <div className="hern-contact_us">
         <div className="hern-contact_us-header">
            <h3>{config?.heading.value}</h3>
            <h5>{config?.title.value}</h5>
            <p>{config?.subTitle.value}</p>
         </div>
         <div className="hern-contact_us-div">
            <div className="hern-contact_us-details">
               <div>
                  <AddressIcon
                     className="hern-contact_us-icon"
                     fill="#7CC41E"
                  />
                  <h3>visit Us</h3>
                  <p>
                     {config?.addressLine1.value}, <br />
                     {config?.addressLine2.value}, <br />
                     {config?.addressLine3.value} <br />
                  </p>
               </div>
               <div>
                  <MailIcon className="hern-contact_us-icon" fill="#7CC41E" />
                  <h3>Email Us</h3>
                  <p>
                     <a
                        href={`mailto: ${config?.email.value}`}
                        title={config?.email.value}
                     >
                        {config?.email.value}
                     </a>
                  </p>
               </div>
               <div>
                  <PhoneIcon className="hern-contact_us-icon" fill="#7CC41E" />
                  <h3>Call Us</h3>
                  <p>
                     <a
                        href={`tel:${config?.phone.value}`}
                        title={config?.phone.value}
                     >
                        {config?.phone.value}
                     </a>
                  </p>
               </div>
            </div>
            <div className="hern-contact_us-details contact-form">
               <form>
                  <div className="form-group">
                     <input
                        type="text"
                        placeholder="Your Name *"
                        id="input_name"
                        className="form-control"
                        name="contact-name"
                        required
                     />
                  </div>
                  <div className="form-group">
                     <input
                        type="email"
                        required
                        placeholder="Your E-mail *"
                        id="input_email"
                        className="form-control"
                        name="contact-email"
                     />
                  </div>
                  <div className="form-group">
                     <input
                        type="text"
                        required
                        placeholder="Your Phone Number *"
                        id="input_phone"
                        className="form-control"
                        name="contact-phone"
                     />
                  </div>
                  <div className="form-group">
                     <input
                        type="text"
                        required=""
                        placeholder="Subject"
                        id="input_subject"
                        className="form-control"
                        name="contact-subject"
                     />
                  </div>
                  <div className="form-group">
                     <textarea
                        placeholder="Message"
                        id="textarea_message"
                        name="contact-message"
                        rows="15"
                        className="form-control"
                     ></textarea>
                  </div>
                  <div className="form-group">
                     <input
                        type="button"
                        className="submit-button"
                        name="post"
                        id="btn_submit"
                        value="Send"
                        title="Send"
                        onClick={() => send()}
                     />
                  </div>
                  <div className="alert-msg" id="alert-msg"></div>
               </form>
            </div>
         </div>
      </div>
   )
}
