import { Modal, Radio, Space } from 'antd'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from '../../context'
import KioskButton from './component/button'
import { ReloadIcon } from '../../assets/icons'
import { isClient } from '../../utils'

export const KioskHeader = props => {
   const { config } = props
   const { t } = useTranslation()
   const [showReloadWarningPopup, setShowReloadWarningPopup] =
      React.useState(false)
   return (
      <div className="hern-kiosk__kiosk-header-container">
         <img
            src={config.kioskSettings.logo.value}
            className="hern-kiosk__kiosk-header-logo"
         />
         <LanguageSelector
            config={config}
            setShowReloadWarningPopup={setShowReloadWarningPopup}
         />

         <Modal
            title={t('Current changes will lose do you wish to continue?')}
            visible={showReloadWarningPopup}
            centered={true}
            onCancel={() => {
               setShowReloadWarningPopup(false)
            }}
            closable={false}
            footer={null}
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
                     background: 'transparent',
                     padding: '.1em 2em',
                  }}
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
                                 ? config.kioskSettings.theme.successColor.value
                                 : config.kioskSettings.theme.primaryColorDark
                                      .value
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
         <div
            onClick={() => {
               setShowReloadWarningPopup(true)
            }}
            style={{
               margin: '0 20px',
               color: '#fff',
               fontSize: '16px',
            }}
         >
            {t('Reset')}
         </div>
      </div>
   )
}
