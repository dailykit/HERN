import { Modal, Radio, Space } from 'antd'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from '../../context'
import KioskButton from './component/button'
import { ReloadIcon } from '../../assets/icons'
import { isClient } from '../../utils'
import { useIntl } from 'react-intl'

export const KioskHeader = props => {
   const { config } = props
   const { t } = useTranslation()
   const { formatMessage } = useIntl()
   const [showReloadWarningPopup, setShowReloadWarningPopup] =
      React.useState(false)

   return (
      <div
         className={classNames('hern-kiosk__kiosk-header-container', {
            'hern-kiosk__kiosk-header-container--centered-logo':
               config.kioskSettings?.header?.alignLogo?.value?.value ===
               'center',
         })}
      >
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
            title={formatMessage({
               id: 'Current changes will lose do you wish to continue?',
            })}
            visible={showReloadWarningPopup}
            centered={true}
            onCancel={() => {
               setShowReloadWarningPopup(false)
            }}
            closable={false}
            footer={null}
            className="hern-kiosk__kiosk-header-reset-modal"
         >
            <div
               style={{
                  display: 'flex',
                  alignItems: 'center',
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
                     padding: '.1em 2em',
                     color: `${config.kioskSettings.theme.primaryColor.value}`,
                  }}
                  buttonConfig={config.kioskSettings.buttonSettings}
               >
                  {t('CANCEL')}
               </KioskButton>
               <KioskButton
                  style={{ padding: '.1em 2em' }}
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
            {t('Reset')}
         </div>
      </div>
   )
}
