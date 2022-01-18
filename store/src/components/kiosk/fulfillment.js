import React from 'react'
import { Button } from 'antd'
import { useTranslation } from '../../context'
import { DineInIcon, TakeOutIcon } from '../../assets/icons'
import { useConfig } from '../../lib'

export const FulfillmentSection = props => {
   const { config, setCurrentPage } = props
   const { orderTabs, isConfigLoading } = useConfig()
   const { t, direction } = useTranslation()

   return (
      <div className="hern-kiosk__fulfillment-section-container">
         {config.fulfillmentPageSettings.backgroundImage.value.url[0] && (
            <img
               className="hern-kiosk__fulfillment-section-bg-image"
               src={config.fulfillmentPageSettings.backgroundImage.value.url[0]}
               alt="bg-image"
            />
         )}
         <span
            className="hern-kiosk__fulfillment-section-text"
            style={{
               color: `${config.kioskSettings.theme.primaryColor.value}`,
            }}
         >
            {t('Where will you be eating today?')}
         </span>
         <div className="hern-kiosk__fulfillment-options" dir={direction}>
            {isConfigLoading ? (
               <p>loading</p>
            ) : (
               orderTabs.map((eachTab, index) => {
                  let IconType = null
                  switch (eachTab?.orderFulfillmentTypeLabel) {
                     case 'ONDEMAND_PICKUP':
                        IconType = TakeOutIcon
                        break
                     case 'ONDEMAND_DINEIN':
                        IconType = DineInIcon
                        break
                  }
                  return (
                     <FulfillmentOption
                        config={config}
                        fulfillment={eachTab}
                        fulfillmentIcon={IconType}
                        buttonText={eachTab?.label}
                        key={index}
                        setCurrentPage={setCurrentPage}
                     />
                  )
               })
            )}
            {/* <FulfillmentOption
               config={config}
               fulfillmentIcon={DineInIcon}
               buttonText={'Dine in'}
            />
            <FulfillmentOption
               config={config}
               fulfillmentIcon={TakeOutIcon}
               buttonText={'Take Out'}
            /> */}
         </div>
      </div>
   )
}

const FulfillmentOption = props => {
   const {
      config,
      fulfillmentIcon: FulfillmentIcon,
      buttonText,
      setCurrentPage,
      fulfillment,
   } = props

   const { dispatch } = useConfig()
   const { t } = useTranslation()

   const onFulfillmentClick = () => {
      dispatch({
         type: 'SET_SELECTED_ORDER_TAB',
         payload: fulfillment,
      })
      setCurrentPage('menuPage')
   }

   return (
      <div
         className="hern-kiosk__fulfillment-option"
         onClick={onFulfillmentClick}
      >
         <div className="hern-kiosk_fulfillment-icon">
            <FulfillmentIcon width={200} height={200} fill="#ffffff" />
         </div>
         <Button
            size="large"
            type="primary"
            className="hern-kiosk__kiosk-primary-button"
            style={{
               backgroundColor: `${config.kioskSettings.theme.primaryColor.value}`,
            }}
            onClick={onFulfillmentClick}
         >
            <span>{t(buttonText)}</span>
         </Button>
      </div>
   )
}
