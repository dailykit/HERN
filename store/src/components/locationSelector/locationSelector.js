import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import { CloseIcon } from '../../assets/icons'
import { Loader } from '../index'
import { useConfig } from '../../lib'
import _ from 'lodash'
import LocationSelectorConfig from '../locatoinSeletorConfig.json'
import { Divider } from 'antd'
import 'antd/dist/antd.css'
import { Delivery, Pickup, DineIn } from './index'
import { useOnClickOutside, useScript, isClient, get_env } from '../../utils'
import { useTranslation } from '../../context'
// this Location selector is a pop up for mobile view so can user can select there location

export const LocationSelector = props => {

   // WARNING this component using settings so whenever using this component make sure this component can access settings
   const { setShowLocationSelectionPopup, settings } = props

   const { brand, orderTabs } = useConfig()
   const { dynamicTrans } = useTranslation()
   const orderTabFulfillmentType = React.useMemo(
      () =>
         orderTabs
            ? orderTabs.map(eachTab => eachTab.orderFulfillmentTypeLabel)
            : null,
      [orderTabs]
   )
   const locationSelectorRef = React.useRef()
   useOnClickOutside(locationSelectorRef, () =>
      setShowLocationSelectionPopup(false)
   )
   const {
      availableFulfillmentType: storeFulfillmentType,
      defaultFulfillmentType,
   } = LocationSelectorConfig.informationVisibility
   const availableFulFillmentType =
      storeFulfillmentType.value.length > 0
         ? storeFulfillmentType.value.map(x => x.value)
         : storeFulfillmentType.default.map(x => x.value)

   const [fulfillmentType, setFulfillmentType] = useState(
      orderTabFulfillmentType[0]?.split('_')[1] ||
      defaultFulfillmentType.value?.value ||
      defaultFulfillmentType.default?.value
   )

   React.useEffect(() => {
      document.querySelector('body').style.overflowY = 'hidden'
      return () => (document.querySelector('body').style.overflowY = 'auto')
   }, [])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [])
   if (!orderTabFulfillmentType) {
      return <Loader inline />
   }

   return (
      <div>
         <div className="hern-store-location-selector__fulfillment-selector">
            {(orderTabFulfillmentType.includes('ONDEMAND_DELIVERY') ||
               orderTabFulfillmentType.includes('PREORDER_DELIVERY')) &&
               availableFulFillmentType.includes('DELIVERY') && (
                  <button
                     className={classNames(
                        'hern-store-location-selector__fulfillment-selector-button',
                        {
                           'hern-store-location-selector__fulfillment-selector-button--active':
                              fulfillmentType === 'DELIVERY',
                        }
                     )}
                     onClick={() => setFulfillmentType('DELIVERY')}
                     data-translation="true"
                     data-original-value={
                        orderTabs.find(
                           x =>
                              x.orderFulfillmentTypeLabel ===
                              'ONDEMAND_DELIVERY' ||
                              x.orderFulfillmentTypeLabel ===
                              'PREORDER_DELIVERY'
                        ).label
                     }
                  >
                     {
                        orderTabs.find(
                           x =>
                              x.orderFulfillmentTypeLabel ===
                              'ONDEMAND_DELIVERY' ||
                              x.orderFulfillmentTypeLabel ===
                              'PREORDER_DELIVERY'
                        ).label
                     }
                  </button>
               )}
            {(orderTabFulfillmentType.includes('ONDEMAND_PICKUP') ||
               orderTabFulfillmentType.includes('PREORDER_PICKUP')) &&
               availableFulFillmentType.includes('PICKUP') && (
                  <button
                     className={classNames(
                        'hern-store-location-selector__fulfillment-selector-button',
                        {
                           'hern-store-location-selector__fulfillment-selector-button--active':
                              fulfillmentType === 'PICKUP',
                        }
                     )}
                     onClick={() => setFulfillmentType('PICKUP')}
                     data-translation="true"
                     data-original-value={
                        orderTabs.find(
                           x =>
                              x.orderFulfillmentTypeLabel ===
                              'ONDEMAND_PICKUP' ||
                              x.orderFulfillmentTypeLabel === 'PREORDER_PICKUP'
                        ).label
                     }
                  >
                     {
                        orderTabs.find(
                           x =>
                              x.orderFulfillmentTypeLabel ===
                              'ONDEMAND_PICKUP' ||
                              x.orderFulfillmentTypeLabel === 'PREORDER_PICKUP'
                        ).label
                     }
                  </button>
               )}
            {(orderTabFulfillmentType.includes('ONDEMAND_DINEIN') ||
               orderTabFulfillmentType.includes('SCHEDULED_DINEIN')) &&
               availableFulFillmentType.includes('DINEIN') && (
                  <button
                     className={classNames(
                        'hern-store-location-selector__fulfillment-selector-button',
                        {
                           'hern-store-location-selector__fulfillment-selector-button--active':
                              fulfillmentType === 'DINEIN',
                        }
                     )}
                     onClick={() => setFulfillmentType('DINEIN')}
                  >
                     {
                        orderTabs.find(
                           x =>
                              x.orderFulfillmentTypeLabel ===
                              'ONDEMAND_DINEIN' ||
                              x.orderFulfillmentTypeLabel === 'SCHEDULED_DINEIN'
                        ).label
                     }
                  </button>
               )}
         </div>
         <Divider style={{ margin: '1em 0' }} />
         {fulfillmentType === 'DELIVERY' && (
            <Delivery
               setShowLocationSelectionPopup={setShowLocationSelectionPopup}
               settings={settings}
            />
         )}
         {fulfillmentType === 'PICKUP' && (
            <Pickup
               setShowLocationSelectionPopup={setShowLocationSelectionPopup}
               settings={settings}
            />
         )}
         {fulfillmentType === 'DINEIN' && <DineIn />}
         <div className="hern-store-location-selector-footer"></div>
      </div>
   )
}
