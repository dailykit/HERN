import React from 'react'
import { MailIcon } from '../../assets/icons/Mail'
import { PhoneIcon } from '../../assets/icons/Phone'
import { AddressIcon } from '../../assets/icons/AddressIcon'
import { useToasts } from 'react-toast-notifications'
import { useMutation } from '@apollo/react-hooks'

export const ContactUs = ({ config }) => {
   console.log('-->config', config)
   const { addToast } = useToasts()
   // const [sendMail, { loading }] = useMutation(sendEmail, {
   //     onCompleted: () => {
   //        addToast('Form submitted succesfully', { appearance: 'success' })
   //     },
   //     onError: error => {
   //        addToast(error.message, { appearance: 'error' })
   //     },
   //  })
   return (
      <div className="hern-contact_us">
         <div className="hern-contact_us-header">
            <h3>{config.heading.value}</h3>
            <h5>{config.title.value}</h5>
            <p>{config.subTitle.value}</p>
         </div>
         <div className="hern-contact_us-div">
            <div className="hern-contact_us-details">
               <div>
                  <AddressIcon
                     className="hern-contact_us-icon"
                     fill="#ff9c00"
                  />
                  <h3>visit Us</h3>
                  <p>
                     {config.addressLine1.value}, <br />
                     {config.addressLine2.value}, <br />
                     {config.addressLine3.value} <br />
                  </p>
               </div>
               <div>
                  <MailIcon className="hern-contact_us-icon" fill="#ff9c00" />
                  <h3>Email Us</h3>
                  <p>
                     <a
                        href={`mailto: ${config.email.value}`}
                        title={config.email.value}
                     >
                        {config.email.value}
                     </a>
                  </p>
               </div>
               <div>
                  <PhoneIcon className="hern-contact_us-icon" fill="#ff9c00" />
                  <h3>Call Us</h3>
                  <p>
                     <a
                        href={`tel:${config.phone.value}`}
                        title={config.phone.value}
                     >
                        {config.phone.value}
                     </a>
                  </p>
               </div>
            </div>
            <div className="hern-contact_us-details contact-form">
               <form>
                  <div className="form-group">
                     <input
                        type="text"
                        required=""
                        placeholder="Your Name *"
                        id="input_name"
                        className="form-control"
                        name="contact-name"
                     />
                  </div>
                  <div className="form-group">
                     <input
                        type="email"
                        required=""
                        placeholder="Your E-mail *"
                        id="input_email"
                        className="form-control"
                        name="contact-email"
                     />
                  </div>
                  <div className="form-group">
                     <input
                        type="text"
                        required=""
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
                        rows="5"
                        className="form-control"
                     ></textarea>
                  </div>
                  <div className="form-group">
                     <input
                        type="submit"
                        className="submit-button"
                        name="post"
                        id="btn_submit"
                        value="Send"
                        title="Send"
                     />
                  </div>
                  <div className="alert-msg" id="alert-msg"></div>
               </form>
            </div>
         </div>
      </div>
   )
}
