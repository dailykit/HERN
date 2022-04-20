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
   console.log('data', data)
   const DineInFooter = () => {
      return (
         <KioskButton
            buttonConfig={config.kioskSettings.buttonSettings}
            customClass={classNames(
               'hern-kiosk__dine-in-selection-confirm-btn',
               {
                  'hern-kiosk__dine-in-selection-confirm-btn--disabled':
                     !selectedLocationTableId,
               }
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
            {t('CONFIRM')}
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
            fontWeight: '800',
         }}
         className="hern-kiosk__table-selection-drawer"
         destroyOnClose={true}
         footer={<DineInFooter />}
         closeIcon={
            <ArrowLeftIcon
               className="hern-kiosk__dine-in-selection-back"
               size={42}
               onClose={() => {
                  setSelectedLocationTableId(null)
                  onClose()
               }}
               style={{
                  backgroundColor: `${
                     config?.kioskSettings?.theme?.arrowBgColor?.value ||
                     theme?.accent
                  }99`,
                  color: `${
                     config?.kioskSettings?.theme?.arrowColor?.value ||
                     '#000000'
                  }`,
               }}
            />
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
                           ...(eachTable.id !== selectedLocationTableId && {
                              backgroundColor:
                                 config.kioskSettings.theme.primaryColorLight
                                    .value,
                              color: config.dineInTableSettings
                                 .dineInSelectedTableTextColor.value,
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
