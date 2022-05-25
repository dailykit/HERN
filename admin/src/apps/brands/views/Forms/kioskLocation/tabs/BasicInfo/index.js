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
   ButtonGroup,
   TextButton,
} from '@dailykit/ui'
import { CopyIcon } from '../../../../../../editor/assets/Icons'
import validator from '../validator'
import { KIOSK } from '../../../../../graphql'
import { Wrapper, Label } from '../../../brand/styled'
import { logger } from '../../../../../../../shared/utils'
import { useTabs } from '../../../../../../../shared/providers'
import copy from 'copy-to-clipboard'
import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import moment from 'moment'
import { CheckIcon } from '../../../../../assets/icons'

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
   const [isPasswordCopied, setIsPasswordCopied] = React.useState(false)
   const [isKioskStatusActive, setIsKioskStatusActive] = React.useState(false)

   const { error, loading } = useSubscription(KIOSK.KIOSK, {
      variables: {
         id: { _eq: params.id },
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { kiosk = {} },
         },
      }) => {
         setIsKioskStatusActive(prev => {
            const timeDiff = moment
               .duration(moment().diff(moment(kiosk[0].lastActiveTime)))
               .asSeconds()
            return timeDiff < 65
         })
         setTitle({
            value: kiosk[0].kioskLabel || '',
            accessUrl: kiosk[0].accessUrl || '',
            printerId: kiosk[0].printerId || '',
            password: kiosk[0].accessPassword,
            location: kiosk[0].location?.label || '',
            locationId: kiosk[0].location?.id || '',
            meta: {
               isValid: kiosk[0].kioskLabel ? true : false,
               isTouched: false,
               errors: [],
            },
            lastActiveTime: kiosk[0]?.lastActiveTime,
         })
         setTabTitle(kiosk[0].kioskLabel || '')
      },
   })

   // calling printers data
   // const [printerList, setPrinterList] = React.useState([{printerId:'', printerName: ''}])
   const { PrinterError, PrinterListLoading, PrinterData } = useSubscription(
      KIOSK.PRINTERS,
      {
         onSubscriptionData: ({
            subscriptionData: {
               data: { printers = [] },
            },
         }) => {
            let printersData = printers.map(printer => {
               return {
                  id: printer?.printNodeId || '',
                  title: printer?.name || '',
                  description:
                     printer?.printNodeId +
                        '-' +
                        printer?.name +
                        '-' +
                        printer?.computer?.name || '',
               }
            })
            setPrinterList(previousData => [...previousData, ...printersData])
            // console.log('printers:', printers, 'printerList:', printerList)
         },
      }
   )
   // console.log(printerList)

   const { locationError, locationListLoading, locationData } = useSubscription(
      KIOSK.LOCATIONS,
      {
         onSubscriptionData: ({
            subscriptionData: {
               data: { locations = [] },
            },
         }) => {
            let locationsData = locations.map(location => {
               return {
                  id: location?.id || '',
                  title: location?.label || '',
                  description:
                     location?.id +
                        '-' +
                        location?.label +
                        '-' +
                        location?.city || '',
               }
            })
            setLocationList(previousLocation => [
               ...previousLocation,
               ...locationsData,
            ])
            // console.log('locations:', locations, 'locationList:', locationList)
         },
      }
   )

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

   const generatePwd = () => {
      let newPwd = title.value + '@' + params.id
      // console.log('pwd::', newPwd)
      return newPwd
   }

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
      const { isValid, errors } = validator.name(printer?.title)
      if (isValid) {
         console.log('update printer printer====?', printer)
         const { data } = await updateKiosk({
            variables: {
               id: params.id,
               _set: {
                  printerId: printer?.id,
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
   if (loading || PrinterListLoading || locationListLoading) {
      // console.log('loadings::', loading, PrinterListLoading)
      return <InlineLoader />
   }
   return (
      <div>
         <Flex padding="16px">
            <>
               <Flex container alignItems="center">
                  <Text as="h4">Kiosk Status:</Text>
                  <Flex container alignItems="center">
                     <Spacer size="16px" xAxis />
                     <div
                        style={{
                           width: '10px',
                           height: '10px',
                           borderRadius: '5px',
                           backgroundColor: `${
                              isKioskStatusActive ? '#2EB086' : '#FF4949'
                           }`,
                        }}
                     ></div>
                     <Spacer size="10px" xAxis />
                     <Text as="text2">
                        {isKioskStatusActive ? 'Online' : 'Offline'}
                     </Text>
                  </Flex>
                  <Spacer size="30px" xAxis />
                  <Flex container alignItems="center">
                     <Spacer size="16px" xAxis />
                     <Text as="h4">Last Update:</Text>
                     <Spacer size="16px" xAxis />
                     <Text as="text2">
                        {moment(title.lastActiveTime).format(
                           'YYYY-MM-DD HH:mm:ss'
                        )}
                     </Text>
                  </Flex>
               </Flex>
               <Spacer yAxis size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="password" title="password">
                     <ButtonGroup
                        style={{ gap: '5px' }}
                        onClick={() => {
                           copy(title.password)
                           setIsPasswordCopied(true)
                           setTimeout(() => {
                              setIsPasswordCopied(false)
                           }, 3000)
                        }}
                     >
                        {'Access Password   '}
                        <div title={isPasswordCopied ? 'Copied' : 'Copy'}>
                           {isPasswordCopied ? (
                              <CheckIcon size={20} />
                           ) : (
                              <CopyIcon size={20} />
                           )}
                        </div>{' '}
                     </ButtonGroup>
                  </Form.Label>
                  <Flex container alignItems="center">
                     <Flex>
                        <Form.Text
                           value={title.password}
                           placeholder="Enter access password"
                           id="password"
                           name="password"
                           onChange={e =>
                              setTitle({ ...title, password: e.target.value })
                           }
                           // onBlur={updateKioskAccessPassword}
                           hasError={!title.meta.isValid && title.isTouched}
                        />
                        {title.meta.isTouched &&
                           !title.meta.isValid &&
                           title.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Flex>
                     <Spacer xAxis size="15px" />
                     <TextButton
                        type="outline"
                        size="sm"
                        onClick={updateKioskAccessPassword}
                     >
                        Save
                     </TextButton>
                  </Flex>
               </Form.Group>

               <Spacer yAxis size="16px" />
               <Flex width="35%">
                  <Form.Group>
                     <Form.Label htmlFor="printerId" title="printerId">
                        Printer
                     </Form.Label>
                     {/* <Form.Text
                     value={title.printerId}
                     placeholder="Enter printer ID"
                     id="printerId"
                     name="printerId"
                     //  onChange={e =>
                     //     setTitle({ ...title, printerId: e.target.value })
                     //  }
                     //  onBlur={updateKioskPrinter}
                     //  hasError={!title.meta.isValid && title.isTouched}
                  /> */}
                     <Dropdown
                        type="single"
                        //  variant="revamp"
                        defaultOption={{
                           id: title.printerId,
                        }}
                        isLoading={loading}
                        addOption={printerList}
                        options={printerList}
                        searchedOption={() => {}}
                        selectedOption={e => updateKioskPrinter(e)}
                        placeholder="Enter printer name"
                     />
                  </Form.Group>
               </Flex>

               <Spacer yAxis size="16px" />
               <Flex width={'35%'}>
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
                     />
                  </Form.Group>
               </Flex>
            </>
         </Flex>
      </div>
   )
}
