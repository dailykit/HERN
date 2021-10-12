import React, { useState, useEffect } from 'react'
import { Flex } from '@dailykit/ui'
import { Wrapper } from './styles.js'
import Input from '../Input'
import Error from '../Error'
import { CrossIcon } from '../Icons'
import { theme } from '../../theme'
import { isNumeric, IsEmailValid, isPhoneNumberValid } from '../../utils'

export default function InviteThrough({ onChange, isReset = false }) {
   const [inviteAddress, setInviteAddress] = useState('')
   const [isInputValid, setIsInputValid] = useState(true)
   const [inviteAddressList, setInviteAddressList] = useState([])
   const [bgStyle, setBgStyle] = useState([])
   const onChangeHandler = e => {
      setIsInputValid(true)
      const { value } = e.target
      const bgColors = [
         theme.colors.textColor10,
         theme.colors.textColor11,
         theme.colors.textColor12,
         theme.colors.textColor13,
         theme.colors.textColor14
      ]
      const randomBgColor =
         bgColors[Math.floor(Math.random() * bgColors.length)]
      setInviteAddress(value)

      if (value.indexOf(',') > -1 || e.key === 'Enter' || e.keyCode === 13) {
         const actualValue = value.replace(',', '')
         if (isNumeric(actualValue)) {
            if (!isPhoneNumberValid(actualValue)) {
               setIsInputValid(false)
               return
            }
         } else {
            if (!IsEmailValid(actualValue)) {
               setIsInputValid(false)
               return
            }
         }
         setBgStyle(prev => [...prev, randomBgColor])
         setInviteAddress('')
         setInviteAddressList(prev => [...prev, actualValue])
      }
   }

   const onRemoveHandler = index => {
      const updatedInviteAddressList = inviteAddressList
      updatedInviteAddressList.splice(index, 1)
      console.log(updatedInviteAddressList)
      setInviteAddressList([...updatedInviteAddressList])
   }

   useEffect(() => {
      onChange(inviteAddressList)
   }, [inviteAddressList])

   useEffect(() => {
      if (isReset) {
         setInviteAddressList([])
      }
   }, [isReset])
   return (
      <Wrapper>
         <h1 className="invite-h1-head text2">Invite Participants</h1>
         <div className="main_container">
            <p className="proxinova_text label text8">Email/Phone</p>
            <small className="proxinova_text small_text text11">
               (add emails, phone numbers separated by enter or comma)
            </small>
            <Input
               type="text"
               placeholder="enter here"
               value={inviteAddress}
               onChange={onChangeHandler}
               onKeyDown={onChangeHandler}
               className="customInput"
            />
            {!isInputValid && <Error>Please Provide a valid input</Error>}
            <Flex container alignItems="center" flexWrap="wrap">
               {inviteAddressList.map((listItem, index) => {
                  return (
                     <div
                        key={index}
                        className="invitation-address text8"
                        style={{ background: bgStyle[index] }}
                     >
                        {listItem}
                        <span
                           className="remove-btn"
                           onClick={() => onRemoveHandler(index)}
                        >
                           <CrossIcon
                              size={theme.sizes.h6}
                              color={theme.colors.textColor4}
                           />
                        </span>
                     </div>
                  )
               })}
            </Flex>
         </div>
      </Wrapper>
   )
}
