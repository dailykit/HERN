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
   ButtonGroup,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   Dropdown,
   TextButton,
} from '@dailykit/ui'
import validator from '../../validator'
import copy from 'copy-to-clipboard'
import { KIOSK, BRANDS, PINELABS_DEVICES } from '../../../graphql'
import { Wrapper, Label } from '../brand/styled'
import { logger } from '../../../../../shared/utils'
import { useTabs } from '../../../../../shared/providers'
import { Banner, InlineLoader, Tooltip } from '../../../../../shared/components'
import { KioskConfig, BasicInfo, LinkOrderTab } from './tabs'
import { CopyIcon } from '../../../../editor/assets/Icons'

export const PinelabsDevice = () => {
   const params = useParams()
   const { tab, addTab, setTabTitle } = useTabs()
   const [brandList, setBrandList] = React.useState([])
   const [selectedBrandId, setSelectedBrandId] = React.useState()
   const [title, setTitle] = React.useState({
      value: '',
      // accessUrl: '',
      // brandName: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   const [updateDevice] = useMutation(PINELABS_DEVICES.UPDATE_DEVICE, {
      onCompleted: () => toast.success('Successfully updated the Device!'),
      onError: error => {
         toast.error('Failed to update the Device!')
         logger(error)
      },
   })

   const {
      error,
      loading,
      data: { device = {} } = {},
   } = useSubscription(PINELABS_DEVICES.DEVICE, {
      variables: {
         id: { _eq: parseInt(params.id) },
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { device = {} },
         },
      }) => {
         // console.log('data is:', kiosk)
         setTitle({
            value: device[0].deviceLabel || '',
            // accessUrl: device[0]?.accessUrl || '',
            meta: {
               isValid: device[0].deviceLabel ? true : false,
               isTouched: false,
               errors: [],
            },
         })
         setTabTitle(`Pinelabs Device - ${device[0].deviceLabel}` || '')
      },
   })

   console.log(device)

   const { brandListError, brandListLoading, brandListData } = useSubscription(
      BRANDS.LIST,
      {
         onSubscriptionData: ({
            subscriptionData: {
               data: { brands = {} },
            },
         }) => {
            // console.log('brands data', brands)
            const brandsData = brands?.nodes.map(brand => {
               return {
                  id: brand?.id || '',
                  // title: brand?.title || '',
                  title: brand?.domain || '',
               }
            })
            setBrandList(previousData => [...previousData, ...brandsData])
         },
      }
   )
   // console.log('brandlist made now::>', brandList)

   React.useEffect(() => {
      if (!tab && !loading && !isEmpty(device)) {
         addTab(
            `Pinelabs Device - ${device?.title}` || 'N/A',
            `/brands/pinelabs-devices/${device[0].id}`
         )
         console.log('data:', loading)
      }
      /// set brandID
      // if (title.accessUrl) {
      //    // console.log('accessUrLLL', title.accessUrl.split('/')[0])
      //    const result = brandList.filter(
      //       ele => ele.title === title.accessUrl.split('/')[0]
      //    )
      //    // console.log('accessUrLLL 2', result)
      //    setSelectedBrandId(result[0])
      // }
   }, [tab, addTab, loading, device])

   const updateTitle = e => {
      setTitle({
         ...title,
         meta: {
            ...title.meta,
            isTouched: true,
            errors: validator.name(e.target.value).errors,
            isValid: validator.name(e.target.value).isValid,
         },
      })
      if (validator.name(e.target.value).isValid) {
         updateDevice({
            variables: {
               id: parseInt(params.id),
               _set: {
                  internalPineLabsDeviceLabel: title.value,
               },
            },
         })
      } else {
         toast.error('Device Title must be provided')
      }
   }

   if (loading || brandListLoading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   return (
      <Wrapper>
         {/* <Banner id="brands-app-brands-brand-details-top" /> */}
         <Flex
            container
            padding="0 16px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Form.Group>
               <Flex container alignItems="center">
                  <Form.Label htmlFor="name" title="Device Label">
                     Device Label*
                  </Form.Label>
                  <Tooltip identifier="brand_title_info" />
               </Flex>
               <Form.Text
                  id="Device"
                  name="Device"
                  placeholder="Enter the device label"
                  value={title.value}
                  disabled={device?.isDefault}
                  onChange={e => setTitle({ ...title, value: e.target.value })}
                  onBlur={e => updateTitle(e)}
               />
               {title.meta.isTouched &&
                  !title.meta.isValid &&
                  title.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>

            <Form.Toggle
               name="Active"
               value={device[0]?.isActive}
               onChange={() => {
                  if (
                     title &&
                     device[0]?.imei &&
                     device[0]?.merchantStorePosCode
                  ) {
                     updateDevice({
                        variables: {
                           id: parseInt(params.id),
                           _set: { isActive: !device[0].isActive || false },
                        },
                     })
                  }
                  // if (
                  //    title &&
                  //    device[0]?.imei &&
                  //    !device[0].merchantStorePosCode
                  // ) {
                  //    toast.error('Store POS code not set')
                  // }
                  // if (
                  //    !title &&
                  //    device[0]?.imei &&
                  //    device[0]?.merchantStorePosCode
                  // ) {
                  //    toast.error('Label not set')
                  // }
                  // if (
                  //    title &&
                  //    !device[0]?.imei &&
                  //    device[0]?.merchantStorePosCode
                  // ) {
                  //    toast.error('IMEI not set')
                  // } else if (
                  //    !title &&
                  //    !device[0]?.imei &&
                  //    !device[0]?.merchantStorePosCode
                  // ) {
                  //    toast.error('Label or IMEI or Store POS Code not set')
                  // }
               }}
               style={{ marginTop: '24px' }}
            >
               <Flex container alignItems="center">
                  Active
                  <Tooltip identifier="brands_publish_info" />
               </Flex>
            </Form.Toggle>
         </Flex>
         <Spacer size="24px" />
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>Basic Info</HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel style={{ height: '100%' }}>
                  <BasicInfo selectedBrandId={selectedBrandId} />
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>
         <Banner id="brands-app-brands-brand-details-bottom" />
      </Wrapper>
   )
}

export default PinelabsDevice
