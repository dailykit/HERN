import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabs,
   Spacer,
} from '@dailykit/ui'
import React from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { InlineLoader, Tooltip } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { LOCATIONS } from '../../../graphql'
import validator from '../../validator'
import { Address, Assets, LinkedBrands, LocationDetails } from './components'
import { ResponsiveFlex, StyledFlex } from './styled'

export const Location = () => {
   const { id } = useParams()
   const [state, setState] = React.useState({})
   const [isLoading, setIsLoading] = React.useState(true)
   const [locationDetails, setLocationDetails] = React.useState({
      label: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      isActive: false,
   })

   //subscription
   const { loading, error } = useSubscription(LOCATIONS.VIEW, {
      variables: {
         id: id,
      },
      onSubscriptionData: data => {
         //  console.log(data.subscriptionData.data.brands_location[0])
         const locationData = data.subscriptionData.data.brands_location[0]
         setState(locationData)
         setLocationDetails({
            ...locationDetails,
            label: {
               ...locationDetails.label,
               value: locationData.label,
            },
            isActive: locationData.isActive,
         })
         setIsLoading(false)
      },
   })

   //mutation
   const [updateLocation] = useMutation(LOCATIONS.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log('error', error)
         logger(error)
      },
   })
   const onChange = (field, value) => {
      setLocationDetails({
         ...locationDetails,
         [field]: {
            ...locationDetails[field],
            value,
         },
      })
   }
   const onBlur = field => {
      const { isValid, errors } = validator.text(locationDetails[field].value)
      if (isValid) {
         updateLocation({
            variables: {
               id: id,
               _set: {
                  label: locationDetails[field].value,
               },
            },
         })
      }
      setLocationDetails({
         ...locationDetails,
         [field]: {
            ...locationDetails[field],
            meta: {
               isTouched: true,
               isValid,
               errors,
            },
         },
      })
   }
   const togglePublish = () => {
      const val = !locationDetails.isActive
      updateLocation({
         variables: {
            id: id,
            _set: {
               isActive: val,
            },
         },
      })
   }
   if (isLoading) return <InlineLoader />
   return (
      <>
         <ResponsiveFlex
            container
            justifyContent="space-between"
            alignItems="center"
            padding="16px 0"
            maxWidth="1280px"
            width="calc(100vw - 64px)"
            margin="0 auto"
            style={{ borderBottom: '1px solid #f3f3f3' }}
         >
            <Flex
               container
               as="header"
               justifyContent="space-between"
               width="100%"
               style={{ marginLeft: '4px' }}
            >
               <Form.Group>
                  <Form.Text
                     id="label"
                     name="label"
                     value={locationDetails.label.value}
                     variant="revamp"
                     placeholder="Enter Location Name"
                     onChange={e => onChange('label', e.target.value)}
                     onBlur={e => onBlur('label')}
                     hasError={
                        !locationDetails.label.meta.isValid &&
                        locationDetails.label.meta.isTouched
                     }
                     style={{ width: '100%', textAlign: 'left' }}
                  />
                  {locationDetails.label.meta.isTouched &&
                     !locationDetails.label.meta.isValid &&
                     locationDetails.label.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Form.Toggle
                  name="active"
                  value={locationDetails.isActive}
                  onChange={togglePublish}
               >
                  <Flex
                     container
                     alignItems="center"
                     style={{ paddingRight: '0px' }}
                  >
                     Active
                     <Tooltip identifier="brand_location_active" />
                  </Flex>
               </Form.Toggle>
            </Flex>
         </ResponsiveFlex>
         <Flex as="main" padding="8px 20px" minHeight="calc(100vh - 130px)">
            <HorizontalTabs>
               <HorizontalTabList>
                  <HorizontalTab>Basic Information</HorizontalTab>
                  <HorizontalTab>Links</HorizontalTab>
               </HorizontalTabList>
               <HorizontalTabPanels>
                  <HorizontalTabPanel>
                     <StyledFlex
                        as="section"
                        // container
                        // alignItems="start"
                        // justifyContent="space-between"
                     >
                        {/* <Address state={state} locationId={id} /> */}
                        <LocationDetails state={state} locationId={id} />
                        {/* <Spacer xAxis size="16px" />
                        <Assets state={state} locationId={id} /> */}
                     </StyledFlex>
                  </HorizontalTabPanel>
                  <HorizontalTabPanel>
                     <LinkedBrands state={state} locationId={id} />
                  </HorizontalTabPanel>
               </HorizontalTabPanels>
            </HorizontalTabs>
         </Flex>
      </>
   )
}
