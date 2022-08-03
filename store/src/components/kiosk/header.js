import { Modal, Radio, Space } from 'antd'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation, useCart } from '../../context'
import KioskButton from './component/button'
import { ReloadIcon, ArrowLeftIconBG, ResetPopUpImage } from '../../assets/icons'
import { isClient } from '../../utils'
import { useIntl } from 'react-intl'
import { useConfig } from '../../lib'
import ReactHtmlParser from 'react-html-parser'

export const KioskHeader = props => {
   const { config } = props
   const { setCurrentPage, currentPage } = useConfig()
   const { t } = useTranslation()
   const { formatMessage } = useIntl()
   const [showReloadWarningPopup, setShowReloadWarningPopup] =
      React.useState(false)
   const [showClearCartWarning, setClearCartWarning] = React.useState(false)
   const { methods, storedCartId } = useCart()
   //config
   const showPromotionalScreen =
      config?.promotionalScreenSettings?.showPromotionalScreen?.value ?? false
   const showPhoneScreen =
      config?.phoneNoScreenSettings?.askPhoneNumber.value ?? false
   const fulfillmentType = localStorage.getItem('fulfillmentType')

   const handleArrowClick = () => {
      switch (currentPage) {
         case 'menuPage':
            if (
               config?.kioskSettings?.removeCartItemGoBackButton
                  ?.askForConfirmation?.value ||
               false
            ) {
               if (storedCartId) {
                  setClearCartWarning(true)
               } else {
                  if (showPromotionalScreen) {
                     setCurrentPage('promotionalPage')
                  } else {
                     if (fulfillmentType === 'ONDEMAND_DINEIN') {
                        setCurrentPage('tableSelectionPage')
                     } else {
                        if (showPhoneScreen) {
                           setCurrentPage('phonePage')
                        } else {
                           setCurrentPage('fulfillmentPage')
                        }
                     }
                  }
               }
            } else {
               setCurrentPage('fulfillmentPage')
            }
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

   return (
      <div
         className={classNames('hern-kiosk__kiosk-header-container', {
            'hern-kiosk__kiosk-header-container--centered-logo':
               config.kioskSettings?.header?.alignLogo?.value?.value ===
               'center',
         })}
         style={{
            gridTemplateColumns:
               config.kioskSettings?.header?.alignLogo?.value?.value ===
                  'center' &&
               currentPage !== 'fulfillmentPage' &&
               config.kioskSettings?.header?.backButton?.showBackButton.value
                  ? 'auto 1fr auto'
                  : '1fr auto',
         }}
      >
         {currentPage !== 'fulfillmentPage' &&
            config.kioskSettings?.header?.backButton?.showBackButton.value && (
               <ArrowLeftIconBG
                  style={{ marginRight: '1em' }}
                  onClick={handleArrowClick}
                  arrowColor={
                     config.kioskSettings?.header?.backButton?.arrowColor
                        ?.value || '#fff'
                  }
                  bgColor={
                     config.kioskSettings?.header?.backButton?.arrowBgColor
                        ?.value || config.kioskSettings.theme.primaryColor.value
                  }
               />
            )}
         {currentPage === 'menuPage' && (
            <Modal
               visible={showClearCartWarning}
               centered={true}
               onCancel={() => {
                  setClearCartWarning(false)
               }}
               closable={false}
               footer={null}
               className="hern-kiosk___header-go-back-confirmation-modal"
            >
               <div
                  style={{
                     fontWeight: '800',
                     fontSize: '24px',
                     marginBottom: '2rem',
                     textAlign: 'center',
                     lineHeight: '28px',
                     marginTop: '1rem',
                  }}
               >
                  {ReactHtmlParser(
                     config?.kioskSettings?.removeCartItemGoBackButton
                        ?.confirmationTextShown?.value ||
                        'All the cart items will be cleared<br>Do you still want to go back?'
                  )}
               </div>
               <div
                  style={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     padding: '0 2.2rem',
                  }}
               >
                  <KioskButton
                     onClick={() => {
                        setClearCartWarning(false)
                     }}
                     style={{
                        border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                        background: 'transparent !important',
                        padding: '.1em 2em',
                        color: `${config.kioskSettings.theme.primaryColor.value}`,
                     }}
                     buttonConfig={config.kioskSettings.buttonSettings}
                  >
                     {t(
                        config?.kioskSettings?.removeCartItemGoBackButton
                           ?.cancelButtonText?.value || 'Cancel'
                     )}
                  </KioskButton>
                  <KioskButton
                     style={{ padding: '.1em 2em' }}
                     onClick={() => {
                        if (storedCartId) {
                           methods.cart.delete({
                              variables: {
                                 id: storedCartId,
                              },
                           })
                        }
                        setClearCartWarning(false)
                        //handle previous page back
                        if (showPromotionalScreen) {
                           setCurrentPage('promotionalPage')
                        } else {
                           if (fulfillmentType === 'ONDEMAND_DINEIN') {
                              setCurrentPage('tableSelectionPage')
                           } else {
                              if (showPhoneScreen) {
                                 setCurrentPage('phonePage')
                              } else {
                                 setCurrentPage('fulfillmentPage')
                              }
                           }
                        }
                     }}
                     buttonConfig={config.kioskSettings.buttonSettings}
                  >
                     {t(
                        config?.kioskSettings?.removeCartItemGoBackButton
                           ?.confirmButtonText?.value || 'Continue'
                     )}
                  </KioskButton>
               </div>
            </Modal>
         )}
         <div className="hern-kiosk__kiosk-header__brand">
            <img
               src={config.kioskSettings.logo.value}
               className="hern-kiosk__kiosk-header-logo"
            />
            {config.kioskSettings.ShowBrandName.value &&
               config.kioskSettings.brandName.value && (
                  <h3>{config.kioskSettings.brandName.value}</h3>
               )}
         </div>

         <LanguageSelector
            config={config}
            setShowReloadWarningPopup={setShowReloadWarningPopup}
         />

         <Modal
            visible={showReloadWarningPopup}
            centered={true}
            onCancel={() => {
               setShowReloadWarningPopup(false)
            }}
            closable={false}
            footer={null}
            className="hern-kiosk__kiosk-header-reset-modal"
         >
            <div className='ant-modal-title'>
               <ResetPopUpImage style={{margin: "1rem auto"}} />
               <div style={{margin: "1rem auto", fontSize: "2.2rem"}}>
                  {formatMessage({
                     id: 'Current changes will lose do you wish to continue?'                  
                  })}
               </div>
            </div>
            <div
               style={{
                  display: 'flex',
                  margin: "0 2rem",
                  marginBottom: "1rem",
                  justifyContent: 'space-between',
               }}
            >
               <KioskButton
                  onClick={() => {
                     setShowReloadWarningPopup(false)
                  }}
                  style={{
                     border: `2px solid ${config.kioskSettings.theme.secondaryColor.value}`,
                     background: 'transparent !important',
                     padding: '.75rem 1rem',
                     color: `${config.kioskSettings.theme.primaryColor.value}`,
                     width: "45%",
                     fontSize: "24px"
                  }}
                  buttonConfig={config.kioskSettings.buttonSettings}
               >
                  {t('CANCEL')}
               </KioskButton>
               <KioskButton
                  style={{ 
                     padding: '.75rem 1rem',
                     width: "45%",
                     fontSize: "24px"
                  }}
                  onClick={() => {
                     if (isClient) {
                        window.location.reload()
                     }
                  }}
                  buttonConfig={config.kioskSettings.buttonSettings}
               >
                  {t('CONTINUE')}
               </KioskButton>
            </div>
         </Modal>
      </div>
   )
}
const LanguageSelector = props => {
   const { config, setShowReloadWarningPopup } = props
   const { changeLocale, locales, t } = useTranslation()

   const defaultLang = React.useMemo(() => {
      return locales.find(x => x.default).langCode
   }, [locales])

   const [lang, setLang] = useState(defaultLang)
   return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
         {config.kioskSettings.showLanguageSwitcher.value && (
            <Radio.Group
               defaultValue={lang}
               buttonStyle="solid"
               onChange={e => {
                  setLang(e.target.value)
                  changeLocale(e.target.value)
               }}
               style={{ display: 'flex' }}
               size="large"
            >
               <Space size={'large'}>
                  {locales.map((eachLang, index) => {
                     return (
                        <Radio.Button
                           value={eachLang.langCode}
                           key={index}
                           className={classNames(
                              'hern-kiosk__kiosk-language-option',
                              {
                                 'hern-kiosk__kiosk-language-option--active':
                                    lang === eachLang.langCode,
                              }
                           )}
                           style={{
                              backgroundColor: `${config.kioskSettings.theme.primaryColor.value}`,
                              border: `2px solid ${
                                 lang === eachLang.langCode
                                    ? config.kioskSettings.theme.successColor
                                         .value
                                    : config.kioskSettings.theme
                                         .primaryColorDark.value
                              }`,
                              borderRadius: `.5em`,
                              color: '#fff',
                           }}
                        >
                           {eachLang.flagIcon && (
                              <img
                                 src={eachLang.flagIcon}
                                 alt="flagIcon"
                                 className="hern-kiosk__kiosk-language-flag-icon"
                              />
                           )}{' '}
                           {eachLang.title}
                        </Radio.Button>
                     )
                  })}
               </Space>
            </Radio.Group>
         )}
         <div
            onClick={() => {
               setShowReloadWarningPopup(true)
            }}
            style={{
               margin: '0 20px',
               color: '#fff',
               textTransform: `${
                  config?.kioskSettings?.header?.resetButton?.textTransform
                     ?.value
                     ? config.kioskSettings.header.resetButton.textTransform
                          .value
                     : 'capitalize'
               }`,
               fontSize: `${
                  config?.kioskSettings?.header?.resetButton?.fontSize?.value
                     ? config.kioskSettings.header.resetButton.fontSize.value
                     : '1rem'
               }`,
            }}
         >
            {t(
               config?.kioskSettings?.header?.resetButton?.resetLabel?.value
                  ? config.kioskSettings.header.resetButton.resetLabel.value
                  : 'Reset'
            )}
         </div>
      </div>
   )
}
