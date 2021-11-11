import React from 'react'
import _ from 'lodash'
import {
   ColorPicker,
   Text,
   Toggle,
   Number,
   Checkbox,
   Date,
   Time,
   Select,
   TextArea,
   TextWithSelect,
   NumberWithSelect,
} from './UIComponents'
import { useEditMode } from './EditModeContext'

export const getFieldUI = (
   fieldKey,
   configJSON,
   onConfigChange,
   editMode,
   value
) => {
   console.log(value)
   const field = _.get(configJSON, fieldKey)
   const indentation = `${fieldKey.split('.').length * 8}px`
   let configUI
   if (field.dataType === 'boolean' && field.userInsertType === 'toggle') {
      configUI = (
         <Toggle
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={(name, value) => onConfigChange(name, value)}
         />
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
         />
      )
   } else if (
      field.dataType === 'text' &&
      field.userInsertType === 'textField'
   ) {
      configUI = (
         <Text
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
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
         />
      )
   } else if (field.dataType === 'time' && field.userInsertType === 'time') {
      configUI = (
         <Time
            fieldDetail={field}
            marginLeft={indentation}
            path={fieldKey}
            onConfigChange={onConfigChange}
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
   }
   return <div data-config-path={fieldKey}>{configUI}</div>
}
export const FieldUI = ({ fieldKey, configJSON, onConfigChange, value }) => {
   const { editMode } = useEditMode()
   return (
      <div>
         {getFieldUI(fieldKey, configJSON, onConfigChange, editMode, value)}
      </div>
   )
}
