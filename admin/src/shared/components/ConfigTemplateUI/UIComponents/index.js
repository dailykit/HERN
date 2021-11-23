import React, { useState } from 'react'
import styled from 'styled-components'
import {
   Form,
   Flex,
   IconButton,
   Spacer,
   Dropdown,
   ButtonTile,
   Tunnels,
   Text,
   Tunnel,
   TunnelHeader,
   useTunnel,
} from '@dailykit/ui'
import { Image } from 'antd'
import {
   Tooltip,
   RichTextEditor,
   AssetUploader,
   InlineLoader,
   Banner,
   ErrorState,
} from '../../../components'
import { EditIcon, DeleteIcon } from '../../../assets/icons'
import PhoneInput, {
   formatPhoneNumber,
   formatPhoneNumberIntl,
   isValidPhoneNumber,
} from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import ReactHTMLParser from 'react-html-parser'
import gql from 'graphql-tag'
import { useSubscription } from '@apollo/react-hooks'
import validator from '../../../../apps/brands/views/validator'
export const TextBox = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
   isValid,
   setIsValid,
   validationType = null,
   editMode,
}) => {
   const [errorMessage, setErrorMessage] = React.useState([])
   const [emailValid, setEmailValid] = React.useState(true)

   React.useEffect(() => {
      if (!emailValid) {
         setIsValid(false)
      } else {
         setIsValid(prev => (prev === false ? false : true))
      }
   }, [emailValid])

   return (
      <Flex
         container
         justifyContent="space-between"
         alignItems="center"
         margin={`0 0 0 ${marginLeft}`}
      >
         <Flex container alignItems="flex-end">
            <Form.Label title={fieldDetail.label} htmlFor="text">
               {fieldDetail.label.toUpperCase()}
            </Form.Label>
            <Tooltip identifier="text_component_info" />
         </Flex>
         <Form.Group>
            {editMode ? (
               <Form.Text
                  id={path}
                  name={path}
                  onBlur={e => {
                     if (validationType == 'email') {
                        const { isValid: isValidEmail, errors } =
                           validator.email(e.target.value)
                        setEmailValid(isValidEmail)
                        setErrorMessage(errors)
                        return
                     }
                  }}
                  onChange={onConfigChange}
                  value={fieldDetail?.value}
                  placeholder={`Enter the ${fieldDetail.label.toLowerCase()}`}
               />
            ) : (
               <Text as="h3" style={{ fontSize: '16px' }}>
                  {fieldDetail?.value || fieldDetail.default}
                  {fieldDetail?.value == '' && fieldDetail.default == '' && (
                     <NoValueSpan>Not specified</NoValueSpan>
                  )}
               </Text>
            )}

            {errorMessage.length !== 0 && (
               <Form.Error> {errorMessage[0]}</Form.Error>
            )}
         </Form.Group>
      </Flex>
   )
}

export const Toggle = ({ fieldDetail, marginLeft, path, onConfigChange }) => (
   <Flex
      container
      justifyContent="space-between"
      alignItems="center"
      margin={`${marginLeft} 0 0 ${marginLeft}`}
   >
      <Flex container alignItems="flex-end">
         <Form.Label title={fieldDetail.label} htmlFor="toggle">
            {fieldDetail.label.toUpperCase()}
         </Form.Label>
         <Tooltip identifier="toggle_component_info" />
      </Flex>
      <Form.Toggle
         name={path}
         onChange={e => onConfigChange(e, !fieldDetail.value)}
         value={fieldDetail.value}
         children={fieldDetail.value ? 'ON' : 'OFF'}
      />
   </Flex>
)

export const ColorPicker = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
}) => (
   <Flex
      container
      justifyContent="space-between"
      alignItems="center"
      margin={`0 0 0 ${marginLeft}`}
   >
      <Flex container alignItems="flex-end">
         <Form.Label title={fieldDetail.label} htmlFor="color">
            {fieldDetail.label.toUpperCase()}
         </Form.Label>
         <Tooltip identifier="color_component_info" />
      </Flex>
      <input
         type="color"
         id="favcolor"
         name={path}
         value={fieldDetail?.value || fieldDetail.default}
         onChange={onConfigChange}
      />
   </Flex>
)

export const Number = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
   editMode,
}) => (
   <Flex
      container
      justifyContent="space-between"
      alignItems="center"
      margin={`0 0 0 ${marginLeft}`}
   >
      <Flex container alignItems="flex-end">
         <Form.Label title={fieldDetail.label} htmlFor="number">
            {fieldDetail.label.toUpperCase()}
         </Form.Label>
         <Tooltip identifier="number_component_info" />
      </Flex>
      {editMode ? (
         <Form.Number
            id={path}
            name={path}
            onChange={onConfigChange}
            value={fieldDetail?.value || fieldDetail.default}
            placeholder="Enter integer value"
         />
      ) : (
         <Text as="h4">{fieldDetail?.value || fieldDetail.default}</Text>
      )}
   </Flex>
)

export const Checkbox = ({ fieldDetail, marginLeft, path, onConfigChange }) => (
   <Flex
      container
      justifyContent="space-between"
      alignItems="center"
      margin={`0 0 0 ${marginLeft}`}
   >
      <Flex container alignItems="flex-end">
         <Form.Label title={fieldDetail.label} htmlFor="checkbox">
            {fieldDetail.label.toUpperCase()}
         </Form.Label>
         <Tooltip identifier="checkbox_component_info" />
      </Flex>
      <Form.Checkbox
         id={path}
         name={path}
         onChange={e => onConfigChange(e, !fieldDetail.value)}
         value={fieldDetail.value}
      />
   </Flex>
)
export const Date = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
   editMode,
}) => (
   <Flex
      container
      justifyContent="space-between"
      alignItems="center"
      margin={`0 0 0 ${marginLeft}`}
   >
      <Flex container alignItems="flex-end">
         <Form.Label title={fieldDetail.label} htmlFor="date">
            {fieldDetail.label.toUpperCase()}
         </Form.Label>
         <Tooltip identifier="date_component_info" />
      </Flex>
      {editMode ? (
         <Form.Date
            id={path}
            name={path}
            onChange={onConfigChange}
            value={fieldDetail?.value || fieldDetail.default}
         />
      ) : (
         <Text as="h4">{fieldDetail?.value || fieldDetail.default}</Text>
      )}
   </Flex>
)
export const Time = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
   editMode,
}) => (
   <Flex
      container
      justifyContent="space-between"
      alignItems="center"
      margin={`0 0 0 ${marginLeft}`}
   >
      <Flex container alignItems="flex-end">
         <Form.Label title={fieldDetail.label} htmlFor="time">
            {fieldDetail.label.toUpperCase()}
         </Form.Label>
         <Tooltip identifier="time_component_info" />
      </Flex>
      {editMode ? (
         <Form.Time
            id={path}
            name={path}
            onChange={onConfigChange}
            value={fieldDetail?.value || fieldDetail.default}
         />
      ) : (
         <Text as="h4">{fieldDetail?.value || fieldDetail.default}</Text>
      )}
   </Flex>
)
export const Select = ({ fieldDetail, marginLeft, path, onConfigChange }) => {
   const [searchOption, setSearchOption] = useState('')
   const [searchResult, setSearchResult] = useState(fieldDetail?.options)
   const selectedOptionHandler = options => {
      const e = {
         target: {
            name: path,
         },
      }
      onConfigChange(e, options)
   }

   React.useEffect(() => {
      const result = fieldDetail?.options.filter(option =>
         option.title.toLowerCase().includes(searchOption)
      )
      setSearchResult(result)
   }, [searchOption])
   return (
      <Flex
         container
         justifyContent="space-between"
         alignItems="center"
         margin={`0 0 0 ${marginLeft}`}
      >
         <Flex container alignItems="flex-end">
            <Form.Label title={fieldDetail.label} htmlFor="select">
               {fieldDetail.label.toUpperCase()}
            </Form.Label>
            <Tooltip identifier="select_component_info" />
         </Flex>
         <Dropdown
            type={fieldDetail?.type || 'single'}
            options={searchResult}
            defaultValue={
               fieldDetail?.type === 'single' && fieldDetail?.value?.id
            }
            defaultOptions={fieldDetail?.value}
            searchedOption={option => setSearchOption(option)}
            selectedOption={option => selectedOptionHandler(option)}
            placeholder="type what you're looking for..."
         />
      </Flex>
   )
}

export const TextArea = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
   editMode,
}) => (
   <Flex
      container
      justifyContent="space-between"
      alignItems="center"
      margin={`0 0 0 ${marginLeft}`}
   >
      <Flex container alignItems="flex-end">
         <Form.Label title={fieldDetail.label} htmlFor="textArea">
            {fieldDetail.label.toUpperCase()}
         </Form.Label>
         <Tooltip identifier="textArea_component_info" />
      </Flex>
      {editMode ? (
         <Form.TextArea
            id={path}
            name={path}
            onChange={onConfigChange}
            value={fieldDetail?.value || fieldDetail.default}
         />
      ) : (
         <Text as="h4">{fieldDetail?.value || fieldDetail.default}</Text>
      )}
   </Flex>
)
export const TextWithSelect = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
}) => (
   <Flex
      container
      justifyContent="space-between"
      alignItems="center"
      margin={`0 0 0 ${marginLeft}`}
   >
      <Flex container alignItems="flex-end">
         <Form.Label title={fieldDetail.label} htmlFor="textArea">
            {fieldDetail.label.toUpperCase()}
         </Form.Label>
         <Tooltip identifier="textArea_component_info" />
      </Flex>
      <Form.TextSelect>
         <Form.Text
            id={path}
            name={path}
            onChange={onConfigChange}
            placeholder="Enter text"
            value={fieldDetail?.text.value || fieldDetail.text.default}
         />
         <Form.Select
            id={path}
            name={path}
            onChange={onConfigChange}
            options={fieldDetail.select.options}
            value={fieldDetail.select.value}
            defaultValue={fieldDetail.select.default}
         />
      </Form.TextSelect>
   </Flex>
)
export const NumberWithSelect = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
}) => (
   <Flex
      container
      justifyContent="space-between"
      alignItems="center"
      margin={`0 0 0 ${marginLeft}`}
   >
      <Flex container alignItems="flex-end">
         <Form.Label title={fieldDetail.label} htmlFor="numberWithSelect">
            {fieldDetail.label.toUpperCase()}
         </Form.Label>
         <Tooltip identifier="textArea_component_info" />
      </Flex>
      <Form.TextSelect>
         <Form.Text
            id={path}
            name={path}
            onChange={onConfigChange}
            placeholder="Enter integer value"
            value={fieldDetail?.number.value || fieldDetail?.number.default}
         />
         <Form.Select
            id={path}
            name={path}
            onChange={onConfigChange}
            options={fieldDetail.select.options}
            value={fieldDetail.select.value}
            defaultValue={fieldDetail.select.default}
         />
      </Form.TextSelect>
   </Flex>
)

export const RichText = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
   editMode,
}) => {
   const onEditorChange = html => {
      const e = {
         target: {
            name: path,
         },
      }
      onConfigChange(e, html)
   }
   return (
      <Flex margin={`0 0 0 ${marginLeft}`}>
         <Flex container alignItems="flex-end">
            <Form.Label title={fieldDetail.label} htmlFor="richText">
               {fieldDetail.label.toUpperCase()}
            </Form.Label>
            <Tooltip identifier="RichText_component_info" />
         </Flex>
         <Form.Group>
            {editMode ? (
               <RichTextEditor
                  defaultValue={fieldDetail?.value || fieldDetail.default}
                  onChange={html => onEditorChange(html)}
               />
            ) : (
               <div style={{ background: '#f9f9f9', padding: '6px' }}>
                  {ReactHTMLParser(fieldDetail?.value)}
               </div>
            )}
         </Form.Group>
      </Flex>
   )
}
const S_COLLECTIONS = gql`
   subscription Collections {
      collections: onDemand_collectionDetails(order_by: { created_at: desc }) {
         id
         title: name
         value: name
      }
   }
`
export const CollectionSelector = props => {
   // props
   const { fieldDetail, marginLeft, path, onConfigChange } = props

   const {
      loading: subsLoading,
      error: subsError,
      data: { collections = [] } = {},
   } = useSubscription(S_COLLECTIONS)
   const selectedOptionHandler = options => {
      const e = {
         target: {
            name: path,
         },
      }
      onConfigChange(e, options)
   }
   if (subsLoading) {
      return <InlineLoader />
   }

   if (subsError) {
      return <ErrorState message="collections not found" />
   }

   return (
      <>
         <Flex
            container
            justifyContent="space-between"
            alignItems="center"
            margin={`0 0 0 ${marginLeft}`}
         >
            <Flex container alignItems="flex-end">
               <Form.Label title={fieldDetail.label} htmlFor="select">
                  {fieldDetail.label.toUpperCase()}
               </Form.Label>
               <Tooltip identifier="select_component_info" />
            </Flex>
            <Dropdown
               type={fieldDetail?.type || 'single'}
               options={collections}
               defaultOption={fieldDetail?.value}
               searchedOption={option => console.log(option)}
               selectedOption={option => selectedOptionHandler(option)}
               placeholder="choose collection..."
            />
         </Flex>
      </>
   )
}

export const PhoneNumberSelector = ({
   isValid,
   setIsValid,
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
   editMode,
   value,
   configJSON,
}) => {
   const [errorMessage, setErrorMessage] = React.useState([])

   React.useEffect(() => {
      const phoneNo = value.value || ''
      if (isValidPhoneNumber(phoneNo)) {
         setIsValid(true)
         setErrorMessage([])
      } else {
         setIsValid(false)
         setErrorMessage(['Invalid number'])
      }
   }, [configJSON])

   return (
      <PhoneNumSelector>
         <Flex
            container
            justifyContent="space-between"
            alignItems="center"
            margin={`0 0 0 ${marginLeft}`}
         >
            <Flex container alignItems="flex-end">
               <Form.Label title={fieldDetail.label} htmlFor="textArea">
                  {fieldDetail.label.toUpperCase()}
               </Form.Label>
               <Tooltip identifier="textArea_component_info" />
            </Flex>
            <Form.Group>
               {editMode ? (
                  <PhoneInput
                     id={path}
                     name={path}
                     initialValueFormat="national"
                     value={fieldDetail?.value}
                     onChange={result => {
                        const e = { target: { name: path, value: result } }
                        onConfigChange(e, result)
                     }}
                     placeholder="Enter your phone number"
                  />
               ) : (
                  <Text as="h4">{fieldDetail?.value}</Text>
               )}
               {errorMessage.length !== 0 && (
                  <Form.Error> {errorMessage[0]}</Form.Error>
               )}
            </Form.Group>
         </Flex>
      </PhoneNumSelector>
   )
}
export const ImageUpload = props => {
   // props
   const { fieldDetail, path, onConfigChange, editMode } = props
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const updateSetting = (data = {}) => {
      if ('url' in data) {
         const e = { target: { name: path, value: data.url } }
         onConfigChange(e, data.url)
      }
      closeTunnel(1)
   }
   return (
      <>
         {editMode ? (
            <>
               <Flex container alignItems="flex-start">
                  <Form.Label title={fieldDetail.label} htmlFor="textArea">
                     YOUR {fieldDetail.label.toUpperCase()}
                  </Form.Label>
                  <Tooltip identifier="textArea_component_info" />
               </Flex>
               <Spacer size="16px" />
               {fieldDetail?.value ? (
                  <ImageContainer width="120px" height="120px">
                     <div>
                        <IconButton
                           style={{ background: 'transparent' }}
                           size="sm"
                           type="solid"
                           onClick={() => openTunnel(1)}
                        >
                           <EditIcon />
                        </IconButton>
                        <IconButton
                           style={{
                              background: 'transparent',
                           }}
                           size="sm"
                           type="solid"
                           onClick={() => updateSetting({ url: '' })}
                        >
                           <DeleteIcon />
                        </IconButton>
                     </div>
                     <img src={fieldDetail?.value} alt="Brand Logo" />
                  </ImageContainer>
               ) : (
                  <ButtonTile
                     type="uploadImage"
                     size="sm"
                     text="Upload"
                     onClick={() => openTunnel(1)}
                     style={{
                        width: '170px',
                        height: '120px',
                        marginBottom: '10px',
                     }}
                  />
               )}
               <Tunnels tunnels={tunnels}>
                  <Tunnel layer={1} size="md">
                     <TunnelHeader
                        title="Add Brand Logo"
                        close={() => closeTunnel(1)}
                     />
                     <Banner id="brands-app-brands-brand-details-brand-logo-tunnel-top" />
                     <Flex padding="16px">
                        <AssetUploader
                           onAssetUpload={data => updateSetting(data)}
                           onImageSelect={data => updateSetting(data)}
                        />
                     </Flex>
                     <Banner id="brands-app-brands-brand-details-brand-logo-tunnel-bottom" />
                  </Tunnel>
               </Tunnels>
            </>
         ) : (
            <ImageContainer width="120px" height="120px">
               {' '}
               {fieldDetail?.value ? (
                  <img src={fieldDetail?.value} alt="Brand Logo" />
               ) : (
                  <div style={{ display: 'flex' }}>
                     <Image
                        width={170}
                        height={120}
                        src="error"
                        fallback="data:image/png;base64,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"
                     />{' '}
                     <Text as="p">You haven't uploaded an image yet.</Text>
                  </div>
               )}
            </ImageContainer>
         )}
      </>
   )
}

export const ImageContainer = styled.div`
   display: flex;
   flex-direction: row-reverse;
   justify-content: flex-end;
   height: ${props => props.height || 'auto'};
   width: ${props => props.width || 'auto'};
   position: relative;
   margin-bottom: 16px;
   img {
      width: 100%;
      height: 100%;
      object-fit: cover;
   }
   button {
      float: right;
      margin: 4px 4px 0 4px;
   }
`
export const PhoneNumSelector = styled.div`
   .PhoneInput {
      border-radius: 6px;
      border: 1px solid #e3e3e3;
      margin-top: 12px;
      width: 13rem;
   }
   .PhoneInputCountry {
      padding-left: 12px;
   }
   .PhoneInputInput {
      text-align: left;
      font-size: 16px;
      padding: 0 12px;
      height: 40px;
      border: none;
      border-left: 1px solid #e3e3e3;
   }
   h4 {
      font-size: 15px;
   }
`
export const NoValueSpan = styled.span`
   color: #919699;
   font-size: 14px;
   font-weight: 400;
`
