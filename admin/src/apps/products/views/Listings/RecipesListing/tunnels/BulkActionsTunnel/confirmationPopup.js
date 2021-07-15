import React from 'react'
import {
   Popup,
   TextButton,
   ButtonGroup,
   ContextualMenu,
   Context,
   Form,
} from '@dailykit/ui'

import { toast } from 'react-toastify'
import { logger } from '../../../../../utils'

import { useMutation, useSubscription } from '@apollo/react-hooks'

export default function ConfirmationPopup({
   showPopup,
   setShowPopup,
   popupHeading,
   selectedRows,
   bulkActions,
   setBulkActions,
   simpleRecipeUpdate,
}) {
   const [isValid, setIsValid] = React.useState(false)
   const [inputValue, setInputValue] = React.useState('')

   const onBlur = () => {
      console.log('this is on blur')
   }

   const onChange = e => {
      setInputValue(e.target.value)
      setIsValid(false)
      console.log('onchange', e.target.value)
   }

   const checkValidation = () => {
      if (inputValue == selectedRows.length) {
         simpleRecipeUpdate({
            variables: {
               ids: selectedRows.map(idx => idx.id),
               _set: bulkActions,
            },
         })
         console.log(bulkActions)
         setBulkActions({})
         setInputValue('')
         setShowPopup(false)
      } else {
         setIsValid(true)
         console.log('invalid')
      }
   }
   const onClosePopup = () => {
      if (showPopup) {
         setShowPopup(false)
         if ('isArchived' in bulkActions) {
            setBulkActions({})
         }
      }
   }
   return (
      <Popup show={showPopup} clickOutsidePopup={() => onClosePopup()}>
         <Popup.Actions>
            <Popup.Text type="danger">{popupHeading}</Popup.Text>
            <Popup.Close closePopup={() => onClosePopup()} />
         </Popup.Actions>
         <Popup.ConfirmText>
            You’re making a change for {selectedRows.length} recipes. Type the
            number of recipes <br />
            selected to confirm this bulk action
         </Popup.ConfirmText>
         <Popup.Actions>
            <Form.Group>
               <Form.Text
                  id="username"
                  name="username"
                  onBlur={onBlur}
                  onChange={onChange}
                  value={inputValue}
                  placeholder={selectedRows.length}
               />
               {isValid && <Form.Error>Wrong Input, Enter again</Form.Error>}
            </Form.Group>

            <ButtonGroup align="left">
               <TextButton
                  type="solid"
                  disabled={inputValue.length > 0 ? false : true}
                  onClick={() => checkValidation()}
               >
                  Confirm
               </TextButton>
            </ButtonGroup>
         </Popup.Actions>
      </Popup>
   )
}
