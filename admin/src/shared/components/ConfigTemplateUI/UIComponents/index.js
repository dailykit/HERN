import React, { useState } from 'react'
import styled from 'styled-components'
import {
   Form,
   Loader,
   Flex,
   IconButton,
   Spacer,
   Dropdown,
   PlusIcon,
   Tunnels,
   Tunnel,
   TunnelHeader,
   useTunnel,
} from '@dailykit/ui'
import {
   Tooltip,
   RichTextEditor,
   AssetUploader,
   InlineLoader,
   Banner,
   ErrorState,
} from '../../../components'
import { EditIcon } from '../../../assets/icons'
import PhoneInput, {
   formatPhoneNumber,
   formatPhoneNumberIntl,
   isValidPhoneNumber,
} from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import gql from 'graphql-tag'
import { useSubscription } from '@apollo/react-hooks'
import validator from '../../../../apps/brands/views/validator'
export const Text = ({
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
   isValid,
   setIsValid,
   validationType = null,
}) => {
   const [errorMessage, setErrorMessage] = React.useState([])
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
            <Form.Text
               id={path}
               name={path}
               onBlur={e => {
                  if (validationType == 'email') {
                     const { isValid: isValidEmail, errors } = validator.email(
                        e.target.value
                     )
                     setIsValid(isValidEmail)
                     setErrorMessage(errors)
                     return
                  }
               }}
               onChange={onConfigChange}
               value={fieldDetail?.value || fieldDetail.default}
               placeholder="Enter the orientation"
            />

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
      margin={`0 0 0 ${marginLeft}`}
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

export const Number = ({ fieldDetail, marginLeft, path, onConfigChange }) => (
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
      <Form.Number
         id={path}
         name={path}
         onChange={onConfigChange}
         value={fieldDetail?.value || fieldDetail.default}
         placeholder="Enter integer value"
      />
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
export const Date = ({ fieldDetail, marginLeft, path, onConfigChange }) => (
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
      <Form.Date
         id={path}
         name={path}
         onChange={onConfigChange}
         value={fieldDetail?.value || fieldDetail.default}
      />
   </Flex>
)
export const Time = ({ fieldDetail, marginLeft, path, onConfigChange }) => (
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
      <Form.Time
         id={path}
         name={path}
         onChange={onConfigChange}
         value={fieldDetail?.value || fieldDetail.default}
      />
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

export const TextArea = ({ fieldDetail, marginLeft, path, onConfigChange }) => (
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
      <Form.TextArea
         id={path}
         name={path}
         onChange={onConfigChange}
         value={fieldDetail?.value || fieldDetail.default}
      />
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

export const RichText = ({ fieldDetail, marginLeft, path, onConfigChange }) => {
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
         <RichTextEditor
            defaultValue={fieldDetail?.value || fieldDetail.default}
            onChange={html => onEditorChange(html)}
         />
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
   setIsValid,
   fieldDetail,
   marginLeft,
   path,
   onConfigChange,
}) => {
   return (
      <>
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
            <PhoneInput
               id={path}
               name={path}
               initialValueFormat="national"
               value={fieldDetail?.value}
               onChange={result => {
                  const e = { target: { name: path, value: result } }
                  onConfigChange(e, result)
                  console.log(result, 'result')
                  if (result) {
                     const isValid = isValidPhoneNumber(result)
                     isValid ? setIsValid(true) : setIsValid(false)
                  }
               }}
               placeholder="Enter your phone number"
            />
         </Flex>
      </>
   )
}
export const ImageUpload = props => {
   // props
   const { fieldDetail, path, onConfigChange, configSaveHandler, configJSON } = props
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   const updateSetting = (data = {}) => {
      if ('url' in data) {
         const e = { target: { name: path, value: data.url } }
         onConfigChange(e, data.url)
         configSaveHandler(configJSON)
      }
      closeTunnel(1)
   }
   return (
      <>
         <Flex container alignItems="flex-start">
            <Form.Label title={fieldDetail.label} htmlFor="textArea">
               {fieldDetail.label.toUpperCase()}
            </Form.Label>
            <Tooltip identifier="textArea_component_info" />
         </Flex>
         <Spacer size="16px" />
         {fieldDetail?.value ? (
            <ImageContainer width="120px" height="120px">
               <div>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={() => openTunnel(1)}
                  >
                     <EditIcon />
                  </IconButton>
               </div>
               <img src={fieldDetail?.value} alt="Brand Logo" />
            </ImageContainer>
         ) : (
            <ImageContainer width="120px" height="120px" noThumb>
               <div>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={() => openTunnel(1)}
                  >
                     <PlusIcon />
                  </IconButton>
               </div>
            </ImageContainer>
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
   )
}

export const ImageContainer = styled.div`
   padding: 8px;
   position: relative;
   border-radius: 2px;
   border: 1px solid #e3e3e3;
   height: ${props => props.height || 'auto'};
   width: ${props => props.width || 'auto'};
   img {
      width: 100%;
      height: 100%;
      object-fit: cover;
   }
   div {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      position: absolute;
      background: linear-gradient(
         212deg,
         rgba(0, 0, 0, 1) 0%,
         rgba(255, 255, 255, 0) 29%
      );
   }
   button {
      float: right;
      margin: 4px 4px 0 0;
   }
`
