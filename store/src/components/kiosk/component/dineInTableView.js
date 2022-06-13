import React, { useState } from 'react'
import Drawer from 'antd/lib/drawer'
import { useQuery } from '@apollo/react-hooks'
import { LOCATION_TABLES } from '../../../graphql'
import { useConfig } from '../../../lib'
import { useCart, useTranslation } from '../../../context'
import KioskButton from './button'
import classNames from 'classnames'
import { ArrowLeftIcon } from '../../../assets/icons'

export const DineInTableSelection = props => {
   const { showDineInTableSelection, onClose, config, onConfirmClick } = props
   const { locationId } = useConfig()
   const { methods, storedCartId } = useCart()
   const { t, dynamicTrans, locale } = useTranslation()
   const [selectedLocationTableId, setSelectedLocationTableId] = useState(null)

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [locale])

   const { data } = useQuery(LOCATION_TABLES, {
      variables: {
         where: {
            isActive: {
               _eq: true,
            },
            locationId: {
               _eq: locationId,
            },
         },
      },
   })
   // console.log('data', data)
   const DineInFooter = () => {
      return (
         <KioskButton
            buttonConfig={config.kioskSettings.buttonSettings}
            customClass={classNames(
               'hern-kiosk__dine-in-selection-confirm-btn'
            )}
            disabled={!selectedLocationTableId}
            onClick={() => {
               onConfirmClick(
                  data.brands_locationTable.find(
                     table => table.id === selectedLocationTableId
                  )
               )
               onClose()
            }}
         >
            {/* TODO: Button text should be dynamic (from config) */}
            {t('Proceed')}
         </KioskButton>
      )
   }
   return (
      <Drawer
         title="Select Table"
         placement="right"
         onClose={() => {
            setSelectedLocationTableId(null)
            onClose()
         }}
         visible={showDineInTableSelection}
         width={'100%'}
         headerStyle={{
            textAlign: 'center',
            fontSize: '52px !important',
            fontWeight: '700',
            color: '#303030',
            height: '160px',
            background: '#FFFFFF',
            boxShadow: '0px 1px 20px rgba(0, 0, 0, 0.1)',
         }}
         className="hern-kiosk__table-selection-drawer"
         destroyOnClose={true}
         footer={<DineInFooter />}
         // TODO: Close icon should be from assets folder and should use same icon for phone number and table selection
         closeIcon={
            <svg
               width="42"
               height="42"
               viewBox="0 0 42 42"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <rect width="42" height="42" rx="21" fill="#7124B4" />
               <path
                  d="M31.5 21.4113H10.5M10.5 21.4113L18.7889 14.8749M10.5 21.4113L18.7889 27.1249"
                  stroke="white"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
               />
            </svg>
         }
      >
         <div className="hern-kiosk__dine-in-heading-wrapper">
            <span
               data-translation="true"
               className="hern-kiosk__dine-in-heading"
            >
               {config.dineInTableSettings.dineInPopupText.value}
            </span>
         </div>
         <div className="hern-kiosk__dine-in-tables">
            {data &&
               data.brands_locationTable &&
               data.brands_locationTable.map(eachTable => {
                  return (
                     <div
                        className={classNames('hern-kiosk__dine-in-table')}
                        style={{
                           ...(eachTable.id === selectedLocationTableId && {
                              backgroundColor:
                                 config.dineInTableSettings
                                    .dineInSelectedTableBgColor.value,
                              color: config.dineInTableSettings
                                 .dineInSelectedTableTextColor.value,
                              clipPath:
                                 'polygon(0 0, 100% 0, 100% 100%, 0 98%)',
                           }),
                           // TODO: This design should be config based and should use svg insted of border
                           ...(eachTable.id !== selectedLocationTableId && {
                              // backgroundColor:
                              //    config.kioskSettings.theme.primaryColorLight
                              //       .value,
                              // color: config.dineInTableSettings
                              //    .dineInSelectedTableTextColor.value,
                              border:
                                 6 +
                                 'px solid ' +
                                 config.kioskSettings.theme.primaryColor.value,
                              clipPath:
                                 'polygon(0 0, 100% 0, 100% 100%, 0 98%)',
                           }),
                        }}
                        key={eachTable.id}
                        onClick={() => {
                           if (selectedLocationTableId === eachTable.id) {
                              setSelectedLocationTableId(null)
                           } else {
                              setSelectedLocationTableId(eachTable.id)
                           }
                        }}
                     >
                        {eachTable.internalTableLabel}
                     </div>
                  )
               })}
         </div>
      </Drawer>
   )
}
