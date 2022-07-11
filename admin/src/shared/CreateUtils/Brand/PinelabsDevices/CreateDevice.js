import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Dropdown,
   Flex,
   Form,
   Spacer,
   TunnelHeader,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { logger } from '../../../utils'
import { useTabs } from '../../../providers'
import validator from '../../validator'
import { KIOSK, PINELABS_DEVICES } from '../../../../apps/brands/graphql'
import { repeat } from 'lodash'
import { Banner, Tooltip } from '../../../components'

const CreateDevice = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [device, setDevice] = React.useState([
      {
         internalPineLabsDeviceLabel: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
         imei: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
         merchantStorePosCode: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createDevice, { loading }] = useMutation(
      PINELABS_DEVICES.CREATE_DEVICES,
      {
         onCompleted: input => {
            {
               // console.log('input coming for new device===>', input)
               // if (click === 'SaveAndOpen') {
               //    input.insert_deviceHub_pineLabsDevices.returning.map(
               //       separateTab => {
               //          addTab(
               //             separateTab.name,
               //             `/brands/pinelabs-devices/${separateTab.id}`
               //          )
               //       }
               //    )
               // }
            }
            // console.log('The input contains:', input)
            setDevice([
               {
                  internalPineLabsDeviceLabel: {
                     value: null,
                     meta: {
                        isValid: false,
                        isTouched: false,
                        errors: [],
                     },
                  },
                  imei: {
                     value: null,
                     meta: {
                        isValid: false,
                        isTouched: false,
                        errors: [],
                     },
                  },
                  merchantStorePosCode: {
                     value: null,
                     meta: {
                        isValid: false,
                        isTouched: false,
                        errors: [],
                     },
                  },
               },
            ])
            toast.success('Successfully created the device!')
            closeTunnel(1)
         },
         onError: () =>
            toast.success('Failed to create the device, please try again!'),
      }
   )

   const createDeviceHandler = () => {
      try {
         const objects = device.filter(Boolean).map(device => ({
            internalPineLabsDeviceLabel: `${device.internalPineLabsDeviceLabel.value}`,
            imei: `${device.imei.value}`,
            merchantStorePosCode: `${device.merchantStorePosCode.value}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createDevice({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedDevice = device
      const { name, value } = e.target
      if (name === `internalPineLabsDeviceLabel-${i}`) {
         const internalPineLabsDeviceLabelIs =
            updatedDevice[i].internalPineLabsDeviceLabel
         const internalPineLabsDeviceLabelMeta =
            updatedDevice[i].internalPineLabsDeviceLabel.meta
         // console.log('label is===>>>', `internalPineLabsDeviceLabel-${i}`)
         internalPineLabsDeviceLabelIs.value = value
         internalPineLabsDeviceLabelMeta.isTouched = true
         internalPineLabsDeviceLabelMeta.errors = validator.text(value).errors
         internalPineLabsDeviceLabelMeta.isValid = validator.text(value).isValid
         setDevice([...updatedDevice])
         // console.log('Device Name::::', device)
      }

      if (name === `imei-${i}`) {
         const imeiIs = updatedDevice[i].imei
         const imeiMeta = updatedDevice[i].imei.meta
         // console.log('label is===>>>', `imei-${i}`)
         imeiIs.value = value
         imeiMeta.isTouched = true
         imeiMeta.errors = validator.text(value).errors
         imeiMeta.isValid = validator.text(value).isValid
         setDevice([...updatedDevice])
         // console.log('Device Name::::', device)
      }

      if (name === `merchantStorePosCode-${i}`) {
         const merchantStorePosCodeIs = updatedDevice[i].merchantStorePosCode
         const merchantStorePosCodeMeta =
            updatedDevice[i].merchantStorePosCode.meta
         // console.log('label is===>>>', `merchantStorePosCode-${i}`)
         merchantStorePosCodeIs.value = value
         merchantStorePosCodeMeta.isTouched = true
         merchantStorePosCodeMeta.errors = validator.text(value).errors
         merchantStorePosCodeMeta.isValid = validator.text(value).isValid
         setDevice([...updatedDevice])
         // console.log('Device Name::::', device)
      }
   }
   // console.log('device :>> ', device)

   const save = type => {
      setClick(type)
      let deviceValid = true
      device.map(device => {
         deviceValid =
            device.internalPineLabsDeviceLabel.meta.isValid &&
            device.imei.meta.isValid &&
            device.merchantStorePosCode.meta.isValid
         deviceValid = deviceValid && true
         return deviceValid
      })

      if (deviceValid === true) {
         return createDeviceHandler()
      }
      return toast.error('device label is required!')
   }
   const close = () => {
      setDevice([
         {
            internalPineLabsDeviceLabel: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
            imei: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
            merchantStorePosCode: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
         },
      ])
      closeTunnel(1)
   }
   return (
      <>
         <TunnelHeader
            title="Add New Device"
            right={{
               action: () => {
                  save('save')
               },
               title: loading && click === 'save' ? 'Saving...' : 'Save',
               // disabled: types.filter(Boolean).length === 0,
            }}
            // extraButtons={[
            //    {
            //       action: () => {
            //          save('SaveAndOpen')
            //       },
            //       title:
            //          loading && click === 'SaveAndOpen'
            //             ? 'Saving...'
            //             : 'Save & Open',
            //    },
            // ]}
            close={close}
            tooltip={<Tooltip identifier="create_recipe_tunnelHeader" />}
         />
         <Banner id="product-app-recipe-create-recipe-tunnel-top" />
         <Flex padding="16px">
            {device.map((device, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`internalPineLabsDeviceLabel-${i}`}
                        title={`internalPineLabsDeviceLabel-${i}`}
                     >
                        Device Label*
                     </Form.Label>
                     <Form.Text
                        id={`internalPineLabsDeviceLabel-${i}`}
                        name={`internalPineLabsDeviceLabel-${i}`}
                        value={device.internalPineLabsDeviceLabel.value}
                        placeholder="Enter Device Name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e =>
                        //    onBlur(e, i, `internalPineLabsDeviceLabel-${i}`)
                        // }
                        hasError={
                           !device.internalPineLabsDeviceLabel.meta.isValid &&
                           device.internalPineLabsDeviceLabel.meta.isTouched
                        }
                     />
                     <Form.Label htmlFor={`imei-${i}`} title={`imei-${i}`}>
                        Device IMEI*
                     </Form.Label>
                     <Form.Text
                        id={`imei-${i}`}
                        name={`imei-${i}`}
                        value={device.imei.value}
                        placeholder="Enter Device IMEI Number"
                        onChange={e => onChange(e, i)}
                        // onBlur={e =>
                        //    onBlur(e, i, `imei-${i}`)
                        // }
                        hasError={
                           !device.imei.meta.isValid &&
                           device.imei.meta.isTouched
                        }
                     />
                     <Form.Label
                        htmlFor={`merchantStorePosCode-${i}`}
                        title={`merchantStorePosCode-${i}`}
                     >
                        Store POS Code*
                     </Form.Label>
                     <Form.Text
                        id={`merchantStorePosCode-${i}`}
                        name={`merchantStorePosCode-${i}`}
                        value={device.merchantStorePosCode.value}
                        placeholder="Enter Store POS Code"
                        onChange={e => onChange(e, i)}
                        // onBlur={e =>
                        //    onBlur(e, i, `merchantStorePosCode-${i}`)
                        // }
                        hasError={
                           !device.merchantStorePosCode.meta.isValid &&
                           device.merchantStorePosCode.meta.isTouched
                        }
                     />
                     {device.merchantStorePosCode.meta.isTouched &&
                        !device.merchantStorePosCode.meta.isValid &&
                        device.merchantStorePosCode.meta.errors.map(
                           (error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           )
                        )}
                  </Form.Group>
                  <hr
                     style={{
                        marginTop: '1rem',
                        marginBottom: '1rem',
                        borderTop: '1px dashed #367BF5',
                     }}
                  ></hr>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Device"
               onClick={() =>
                  setDevice([
                     ...device,
                     {
                        internalPineLabsDeviceLabel: {
                           value: null,
                           meta: {
                              isValid: false,
                              isTouched: false,
                              errors: [],
                           },
                        },
                        imei: {
                           value: null,
                           meta: {
                              isValid: false,
                              isTouched: false,
                              errors: [],
                           },
                        },
                        merchantStorePosCode: {
                           value: null,
                           meta: {
                              isValid: false,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     },
                  ])
               }
            />
         </Flex>
         <Spacer xAxis size="24px" />
         <Banner id="product-app-recipe-create-recipe-tunnel-bottom" />
      </>
   )
}

export default CreateDevice
