import React from 'react'
import { Popup, TextButton, ButtonGroup, Form } from '@dailykit/ui'

export default function ConfirmationPopup({
   showPopup,
   setShowPopup,
   popupHeading,
   selectedRows,
   bulkActions,
   setBulkActions,
   handleOnUpdate,
   table,
   setSelectedRows,
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
         if ('isArchived' in bulkActions) {
            let keyName
            switch (table) {
               case 'Product Options':
                  keyName = 'selected-rows-id_product_option_table'
                  break
               case 'Recipe':
                  keyName = 'selected-rows-id_recipe_table'
                  break
               case 'Product':
                  keyName = 'selected-rows-id_product_table'
                  break
               case 'Menu Product Occurrence':
                  keyName = 'selected-rows-id_occurrence_table'
                  break
               case 'Menu Product Subscription':
                  keyName = 'selected-rows-id_subscription_table'
                  break
               case 'Subscription Occurrence':
                  keyName = 'selected-rows-id_subscription_occurrence_table'
                  break
               case 'Add To Subscription':
                  keyName = 'selected-rows-id-subscription'
                  break
               case 'Add To Occurrence':
                  keyName = 'selected-rows-id-occurence'
                  break
               case 'Manage Add To Subscription':
                  keyName = 'selected-rows-id-manage-subscription'
                  break
               case 'Manage Add To Occurrence':
                  keyName = 'selected-rows-id-manage-occurence'
                  break
               case 'Delivery Area':
                  keyName = 'selected-rows-id-delivery-area-table'
                  break
               case 'Brand Product':
                  keyName = 'selected-rows-id_brand-manager_table'
                  break
               default:
                  keyName = 'selected-rows-id_ingredients_table'
            }
            // remove selected rows ids after delete
            localStorage.removeItem(keyName)
         }
         handleOnUpdate()
         setBulkActions({})
         setInputValue('')
         setShowPopup(false)
         setSelectedRows([])
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
            You’re making a change for {selectedRows.length} {table}. Type the
            number of {table} <br />
            selected to confirm this bulk action
         </Popup.ConfirmText>
         <Popup.Actions>
            <Form.Group>
               <Form.Text
                  id="confirmNumber"
                  name="confirmNumber"
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
