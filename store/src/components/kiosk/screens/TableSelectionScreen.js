import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { LOCATION_TABLES } from '../../../graphql'
import { useConfig } from '../../../lib'
import { useCart, useTranslation } from '../../../context'
import classNames from 'classnames'
import { BackSpaceIcon } from '../../../assets/icons'
import tw from 'twin.macro'
import KioskButton from '../component/button'

export const TableSelectionScreen = props => {
   const { config, setCurrentPage } = props
   const { locationId, orderTabs, dispatch } = useConfig()
   const { methods, storedCartId, setDineInTableInfo } = useCart()
   const { t, dynamicTrans, locale } = useTranslation()
   const [selectedLocationTableId, setSelectedLocationTableId] = useState(null)
   const [numbers, setNumbers] = React.useState('')
   const [isTableValid, setIsTableValid] = React.useState(false)
   const numberPadView =
      config?.dineInTableSettings?.dineInTableStyle?.value?.value ===
         'number-pad' || false
   const showPromotionalScreen =
      config?.promotionalScreenSettings?.showPromotionalScreen?.value ?? false

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

   React.useLayoutEffect(() => {
      const isTableValid = data?.brands_locationTable?.some(
         table => table.internalTableLabel === numbers
      )
      if (isTableValid) {
         setIsTableValid(true)
      } else {
         setIsTableValid(false)
      }
   }, [data, numbers])

   const onConfirmClick = async tableInfo => {
      setDineInTableInfo(tableInfo)
      if (storedCartId) {
         await methods.cart.update({
            variables: {
               id: storedCartId,
               _set: {
                  locationTableId: orderTabs.find(
                     eachOrderTab =>
                        eachOrderTab?.orderFulfillmentTypeLabel ===
                        'ONDEMAND_DINEIN'
                  )?.id,
               },
            },
         })
      }
      dispatch({
         type: 'SET_SELECTED_ORDER_TAB',
         payload: orderTabs.find(
            eachOrderTab =>
               eachOrderTab?.orderFulfillmentTypeLabel === 'ONDEMAND_DINEIN'
         ),
      })
      if (showPromotionalScreen) {
         setCurrentPage('promotionalPage')
      } else {
         setCurrentPage('menuPage')
      }
   }

   const handleProceed = () => {
      const selectedTableId = numberPadView
         ? numbers
         : selectedLocationTableId + ''
      const selectedTable = data.brands_locationTable.find(
         table => table.internalTableLabel === selectedTableId
      )

      if (numberPadView) {
         if (isTableValid) {
            onConfirmClick(selectedTable)
         }
      } else {
         onConfirmClick(selectedTable)
      }
   }

   return (
      <div
         className="animate__animated animate-fill-none animate__slideInRight"
         tw="fixed inset-0 h-screen w-screen "
      >
         <div tw="bg-white">
            <header className="hern-kiosk__phone-screen-header">
               <div tw="flex items-center w-full">
                  <button onClick={() => setCurrentPage('phonePage')}>
                     <svg
                        width="42"
                        height="42"
                        viewBox="0 0 42 42"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <rect
                           width="42"
                           height="42"
                           rx="21"
                           fill="#7124B4"
                        ></rect>
                        <path
                           d="M31.5 21.4113H10.5M10.5 21.4113L18.7889 14.8749M10.5 21.4113L18.7889 27.1249"
                           stroke="white"
                           stroke-width="3"
                           stroke-linecap="round"
                           stroke-linejoin="round"
                        ></path>
                     </svg>
                  </button>
                  <div tw="w-full text-center text-[56px] text-[#303030] font-bold">
                     Select table
                  </div>
               </div>
            </header>
            <div tw="h-[calc(100vh - 160px)] pt-12 pb-0">
               <div tw="px-14 pb-[57px]">
                  <div className="hern-kiosk__dine-in-heading-wrapper">
                     <span
                        data-translation="true"
                        className="hern-kiosk__dine-in-heading"
                     >
                        {config.dineInTableSettings.dineInPopupText.value}
                     </span>
                  </div>
                  {numberPadView ? (
                     <TableNumberPadView
                        numbers={numbers}
                        isTableValid={isTableValid}
                        setNumbers={setNumbers}
                        config={config}
                     />
                  ) : (
                     <div className="hern-kiosk__dine-in-tables">
                        {data &&
                           data.brands_locationTable &&
                           data.brands_locationTable
                              .sort(
                                 (
                                    brands_locationtable_element1,
                                    brands_locationtable_element2
                                 ) => {
                                    return (
                                       brands_locationtable_element1.internalTableLabel -
                                       brands_locationtable_element2.internalTableLabel
                                    )
                                 }
                              )
                              .map(eachTable => {
                                 return (
                                    <div
                                       className={classNames(
                                          'hern-kiosk__dine-in-table'
                                       )}
                                       style={{
                                          ...(eachTable.id ===
                                             selectedLocationTableId && {
                                             backgroundColor:
                                                config.dineInTableSettings
                                                   .dineInSelectedTableBgColor
                                                   .value,
                                             color: config.dineInTableSettings
                                                .dineInSelectedTableTextColor
                                                .value,
                                             clipPath:
                                                'polygon(0 0, 100% 0, 100% 100%, 0 98%)',
                                          }),

                                          ...(eachTable.id !==
                                             selectedLocationTableId && {
                                             // backgroundColor:
                                             //    config.kioskSettings.theme.primaryColorLight
                                             //       .value,
                                             // color: config.dineInTableSettings
                                             //    .dineInSelectedTableTextColor.value,
                                             border:
                                                6 +
                                                'px solid ' +
                                                config.kioskSettings.theme
                                                   .primaryColor.value,
                                             clipPath:
                                                'polygon(0 0, 100% 0, 100% 100%, 0 98%)',
                                          }),
                                       }}
                                       key={eachTable.id}
                                       onClick={() => {
                                          if (
                                             selectedLocationTableId ===
                                             eachTable.id
                                          ) {
                                             setSelectedLocationTableId(null)
                                          } else {
                                             setSelectedLocationTableId(
                                                eachTable.id
                                             )
                                          }
                                       }}
                                    >
                                       {eachTable.internalTableLabel}
                                    </div>
                                 )
                              })}
                     </div>
                  )}
               </div>

               <KioskButton
                  buttonConfig={config.kioskSettings.buttonSettings}
                  customClass={classNames(
                     'hern-kiosk__dine-in-selection-confirm-btn'
                  )}
                  disabled={
                     numberPadView ? !isTableValid : !selectedLocationTableId
                  }
                  onClick={handleProceed}
               >
                  {/* TODO: Button text should be dynamic (from config) */}
                  {t('Proceed')}
               </KioskButton>
            </div>
         </div>
      </div>
   )
}
const TableNumberPadView = ({ numbers, setNumbers, isTableValid, config }) => {
   const configCardImage = config?.dineInTableSettings?.metalCardImage?.value
   return (
      <>
         <div tw="w-full py-12 h-[548px]">
            <div tw="relative">
               <div tw="absolute top-1/2 text-9xl left-1/2 translate-x-[-50%] translate-y-[-50%]">
                  {numbers}
               </div>
               {configCardImage ? (
                  <div tw="max-h-[400px] overflow-hidden">
                     <img tw="mx-auto" src={configCardImage} alt="" />
                  </div>
               ) : (
                  <div tw="h-[380px] w-[380px]"></div>
               )}
            </div>

            {!isTableValid && numbers.length > 0 && (
               <div tw="text-center pt-9 text-3xl text-[#DC4405]">
                  {config?.dineInTableSettings?.tableNotAvailableMessage
                     ?.value || 'Table number does not exist'}
               </div>
            )}
         </div>
         <NumberPad numbers={numbers} setNumbers={setNumbers} />
      </>
   )
}

const NumberPad = ({ numbers, setNumbers }) => {
   const numberKeys = [
      { id: 1, content: '1' },
      { id: 2, content: '2' },
      { id: 3, content: '3' },
      { id: 4, content: '4' },
      { id: 5, content: '5' },
      { id: 6, content: '6' },
      { id: 7, content: '7' },
      { id: 8, content: '8' },
      { id: 9, content: '9' },
      {
         id: 10,
         content: (
            <span className="hern-kiosk__phone-number-drawer__number__clear-btn">
               Clear
            </span>
         ),
         onClick: () => setNumbers(''),
      },
      { id: 11, content: '0' },
      {
         id: 12,
         content: <BackSpaceIcon />,
         onClick: () => setNumbers(numbers.slice(0, -1)),
      },
   ]
   const handleNumberAdd = content => {
      if (numbers.length < 2) {
         setNumbers(numbers + content)
      }
   }
   return (
      <div tw="mt-auto" className="hern-kiosk__phone-number-drawer__number">
         <div tw="p-0 mb-0" className="hern-kiosk__number-pad">
            {numberKeys.map(({ id, content, onClick }) => {
               return (
                  <div
                     key={id}
                     onClick={
                        onClick ? onClick : () => handleNumberAdd(content)
                     }
                  >
                     {content}
                  </div>
               )
            })}
         </div>
      </div>
   )
}
