import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Text,
   Spacer,
   Form,
   Dropdown,
   ButtonTile,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
} from '@dailykit/ui'
import validator from '../validator'
import { KIOSK } from '../../../../../graphql'
import { Wrapper, Label } from '../../../brand/styled'
import { logger } from '../../../../../../../shared/utils'
import { useTabs } from '../../../../../../../shared/providers'
import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'

export const BasicInfo = () => {
   const params = useParams()
   const [locationList, setLocationList] = React.useState([])
   const [printerList, setPrinterList] = React.useState([])
   const { tab, addTab, setTabTitle } = useTabs()
   const [title, setTitle] = React.useState({
      value: '',
      accessUrl: '',
      printerId: '',
      password: '',
      location: '',
      locationId: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   const { error, loading } = useSubscription(KIOSK.KIOSK, {
      variables: {
         id: { _eq: params.id },
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { kiosk = {} },
         },
      }) => {
         console.log('data is:', kiosk)
         setTitle({
            value: kiosk[0].kioskLabel || '',
            accessUrl: kiosk[0].accessUrl || '',
            printerId: kiosk[0].printerId || '',
            password: kiosk[0].password || '',
            location: kiosk[0].location?.city || '',
            locationId: kiosk[0].location?.id || '',
            meta: {
               isValid: kiosk[0].kioskLabel ? true : false,
               isTouched: false,
               errors: [],
            },
         })
         setTabTitle(kiosk[0].kioskLabel || '')
         //  setPrinterList(prevPrinterList => [
         //     ...prevPrinterList,
         //     {
         //        id: kiosk[0].printerId || '',
         //        title: kiosk[0]?.printerId?.label || '',
         //     },
         //  ])
      },
   })

   // calling printers data
   // const [printerList, setPrinterList] = React.useState([{printerId:'', printerName: ''}])
   const { error1, loading1, data1 } = useSubscription(KIOSK.PRINTERS, {
      onSubscriptionData: ({
         subscriptionData: {
            data: { printers = [] },
         },
      }) => {
         // setPrinterList(printers.map(printers =>   ({id: printers.printNodeId, title: printers.name}) ))
         //  const name1 = printers.map(printers => {
         //     return { id: printers.printNodeId, title: printers.name, }
         //  })
         //  setPrinterList(name1)
         let printersData = printers.map(printer => {
            return {
               id: printer?.printNodeId || '',
               title: printer?.name || '',
            }
         })
         setPrinterList(previousData => [...previousData, ...printersData])
         console.log('printers:', printers, 'printerList:', printerList)
      },
   })
   console.log(printerList)

   const { error2, loading2, data2 } = useSubscription(KIOSK.LOCATIONS, {
      onSubscriptionData: ({
         subscriptionData: {
            data: { locations = [] },
         },
      }) => {
         let locationsData = locations.map(location => {
            return {
               id: location?.id || '',
               title: location?.city || '',
            }
         })
         setLocationList(previousLocation => [
            ...previousLocation,
            ...locationsData,
         ])
         console.log('locations:', locations, 'locationList:', locationList)
      },
   })

   const [updateKiosk] = useMutation(KIOSK.UPDATE_KIOSK, {
      onCompleted: data => {
         toast.success('Updated!')
         console.log('update kiosk data=>>', data)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const updateKioskAccessUrl = async () => {
      const { isValid, errors } = validator.url(title.accessUrl)
      if (isValid) {
         const { data } = await updateKiosk({
            variables: {
               id: params.id,
               _set: {
                  accessUrl: title.accessUrl,
               },
            },
         })
      }
      setTitle({
         ...title,
         meta: {
            isTouched: true,
            errors,
            isValid,
         },
      })
   }

   const updateKioskAccessPassword = async () => {
      const { isValid, errors } = validator.name(title.password)
      if (isValid) {
         const { data } = await updateKiosk({
            variables: {
               id: params.id,
               _set: {
                  accessPassword: title.password,
               },
            },
         })
      }
      setTitle({
         ...title,
         meta: {
            isTouched: true,
            errors,
            isValid,
         },
      })
   }

   const updateKioskLabel = async () => {
      const { isValid, errors } = validator.name(title.value)
      if (isValid) {
         const { data } = await updateKiosk({
            variables: {
               id: params.id,
               _set: {
                  internalLocationKioskLabel: title.value,
               },
            },
         })
      }
      setTitle({
         ...title,
         meta: {
            isTouched: true,
            errors,
            isValid,
         },
      })
   }

   const updateKioskPrinter = async printer => {
      const { isValid, errors } = validator.name(printer[0].title)
      if (isValid) {
         console.log('update printer printer====?', printer)
         const { data } = await updateKiosk({
            variables: {
               id: params.id,
               _set: {
                  printerId: printer[0].id,
               },
            },
         })
      }
      setTitle({
         ...title,
         meta: {
            isTouched: true,
            errors,
            isValid,
         },
      })
   }

   const updateKioskLocation = async newLocation => {
      const { isValid, errors } = validator.name(newLocation.title)
      if (isValid) {
         console.log('update newLocation====?', newLocation)
         const { data } = await updateKiosk({
            variables: {
               id: params.id,
               _set: {
                  locationId: newLocation.id,
               },
            },
         })
      }
      setTitle({
         ...title,
         meta: {
            isTouched: true,
            errors,
            isValid,
         },
      })
   }

   return (
      <div>
         <Flex padding="16px">
            <>
               <Form.Group>
                  <Form.Label>Kiosk Name</Form.Label>

                  <Form.Text
                     id="kioskLabel"
                     name="kioskLabel"
                     value={title.value}
                     placeholder="Enter kiosk name"
                     onChange={e =>
                        setTitle({ ...title, value: e.target.value })
                     }
                     onBlur={updateKioskLabel}
                     hasError={!title.meta.isValid && title.isTouched}
                  />
                  {title.meta.isTouched &&
                     !title.meta.isValid &&
                     title.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Spacer yAxis size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="accessUrl" title="accessUrl">
                     Access Url*
                  </Form.Label>
                  <Form.Text
                     id="accessUrl"
                     name="accessUrl"
                     value={title.accessUrl}
                     placeholder="Enter access url"
                     onChange={e =>
                        setTitle({ ...title, accessUrl: e.target.value })
                     }
                     onBlur={updateKioskAccessUrl}
                     hasError={!title.meta.isValid && title.isTouched}
                  />
                  {title.meta.isTouched &&
                     !title.meta.isValid &&
                     title.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Spacer yAxis size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="password" title="password">
                     Access Password
                  </Form.Label>
                  <Form.Password
                     value={title.password}
                     placeholder="Enter access password"
                     id="password"
                     name="password"
                     onChange={e =>
                        setTitle({ ...title, password: e.target.value })
                     }
                     onBlur={updateKioskAccessPassword}
                     hasError={!title.meta.isValid && title.isTouched}
                  />
                  {title.meta.isTouched &&
                     !title.meta.isValid &&
                     title.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Spacer yAxis size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="printerId" title="printerId">
                     Printer
                  </Form.Label>
                  <Form.Text
                     value={title.printerId}
                     placeholder="Enter printer ID"
                     id="printerId"
                     name="printerId"
                     //  onChange={e =>
                     //     setTitle({ ...title, printerId: e.target.value })
                     //  }
                     //  onBlur={updateKioskPrinter}
                     //  hasError={!title.meta.isValid && title.isTouched}
                  />
                  <Dropdown
                     type="single"
                     //  variant="revamp"
                     defaultName={title.printerId}
                     isLoading={loading}
                     addOption={printerList}
                     options={printerList}
                     selectedOption={e => updateKioskPrinter(e)}
                     placeholder="Enter printer name"
                     addOption={() => console.log('printer ADDED')}
                  />
               </Form.Group>

               <Spacer yAxis size="16px" />
               <Form.Group>
                  <Form.Label>Location</Form.Label>
                  {/* <Form.Text
                     value={title.location}
                     placeholder="Enter location"
                  /> */}
                  <Dropdown
                     type="single"
                     //  variant="revamp"
                     defaultName={title.location}
                     isLoading={loading}
                     addOption={locationList}
                     options={locationList}
                     selectedOption={e => updateKioskLocation(e)}
                     placeholder="Choose kiosk location"
                     addOption={() => console.log('location ADDED')}
                  />
               </Form.Group>
            </>
         </Flex>
      </div>
   )
}
