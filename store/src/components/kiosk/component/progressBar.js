import { Steps } from 'antd'
import React, { useEffect, useState } from 'react'
import {
   ArrowLeftIconBG,
   ArrowRightIconBG,
   DineInIcon,
   EditIcon,
   TakeOutIcon,
} from '../../../assets/icons'
import { CartContext, useTranslation } from '../../../context'
import { useQueryParamState } from '../../../utils'
import { useConfig } from '../../../lib'
import { Header } from 'antd/lib/layout/layout'
import { DineInTableSelection } from '.'
import { useIntl } from 'react-intl'
const { Step } = Steps

export const ProgressBar = props => {
   const { config, setCurrentPage } = props

   const { cartState, dineInTableInfo, setDineInTableInfo } =
      React.useContext(CartContext)
   const { t, direction } = useTranslation()
   const { formatMessage } = useIntl()
   const { cart } = cartState
   const { selectedOrderTab } = useConfig()

   const [current, setCurrent] = React.useState(0)

   const [currentPage] = useQueryParamState('currentPage', 'fulfillmentPage')
   const [showDineInTableSelection, setShowDineInTableSelection] =
      useState(false)

   const steps = [
      {
         id: 0,
         title: 'Select Product',
      },
      {
         id: 1,
         title: 'Review Cart',
      },
      {
         id: 2,
         title: 'Payment',
      },
   ]
   useEffect(() => {
      if (currentPage === 'menuPage') {
         setCurrent(0)
      } else if (currentPage === 'cartPage') {
         setCurrent(1)
      } else if (currentPage === 'paymentPage') {
         setCurrent(2)
      }
   }, [currentPage])

   const StepCount = ({ step, isFinish, isCurrent }) => {
      return (
         <div
            className="hern-kiosk__step-bar-count"
            style={{
               backgroundColor: `${
                  isFinish
                     ? config.kioskSettings.theme.secondaryColor.value
                     : isCurrent
                     ? config.kioskSettings.theme.primaryColor.value
                     : 'transparent'
               }`,

               color: `${isFinish ? '#fff' : isCurrent ? '#fff' : '#5A5A5A99'}`,
               border: `${isFinish ? 'none' : '2px solid #5A5A5A99'}`,
            }}
         >
            {step}
         </div>
      )
   }

   const handleArrowClick = () => {
      switch (currentPage) {
         case 'menuPage':
            setCurrentPage('fulfillmentPage')
            break
         case 'cartPage':
            setCurrentPage('menuPage')
            break
         case 'paymentPage':
            setCurrentPage('cartPage')
            break
         default:
            setCurrentPage('menuPage')
      }
   }
   const onConfirmClick = async tableInfo => {
      setDineInTableInfo(tableInfo)
      if (storedCartId) {
         await methods.cart.update({
            variables: {
               id: storedCartId,
               _set: {
                  locationTableId: selectedLocationTableId,
               },
            },
         })
      }
      setShowDineInTableSelection(false)
   }
   return (
      <Header
         style={{
            background: `${
               config.progressBarSettings.showProgressBackground.value
                  ? config.kioskSettings.theme.primaryColorLight.value
                  : '#fff'
            }`,
            padding: '1em 2em',
            height: '10em',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
         }}
      >
         <div
            style={{
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'center',
            }}
         >
            <div
               style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
               }}
            >
               {selectedOrderTab?.orderFulfillmentTypeLabel ===
                  'ONDEMAND_PICKUP' && (
                  <TakeOutIcon
                     width={50}
                     height={50}
                     fill={config.kioskSettings.theme.primaryColor.value}
                  />
               )}
               {selectedOrderTab?.orderFulfillmentTypeLabel ===
                  'ONDEMAND_DINEIN' && (
                  <DineInIcon
                     width={50}
                     height={50}
                     fill={config.kioskSettings.theme.primaryColor.value}
                  />
               )}
               <span
                  className="hern-kiosk__header-fulfillment-info-label"
                  style={{
                     color: config.kioskSettings.theme.primaryColor.value,
                  }}
               >
                  {t(selectedOrderTab?.label)}
               </span>
               {(dineInTableInfo?.internalTableLabel ||
                  cartState.cart.locationTableId) && (
                  <div className="hern-kiosk__dine-in-table-detail">
                     <div>
                        <span className="hern-kiosk__dine-in-table-text">
                           {t('TABLE')}
                        </span>
                        <span className="hern-kiosk__dine-in-table-internal-table-label">
                           {dineInTableInfo?.internalTableLabel ||
                              cartState.cart.locationTable.internalTableLabel}
                        </span>
                     </div>
                     <EditIcon
                        stroke={config.cartCardSettings.editIconColor.value}
                        fill={config.cartCardSettings.editIconColor.value}
                        size={36}
                        onClick={() => {
                           setShowDineInTableSelection(true)
                        }}
                     />
                  </div>
               )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
               {config?.progressBarSettings?.showBackButton?.value !==
                  false && (
                  <>
                     {direction === 'ltr' ? (
                        <ArrowLeftIconBG
                           style={{ marginRight: '1em' }}
                           onClick={handleArrowClick}
                           bgColor={
                              config.kioskSettings.theme.primaryColor.value
                           }
                        />
                     ) : (
                        <ArrowRightIconBG
                           style={{ marginRight: '1em' }}
                           onClick={handleArrowClick}
                           bgColor={
                              config.kioskSettings.theme.primaryColor.value
                           }
                        />
                     )}
                  </>
               )}
               <Steps
                  current={current}
                  className={direction === 'rtl' && 'hern-kiosk__step-bar-rtl'}
               >
                  {steps.map((item, index) => (
                     <Step
                        key={item.title}
                        title={formatMessage({ id: item.title })}
                        style={{
                           color: `${config.kioskSettings.theme.primaryColor.value}`,
                        }}
                        onClick={() => {
                           if (index < current) {
                              if (index === 0) {
                                 setCurrentPage('menuPage')
                              }
                              if (index === 1) {
                                 setCurrentPage('cartPage')
                              }
                              if (index === 2) {
                                 setCurrentPage('paymentPage')
                              }
                           }
                        }}
                        icon={
                           <StepCount
                              step={index + 1}
                              isFinish={index < current}
                              isCurrent={index == current}
                           />
                        }
                     />
                  ))}
               </Steps>
            </div>
         </div>
         <DineInTableSelection
            showDineInTableSelection={showDineInTableSelection}
            onClose={() => {
               setShowDineInTableSelection(false)
            }}
            config={config}
            onConfirmClick={onConfirmClick}
         />
      </Header>
   )
}
