import { useMutation } from '@apollo/react-hooks'
import {
   ButtonGroup,
   ButtonTile,
   ComboButton,
   Flex,
   Form,
   IconButton,
   Spacer,
   TunnelHeader,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { LOCATIONS } from '../../../../apps/brands/graphql'
import { DeleteIcon, PlusIcon } from '../../../assets/icons'
import { Banner } from '../../../components'
import { useTabs } from '../../../providers'
import validator from '../../validator'

const CreateBrandLocation = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)

   const locationInstance = {
      label: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      line1: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
      line2: {
         value: '',
         meta: {
            isTouched: false,
            isValid: true,
            errors: [],
         },
      },
   }
   const [location, setLocation] = React.useState([locationInstance])

   //mutation
   const [createLocation, { loading }] = useMutation(LOCATIONS.CREATE, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.insert_brands_location.returning.map(separateTab => {
                  addTab(
                     separateTab.label,
                     `/brands/locations/${separateTab.id}`
                  )
               })
            }
         }
         console.log('The input contains:', input)
         setLocation([locationInstance])
         toast.success('Successfully created the Location!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the Location, please try again!'),
   })

   const createLocationHandler = () => {
      try {
         const objects = location.filter(Boolean).map(eachLocation => ({
            label: `${eachLocation.label.value}`,
            locationAddress: {
               line1: `${eachLocation.line1.value}`,
               line2: `${eachLocation.line2.value}`,
            },
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createLocation({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }
   const removeField = index => {
      const newLocation = location
      if (newLocation.length > 1) {
         newLocation.splice(index, 1)
         setLocation([...newLocation])
      } else {
         toast.error('Location should atleast be 1 !')
      }
   }
   const onChange = (field, value, index) => {
      //serving, value, i
      const newLocation = [...location]
      console.log(newLocation)
      newLocation[index] = {
         ...newLocation[index],
         [field]: {
            ...newLocation[index][field],
            value,
         },
      }
      setLocation([...newLocation])
   }
   const onBlur = (field, index) => {
      const { isValid, errors } = validator.text(location[index][field].value)
      const newLocation = [...location]
      newLocation[index] = {
         ...newLocation[index],
         [field]: {
            ...newLocation[index][field],
            meta: {
               isTouched: false,
               isValid,
               errors,
            },
         },
      }
      setLocation([...newLocation])
      console.log(newLocation)
   }
   const save = type => {
      setClick(type)
      let locationValid = location.every(
         object =>
            object.label.meta.isValid &&
            object.line1.meta.isValid &&
            object.line2.meta.isValid
      )

      if (locationValid === true) {
         return createLocationHandler()
      }
      return toast.error('All fields must be filled!')
   }
   const close = () => {
      closeTunnel(1)
   }
   return (
      <>
         <TunnelHeader
            title="Add Location"
            right={{
               action: () => {
                  save('save')
               },
               title: loading && click === 'save' ? 'Saving...' : 'Save',
            }}
            extraButtons={[
               {
                  action: () => {
                     save('SaveAndOpen')
                  },
                  title:
                     loading && click === 'SaveAndOpen'
                        ? 'Saving...'
                        : 'Save & Open',
               },
            ]}
            close={close}
         />
         <Banner id="brand-app-location-create-location-tunnel-top" />
         <Flex padding="16px">
            {location.map((eachLocation, i) => (
               <>
                  <Flex
                     key={i}
                     style={{
                        border: '2px solid #ffffff',
                        boxShadow: '0px 1px 8px rgb(0 0 0 / 10%)',
                        padding: '16px',
                     }}
                  >
                     <Form.Group>
                        <Flex
                           container
                           style={{
                              alignItems: 'center',
                              justifyContent: 'space-between',
                           }}
                        >
                           <Form.Label
                              htmlFor={`locationLabel-${i}`}
                              title={`Location ${i + 1}`}
                           >
                              Label
                           </Form.Label>
                           <IconButton
                              type="ghost"
                              title="Delete this Location"
                              onClick={() => removeField(i)}
                              style={{
                                 width: '30px',
                                 height: '20px',
                                 marginBottom: '4px',
                              }}
                           >
                              <DeleteIcon color="#FF5A52" />
                           </IconButton>
                        </Flex>
                        <Form.Text
                           id={`location-${i}`}
                           name={`location-${i}`}
                           value={eachLocation.label.value}
                           placeholder="Enter Label"
                           onChange={e => onChange('label', e.target.value, i)}
                           onBlur={() => onBlur('label', i)}
                           hasError={
                              !eachLocation.label.meta.isValid &&
                              eachLocation.label.meta.isTouched
                           }
                        />
                        {!eachLocation.label.meta.isTouched &&
                           !eachLocation.label.meta.isValid &&
                           eachLocation.label.meta.errors.map(
                              (error, index) => (
                                 <Form.Error key={index}>{error}</Form.Error>
                              )
                           )}
                     </Form.Group>
                     <Spacer yAxis size="16px" />
                     <Form.Group>
                        <Form.Label
                           htmlFor={`locationLine1-${i}`}
                           title={`Location ${i + 1}`}
                        >
                           Address Line 1
                        </Form.Label>
                        <Form.Text
                           id={`location-${i}`}
                           name={`location-${i}`}
                           value={eachLocation.line1.value}
                           placeholder="Enter Address"
                           onChange={e => onChange('line1', e.target.value, i)}
                           onBlur={() => onBlur('line1', i)}
                           hasError={
                              !eachLocation.line1.meta.isValid &&
                              eachLocation.line1.meta.isTouched
                           }
                        />
                        {!eachLocation.line1.meta.isTouched &&
                           !eachLocation.line1.meta.isValid &&
                           eachLocation.line1.meta.errors.map(
                              (error, index) => (
                                 <Form.Error key={index}>{error}</Form.Error>
                              )
                           )}
                     </Form.Group>
                     <Spacer yAxis size="16px" />
                     <Form.Group>
                        <Form.Label
                           htmlFor={`locationLine2-${i}`}
                           title={`Location ${i + 1}`}
                        >
                           Address Line 2
                        </Form.Label>
                        <Form.Text
                           id={`location-${i}`}
                           name={`location-${i}`}
                           value={eachLocation.line2.value}
                           placeholder="Enter Address"
                           onChange={e => onChange('line2', e.target.value, i)}
                           onBlur={() => onBlur('line2', i)}
                           hasError={
                              !eachLocation.line2.meta.isValid &&
                              eachLocation.line2.meta.isTouched
                           }
                        />
                        {!eachLocation.line2.meta.isTouched &&
                           !eachLocation.line2.meta.isValid &&
                           eachLocation.line2.meta.errors.map(
                              (error, index) => (
                                 <Form.Error key={index}>{error}</Form.Error>
                              )
                           )}
                     </Form.Group>
                  </Flex>
                  <Spacer yAxis size="16px" />
               </>
            ))}

            <ButtonGroup>
               <ComboButton
                  type="ghost"
                  size="sm"
                  onClick={() => setLocation([...location, locationInstance])}
                  title="Click to add new location"
               >
                  <PlusIcon color="#367BF5" /> Add New Location
               </ComboButton>
            </ButtonGroup>
         </Flex>
         <Spacer xAxis size="24px" />
         <Banner id="brand-app-location-create-location-tunnel-bottom" />
      </>
   )
}

export default CreateBrandLocation
