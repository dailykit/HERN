import { Radio, Space } from 'antd'
import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from '../../context'

export const KioskHeader = props => {
   const { config } = props
   const { direction } = useTranslation()
   return (
      <div className="hern-kiosk__kiosk-header-container">
         <img
            src={config.kioskSettings.logo.value}
            className="hern-kiosk__kiosk-header-logo"
         />
         <LanguageSelector config={config} />
      </div>
   )
}
const LanguageSelector = props => {
   const { config } = props
   const { changeLocale, locales } = useTranslation()
   const defaultLang = React.useMemo(() => {
      return locales.find(x => x.default).langCode
   }, [locales])

   const [lang, setLang] = useState(defaultLang)
   return (
      <div>
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
      </div>
   )
}
