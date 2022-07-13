import React from 'react'
import _ from 'lodash'
import { Form, Flex, IconButton } from '@dailykit/ui'
import {
   ColorPicker,
   TextBox,
   Toggle,
   Number,
   Checkbox,
   Date,
   Time,
   Select,
   TextArea,
   TextWithSelect,
   NumberWithSelect,
   PhoneNumberSelector,
   ImageUpload,
   MultipleImageUpload,
   RichText,
   CollectionSelector,
   ProductSelector,
   CouponSelector,
   RadioButton,
   CampaignSelector,
   RecipeSelector,
   AnimationSelector,
   PaymentOptionSelector,
   VideoUpload,
   CustomField,
} from './UIComponents'
import { Address } from './UIComponents/Address'
import { useEditMode } from './EditModeContext'
import { AvailableIcon, UnavailableIcon } from '../../assets/icons'

export const getFieldUI = (
   fieldKey,
   configJSON,
   onConfigChange,
   isValid,
   setIsValid,
   configSaveHandler,
   editMode,
   value
) => {
   const field = _.get(configJSON, fieldKey)
   const indentation = `${fieldKey.split('.').length * 6}px`
   let configUI

   if (field.dataType === 'boolean' && field.userInsertType === 'toggle') {
      configUI = (
         <>
            {editMode ? (
               <Toggle
                  fieldDetail={field}
                  marginLeft={indentation}
                  path={fieldKey}
                  onConfigChange={(name, value) => onConfigChange(name, value)}
               />
            ) : (
               <Flex
                  container
                  justifyContent="space-between"
                  alignItems="center"
                  margin={`0 0 0 ${indentation}`}
               >
                  <Flex container alignItems="flex-end">
                     <Form.Label title={value.label} htmlFor="toggleValue">
                        {value.label.toUpperCase()}
                     </Form.Label>
                  </Flex>
                  <IconButton
                     type="ghost"
                     style={{ marginRight: '-20px' }}
                     title={value.value ? 'available' : 'unavailable'}
                  >
                     {value.value ? <AvailableIcon /> : <UnavailableIcon />}
                  </IconButton>
               </Flex>
            )}
         </>
      )
   } else if (
      field.dataType === 'color' &&
      field.userInsertType === 'colorPicker'
   ) {
      configUI = (
         <ColorPicker
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'text' &&
      field.userInsertType === 'textField'
   ) {
      configUI = (
         <TextBox
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            validationType={field?.validationType}
            isValid={isValid}
            setIsValid={setIsValid}
            onConfigChange={onConfigChange}
            editMode={editMode}
            value={value}
         />
      )
   } else if (
      field.dataType === 'number' &&
      field.userInsertType === 'numberField'
   ) {
      configUI = (
         <Number
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'boolean' &&
      field.userInsertType === 'checkbox'
   ) {
      configUI = (
         <>
            {editMode ? (
               <Checkbox
                  fieldDetail={field}
                  marginLeft={indentation}
                  path={fieldKey}
                  onConfigChange={onConfigChange}
               />
            ) : (
               <p>
                  {value.label} {value.value === true ? 'YES' : 'NO'}
               </p>
            )}
         </>
      )
   } else if (
      field.dataType === 'date' &&
      field.userInsertType === 'datePicker'
   ) {
      configUI = (
         <Date
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (field.dataType === 'time' && field.userInsertType === 'time') {
      configUI = (
         <Time
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'select' &&
      field.userInsertType === 'dropdown'
   ) {
      configUI = (
         <Select
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'text' &&
      field.userInsertType === 'textArea'
   ) {
      configUI = (
         <TextArea
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'text' &&
      field.userInsertType === 'textWithSelect'
   ) {
      configUI = (
         <TextWithSelect
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
         />
      )
   } else if (
      field.dataType === 'number' &&
      field.userInsertType === 'numberWithSelect'
   ) {
      configUI = (
         <NumberWithSelect
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
         />
      )
   } else if (
      field.dataType === 'phoneNumber' &&
      field.userInsertType === 'phoneNumber'
   ) {
      configUI = (
         <PhoneNumberSelector
            setIsValid={setIsValid}
            isValid={isValid}
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
            value={value}
            configJSON={configJSON}
         />
      )
   } else if (
      field.dataType === 'address' &&
      field.userInsertType === 'addressField'
   ) {
      configUI = (
         <Address
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            configSaveHandler={configSaveHandler}
            configJSON={configJSON}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'imageUpload' &&
      field.userInsertType === 'imageUpload'
   ) {
      configUI = (
         <ImageUpload
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            configSaveHandler={configSaveHandler}
            configJSON={configJSON}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'videoUpload' &&
      field.userInsertType === 'videoUpload'
   ) {
      configUI = (
         <VideoUpload
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            configSaveHandler={configSaveHandler}
            configJSON={configJSON}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'multipleImagesUpload' &&
      field.userInsertType === 'multipleImagesUpload'
   ) {
      configUI = (
         <MultipleImageUpload
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            configSaveHandler={configSaveHandler}
            configJSON={configJSON}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'html' &&
      field.userInsertType === 'richTextEditor'
   ) {
      configUI = (
         <RichText
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (field.userInsertType === 'collectionSelector') {
      configUI = (
         <CollectionSelector
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
         />
      )
   } else if (field.userInsertType === 'productSelector') {
      configUI = (
         <ProductSelector
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (field.userInsertType === 'couponSelector') {
      configUI = (
         <CouponSelector
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (
      field.dataType === 'boolean' &&
      field.userInsertType === 'radioButton'
   ) {
      configUI = (
         <RadioButton
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (field.userInsertType === 'campaignSelector') {
      configUI = (
         <CampaignSelector
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (field.userInsertType === 'recipeSelector') {
      configUI = (
         <RecipeSelector
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (field.userInsertType === 'animationSelector') {
      configUI = (
         <AnimationSelector
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
         />
      )
   } else if (field.userInsertType === 'paymentOptionSelector') {
      configUI = (
         <PaymentOptionSelector
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
         />
      )
   } else if (field.userInsertType === 'customField') {
      configUI = (
         <CustomField
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
            editMode={editMode}
            fieldKey={fieldKey}
            configJSON={configJSON}
            isValid={isValid}
            setIsValid={setIsValid}
            configSaveHandler={configSaveHandler}
         />
      )
   }
   return <div data-config-path={fieldKey}>{configUI}</div>
}

export const FieldUI = ({
   fieldKey,
   configJSON,
   onConfigChange,
   value,
   configSaveHandler,
   isValid,
   setIsValid,
}) => {
   const { editMode } = useEditMode()

   return (
      <div>
         {getFieldUI(
            fieldKey,
            configJSON,
            onConfigChange,
            isValid,
            setIsValid,
            configSaveHandler,
            editMode,
            value
         )}
      </div>
   )
}
