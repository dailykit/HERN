import React from 'react'
import {
   TunnelHeader,
   Flex,
   OptionTile,
   Spacer,
   Tunnels,
   Tunnel,
   Text,
   RadioGroup,
   ButtonTile,
   IconButton,
   Form,
} from '@dailykit/ui'
import styled from 'styled-components'
import { MUTATIONS, QUERIES } from '../../../../../graphql'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import { useManual } from '../../state'
import {
   generateDeliverySlots,
   generateDineInSlots,
   generateMiniSlots,
   generatePickUpSlots,
   generateTimeStamp,
   getDistance,
   isDeliveryAvailable,
   isPickUpAvailable,
   isStoreOnDemandDeliveryAvailable,
   isStorePreOrderDeliveryAvailable,
   isStoreOnDemandDineAvailable,
} from './utils'
import { useParams } from 'react-router'
import { EditIcon } from '../../../../../../../shared/assets/icons'
import { InlineLoader } from '../../../../../../../shared/components'
import { logger, parseAddress } from '../../../../../../../shared/utils'
import { toast } from 'react-toastify'
import moment from 'moment'

export const FulfillmentTunnel = ({ panel }) => {
   const [tunnels] = panel
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel size="md">
            <Content panel={panel} />
         </Tunnel>
      </Tunnels>
   )
}

const Content = ({ panel }) => {
   const [, , closeTunnel] = panel
   const { brand, address, tunnels, brandLocation, locationId, orderTabs } =
      useManual()
   const { id: cartId } = useParams()

   const [distance, setDistance] = React.useState(null)
   const [type, setType] = React.useState('')
   const [time, setTime] = React.useState('')
   const [error, setError] = React.useState('')
   const [typeOptions, setTypeOptions] = React.useState([])
   const [pickerDates, setPickerDates] = React.useState([])
   const [pickerSlots, setPickerSlots] = React.useState([])
   const [fulfillment, setFulfillment] = React.useState({})
   const [timeTypeOptions, setTimeTypeOptions] = React.useState([])

   const storedDistance = React.useRef()

   React.useEffect(() => {
      if (orderTabs?.length) {
         const types = []
         const isDeliveryAvailable = orderTabs.filter(
            orderTab =>
               orderTab.orderFulfillmentTypeLabel === 'PREORDER_DELIVERY' ||
               orderTab.orderFulfillmentTypeLabel === 'ONDEMAND_DELIVERY'
         )
         const isPickupAvailable = orderTabs.filter(
            orderTab =>
               orderTab.orderFulfillmentTypeLabel === 'PREORDER_PICKUP' ||
               orderTab.orderFulfillmentTypeLabel === 'ONDEMAND_PICKUP'
         )
         const isDineInAvailable = orderTabs.filter(
            orderTab =>
               orderTab.orderFulfillmentTypeLabel === 'PREORDER_DINEIN' ||
               orderTab.orderFulfillmentTypeLabel === 'ONDEMAND_DINEIN' ||
               orderTab.orderFulfillmentTypeLabel === 'PREORDER_DINEIN'
         )
         if (isDeliveryAvailable.length)
            types.push({ id: 'DELIVERY', title: isDeliveryAvailable[0].label })
         if (isPickupAvailable.length)
            types.push({ id: 'PICKUP', title: isPickupAvailable[0].label })
         if (isDineInAvailable.length)
            types.push({ id: 'DINEIN', title: isDineInAvailable[0].label })
         setTypeOptions(types)
      }
      if (brand?.brand_brandSettings?.length) {
         const types = []

         const deliverySetting = brand.brand_brandSettings.find(
            setting =>
               setting.brandSetting.identifier === 'Delivery Availability'
         )
         const { value: deliveryAvailability } = deliverySetting

         if (deliveryAvailability?.Delivery?.IsDeliveryAvailable?.value)
            types.push({ id: 'DELIVERY', title: 'Delivery' })

         const pickupSetting = brand.brand_brandSettings.find(
            setting => setting.brandSetting.identifier === 'Pickup Availability'
         )
         const { value: pickupAvailability } = pickupSetting

         if (pickupAvailability?.PickUp?.IsPickupAvailable?.value)
            types.push({ id: 'PICKUP', title: 'Pickup' })
      }
   }, [brand?.brand_brandSettings?.length, orderTabs])

   // Mutation
   const [updateCart, { loading }] = useMutation(MUTATIONS.CART.UPDATE, {
      onCompleted: () => {
         toast.success('Successfully updated fulfillment details.')
         closeTunnel(1)
      },
      onError: error => {
         logger(error)
         toast.error('Failed to update the fulfillment details.')
      },
   })

   // Subscriptions
   const {
      data: { brandRecurrences: PPbrandRecurrences = [] } = {},
      loading: PPLoading,
   } = useSubscription(QUERIES.FULFILLMENT.RECURRENCES, {
      variables: {
         where: {
            recurrence: {
               isActive: { _eq: true },
               type: { _eq: 'PREORDER_PICKUP' },
            },
            _or: [
               {
                  brandLocationId: {
                     _eq: brandLocation?.id,
                  },
               },
               { brandId: { _eq: brand.id } },
            ],
            isActive: { _eq: true },
         },
      },
   })

   const {
      data: { brandRecurrences: OPbrandRecurrences = [] } = {},
      loading: OPLoading,
   } = useSubscription(QUERIES.FULFILLMENT.RECURRENCES, {
      variables: {
         where: {
            recurrence: {
               isActive: { _eq: true },
               type: { _eq: 'ONDEMAND_PICKUP' },
            },
            _or: [
               {
                  brandLocationId: {
                     _eq: brandLocation?.id,
                  },
               },
               { brandId: { _eq: brand.id } },
            ],
            isActive: { _eq: true },
         },
      },
   })

   const {
      data: { brandRecurrences: PDbrandRecurrences = [] } = {},
      loading: PDLoading,
   } = useSubscription(QUERIES.FULFILLMENT.RECURRENCES, {
      skip: distance === null,
      variables: {
         where: {
            recurrence: {
               isActive: { _eq: true },
               type: { _eq: 'PREORDER_DELIVERY' },
            },
            _or: [
               {
                  brandLocationId: {
                     _eq: brandLocation?.id,
                  },
               },
               { brandId: { _eq: brand.id } },
            ],
            isActive: { _eq: true },
         },
      },
   })

   const {
      data: { brandRecurrences: ODbrandRecurrences = [] } = {},
      loading: ODLoading,
   } = useSubscription(QUERIES.FULFILLMENT.RECURRENCES, {
      variables: {
         where: {
            recurrence: {
               isActive: { _eq: true },
               type: { _eq: 'ONDEMAND_DELIVERY' },
            },
            _or: [
               {
                  brandLocationId: {
                     _eq: brandLocation?.id,
                  },
               },
               { brandId: { _eq: brand.id } },
            ],
            isActive: { _eq: true },
         },
      },
   })
   const {
      data: { brandRecurrences: ODINbrandRecurrences = [] } = {},
      loading: ODINLoading,
   } = useSubscription(QUERIES.FULFILLMENT.RECURRENCES, {
      variables: {
         where: {
            recurrence: {
               isActive: { _eq: true },
               type: { _eq: 'ONDEMAND_DINEIN' },
            },
            _or: [
               {
                  brandLocationId: {
                     _eq: brandLocation?.id,
                  },
               },
               { brandId: { _eq: brand.id } },
            ],
            isActive: { _eq: true },
         },
      },
   })
   const {
      data: { brandRecurrences: PDINbrandRecurrences = [] } = {},
      loading: PDINLoading,
   } = useSubscription(QUERIES.FULFILLMENT.RECURRENCES, {
      variables: {
         where: {
            recurrence: {
               isActive: { _eq: true },
               type: { _eq: 'PREORDER_DINEIN' },
            },
            _or: [
               {
                  brandLocationId: {
                     _eq: brandLocation?.id,
                  },
               },
               { brandId: { _eq: brand.id } },
            ],
            isActive: { _eq: true },
         },
      },
   })

   React.useEffect(() => {
      setTime('')
      setError('')

      if (brand.brand_brandSettings.length) {
         const addressSetting = brand.brand_brandSettings.find(
            setting => setting.brandSetting.identifier === 'Location'
         )
         const { value: storeAddress } = addressSetting

         ;(async () => {
            if (
               address?.lat &&
               address?.lng &&
               brandLocation?.location?.lat &&
               brandLocation?.location?.lng
            ) {
               const distance = await getDistance(
                  +address.lat,
                  +address.lng,
                  +brandLocation.location.lat,
                  +brandLocation.location.lng
               )
               // console.log("distance",{ distance })
               storedDistance.current = distance
               setDistance(distance.drivable || distance.aerial)
            }
         })()
      }
   }, [address?.id, brand])

   React.useEffect(() => {
      if (fulfillment.date && time === 'PREORDER') {
         const index = pickerDates.findIndex(
            data => data.value === fulfillment.date
         )
         setPickerSlots([...pickerDates[index].slots])
         setFulfillment({
            ...fulfillment,
            slot: {
               ...fulfillment.slot,
               ...generateTimeStamp(
                  pickerDates[index].slots[0].time,
                  fulfillment.date,
                  pickerDates[index].slots[0].intervalInMinutes
               ),
            },
         })

         // change time selector to default if the date is changed
         document.getElementById('time').value =
            pickerDates[index].slots[0].time
      }
   }, [fulfillment.date])

   React.useEffect(() => {
      if (fulfillment.time && time === 'PREORDER') {
         const index = pickerSlots.findIndex(
            slot => slot.value === fulfillment.time
         )
         setFulfillment({
            ...fulfillment,
            slot: {
               ...fulfillment.slot,
               ...generateTimeStamp(
                  pickerSlots[index].time,
                  fulfillment.date,
                  pickerSlots[index].intervalInMinutes
               ),
            },
         })
      }
   }, [fulfillment.time])

   React.useEffect(() => {
      ;(async () => {
         try {
            if (time && type) {
               setError('')

               if (brand.brand_brandSettings.length) {
                  const deliverySetting = brand.brand_brandSettings.find(
                     setting =>
                        setting.brandSetting.identifier ===
                        'Delivery Availability'
                  )
                  const { value: deliveryAvailability } = deliverySetting
                  // console.log('🚀 deliveryAvailability', deliveryAvailability)

                  const pickupSetting = brand.brand_brandSettings.find(
                     setting =>
                        setting.brandSetting.identifier ===
                        'Pickup Availability'
                  )
                  const { value: pickupAvailability } = pickupSetting

                  switch (type) {
                     case 'PICKUP': {
                        if (
                           pickupAvailability?.PickUp?.IsPickupAvailable?.value
                        ) {
                           switch (time) {
                              case 'ONDEMAND': {
                                 if (OPbrandRecurrences?.length) {
                                    const result =
                                       isPickUpAvailable(OPbrandRecurrences)
                                    if (result.status) {
                                       const date = new Date()
                                       setFulfillment({
                                          date: date.toDateString(),
                                          slot: {
                                             from: moment().format(),
                                             to: moment().format(),
                                             timeslotId: result.timeSlotInfo.id,
                                          },
                                       })
                                    } else {
                                       setError(
                                          'Sorry! Option not available currently!'
                                       )
                                    }
                                 } else {
                                    setError(
                                       'Sorry! Option not available currently.'
                                    )
                                 }
                                 break
                              }
                              case 'PREORDER': {
                                 if (PPbrandRecurrences?.length) {
                                    const result = generatePickUpSlots(
                                       PPbrandRecurrences.map(
                                          recs => recs.recurrence
                                       )
                                    )
                                    if (result.status) {
                                       const miniSlots = generateMiniSlots(
                                          result.data,
                                          15
                                       )
                                       if (miniSlots.length) {
                                          setPickerDates([...miniSlots])
                                          setFulfillment({
                                             date: miniSlots[0].date,
                                             slot: {
                                                // time: miniSlots[0].slots[0].time,
                                                ...generateTimeStamp(
                                                   miniSlots[0].slots[0].time,
                                                   miniSlots[0].date,
                                                   miniSlots[0].slots[0]
                                                      .intervalInMinutes
                                                ),
                                             },
                                          })
                                       } else {
                                          setError(
                                             'Sorry! No time slots available.'
                                          )
                                       }
                                    } else {
                                       setError(
                                          'Sorry! No time slots available.'
                                       )
                                    }
                                 } else {
                                    setError('Sorry! No time slots available.')
                                 }
                                 break
                              }
                              default: {
                                 return setError('Unknown error!')
                              }
                           }
                        } else {
                           setError('Sorry! Pickup not available currently.')
                        }
                        break
                     }
                     case 'DELIVERY': {
                        if (!distance) {
                           return setError('Please add an address first!')
                        }
                        if (
                           deliveryAvailability?.Delivery?.IsDeliveryAvailable
                              ?.value
                        ) {
                           switch (time) {
                              case 'ONDEMAND': {
                                 if (ODbrandRecurrences.length) {
                                    const brandLocationCopy = JSON.parse(
                                       JSON.stringify(brandLocation)
                                    )
                                    brandLocationCopy.aerialDistance = distance
                                    const result =
                                       await isStoreOnDemandDeliveryAvailable(
                                          ODbrandRecurrences,
                                          brandLocationCopy,
                                          address
                                       )
                                    if (result.status) {
                                       const date = new Date()
                                       setFulfillment({
                                          distance,
                                          date: date.toDateString(),
                                          slot: {
                                             ...generateTimeStamp(
                                                moment().format('HH:mm'),
                                                moment().format('YYYY-MM-DD'),
                                                result.mileRangeInfo
                                                   .prepTimeInMinutes
                                             ),
                                             mileRangeId:
                                                result.mileRangeInfo.id,
                                          },
                                       })
                                    } else {
                                       setError(
                                          result.message ||
                                             'Sorry! Delivery not available at the moment.'
                                       )
                                    }
                                 } else {
                                    setError(
                                       'Sorry! Option not available currently.'
                                    )
                                 }
                                 break
                              }
                              case 'PREORDER': {
                                 if (PDbrandRecurrences?.length) {
                                    const brandLocationCopy = JSON.parse(
                                       JSON.stringify(brandLocation)
                                    )
                                    brandLocationCopy.aerialDistance = distance
                                    const result =
                                       await isStorePreOrderDeliveryAvailable(
                                          PDbrandRecurrences,
                                          brandLocationCopy,
                                          address
                                       )
                                    if (result.status) {
                                       const deliverySlots =
                                          generateDeliverySlots(
                                             result.rec.map(
                                                eachFulfillRecurrence =>
                                                   eachFulfillRecurrence.recurrence
                                             )
                                          )
                                       const miniSlots = generateMiniSlots(
                                          deliverySlots.data,
                                          15
                                       )
                                       // console.log(miniSlots)
                                       if (miniSlots.length) {
                                          setPickerDates([...miniSlots])
                                          setFulfillment({
                                             distance,
                                             date: miniSlots[0].date,
                                             slot: {
                                                time: miniSlots[0].slots[0]
                                                   .time,
                                                ...generateTimeStamp(
                                                   miniSlots[0].slots[0].time,
                                                   miniSlots[0].date,
                                                   miniSlots[0].slots[0]
                                                      .intervalInMinutes
                                                ),
                                                mileRangeId:
                                                   miniSlots[0].slots[0]
                                                      ?.mileRangeId,
                                             },
                                          })
                                       } else {
                                          setError(
                                             'Sorry! No time slots available.'
                                          )
                                       }
                                    } else {
                                       setError(
                                          result.message ||
                                             'Sorry! No time slots available for selected options.'
                                       )
                                    }
                                 } else {
                                    setError('Sorry! No time slots available.')
                                 }
                                 break
                              }
                              default: {
                                 return setError('Unknown error!')
                              }
                           }
                        } else {
                           setError('Sorry! Delivery not available currently.')
                        }
                        break
                     }
                     case 'DINEIN': {
                        switch (time) {
                           case 'ONDEMAND': {
                              if (ODINbrandRecurrences?.length) {
                                 const result =
                                    isStoreOnDemandDineAvailable(
                                       ODINbrandRecurrences
                                    )
                                 
                                 if (result.status) {
                                    const date = new Date()
                                    setFulfillment({
                                       date: date.toDateString(),
                                       slot: {
                                          from: moment().format(),
                                          to: moment().format(),
                                          timeslotId: result.timeSlotInfo.id,
                                       },
                                    })
                                 } else {
                                    setError(
                                       'Sorry! Dine in not available currently!'
                                    )
                                 }
                              } else {
                                 setError(
                                    'Sorry! Dine in not available currently.'
                                 )
                              }
                              break
                           }
                           case 'PREORDER': {
                              if (PDINbrandRecurrences?.length) {
                                 const result = generateDineInSlots(
                                    PDINbrandRecurrences.map(
                                       recs => recs.recurrence
                                    )
                                 )
                                 if (result.status) {
                                    const miniSlots = generateMiniSlots(
                                       result.data,
                                       15
                                    )
                                    if (miniSlots.length) {
                                       setPickerDates([...miniSlots])
                                       setFulfillment({
                                          date: miniSlots[0].date,
                                          slot: {
                                             // time: miniSlots[0].slots[0].time,
                                             ...generateTimeStamp(
                                                miniSlots[0].slots[0].time,
                                                miniSlots[0].date,
                                                miniSlots[0].slots[0]
                                                   .intervalInMinutes
                                             ),
                                          },
                                       })
                                    } else {
                                       setError(
                                          'Sorry! No time slots available.'
                                       )
                                    }
                                 } else {
                                    setError('Sorry! No time slots available.')
                                 }
                              } else {
                                 setError('Sorry! No time slots available.')
                              }
                              break
                           }
                           default: {
                              return setError('Unknown error!')
                           }
                        }
                        break
                     }
                     default: {
                        return setError('Unknown error!')
                     }
                  }
               }
            }
         } catch (error) {
            console.log(error)
         }
      })()
   }, [type, time, distance])
   React.useEffect(() => {
      if (type) {
         const whenOptions = []
         const isNowAvailable = orderTabs.some(
            orderTab =>
               orderTab.orderFulfillmentTypeLabel === `ONDEMAND_${type}`
         )
         const isLaterAvailable = orderTabs.some(
            orderTab =>
               orderTab.orderFulfillmentTypeLabel === `PREORDER_${type}` ||
               orderTab.orderFulfillmentTypeLabel === `SCHEDULED_${type}`
         )
         if (isNowAvailable) {
            whenOptions.push({
               title: 'Now',
               id: 'ONDEMAND',
            })
         }
         if (isLaterAvailable) {
            whenOptions.push({
               title: 'Later',
               id: 'PREORDER',
            })
         }
         setTimeTypeOptions(whenOptions)
      }
   }, [type])
   const save = () => {
      try {
         const modifiedFulfillment = JSON.parse(JSON.stringify(fulfillment))
         let timeslotInfo = {}
         const selectedOrderTab = orderTabs.find(
            orderTab => orderTab.orderFulfillmentTypeLabel === `${time}_${type}`
         )

         if (
            time + '_' + type === 'PREORDER_DINEIN' ||
            time + '_' + type === 'PREORDER_PICKUP'
         ) {
            const finalRec =
               time + '_' + type === 'PREORDER_DINEIN'
                  ? PDINbrandRecurrences
                  : PDbrandRecurrences
            finalRec.forEach(x => {
               x.recurrence.timeSlots.forEach(timeSlot => {
                  const format = 'HH:mm'
                  const selectedFromTime = moment(
                     fulfillment.slot?.from
                  ).format(format)
                  const selectedToTime = moment(fulfillment.slot?.to).format(
                     format
                  )
                  const fromTime = moment(timeSlot.from, format).format(format)
                  const toTime = moment(timeSlot.to, format).format(format)
                  const isInBetween =
                     selectedFromTime >= fromTime &&
                     selectedFromTime <= toTime &&
                     selectedToTime <= toTime
                  if (isInBetween) {
                     timeslotInfo = timeSlot
                  }
               })
            })
            modifiedFulfillment.slot.timeslotId = timeslotInfo.id
         }

         const fulfillmentInfo = {
            type: time + '_' + type,
            distance: storedDistance.current,
            ...modifiedFulfillment,
         }

         updateCart({
            variables: {
               id: cartId,
               _set: {
                  fulfillmentInfo,
                  orderTabId: selectedOrderTab.id,
                  usedOrderInterface: 'POS Ordering',
               },
            },
         })
      } catch (error) {
         console.log(error)
      }
   }

   return (
      <>
         <TunnelHeader
            title="Fulfillment Details"
            close={() => closeTunnel(1)}
            right={{
               title: 'Save',
               disabled: error || !type || !time,
               isLoading: loading,
               action: save,
            }}
         />
         {[PPLoading, OPLoading, PDLoading, ODLoading].some(Boolean) ? (
            <InlineLoader />
         ) : (
            <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
               <Text as="text1"> Order for </Text>
               <Spacer size="4px" />
               <RadioGroup
                  options={typeOptions}
                  onChange={option => {
                     setType(option?.id ?? '')
                     setPickerDates([])
                     setPickerSlots([])
                  }}
               />
               <Spacer size="16px" />
               {type === 'DELIVERY' && (
                  <>
                     <Text as="text1"> Address for Delivery </Text>
                     <Spacer size="4px" />
                     {Boolean(address?.id) ? (
                        <Flex
                           container
                           alignItems="center"
                           justifyContent="space-between"
                        >
                           <Text as="text2">{parseAddress(address)}</Text>
                           <IconButton
                              type="outline"
                              size="sm"
                              onClick={() => tunnels.address[1](1)}
                           >
                              <EditIcon />
                           </IconButton>
                        </Flex>
                     ) : (
                        <ButtonTile
                           type="secondary"
                           text="Add Address"
                           onClick={() => tunnels.address[1](1)}
                        />
                     )}
                     <Spacer size="16px" />
                  </>
               )}
               {Boolean(type) && (
                  <>
                     <Text as="text1"> When would you like your order? </Text>
                     <Spacer size="4px" />
                     <RadioGroup
                        options={timeTypeOptions}
                        onChange={option => setTime(option?.id ?? '')}
                     />
                     <Spacer size="16px" />
                  </>
               )}
               {time === 'PREORDER' && Boolean(pickerDates.length) && (
                  <>
                     <Text as="text1"> Select a slot </Text>
                     <Spacer size="4px" />
                     <Flex container alignItems="center">
                        <Form.Group>
                           <Form.Label htmlFor="date" title="date">
                              Date
                           </Form.Label>
                           <Form.Select
                              id="date"
                              name="date"
                              options={pickerDates}
                              onChange={e =>
                                 setFulfillment({
                                    date: e.target.value,
                                 })
                              }
                              placeholder="Choose a date"
                           />
                        </Form.Group>
                        <Spacer size="16px" xAxis />
                        <Form.Group>
                           <Form.Label htmlFor="time" title="time">
                              Time
                           </Form.Label>
                           <Form.Select
                              id="time"
                              name="time"
                              options={pickerSlots}
                              onChange={e => {
                                 const selectedMiniSlot = pickerSlots.find(
                                    miniSlot =>
                                       miniSlot.value === e.target.value
                                 )
                                 setFulfillment({
                                    ...fulfillment,
                                    slot: {
                                       from: e.target.value,
                                       to: moment(e.target.value, 'HH:mm')
                                          .add(
                                             selectedMiniSlot.intervalInMinutes,
                                             'minutes'
                                          )
                                          .format('HH:mm'),
                                    },
                                    time: e.target.value,
                                 })
                              }}
                              placeholder="Choose a time slot"
                           />
                        </Form.Group>
                     </Flex>
                  </>
               )}
               {Boolean(error) && <Styles.Error>{error}</Styles.Error>}
            </Flex>
         )}
      </>
   )
}

const Styles = {
   Error: styled.small`
      color: #ec3333;
   `,
}
