import React from 'react'
import _ from 'lodash'

import { TunnelHeader, Tunnel, Tunnels, Spacer } from '@dailykit/ui'
import { TunnelBody } from './style'
import ConfigContext from '../../../../../context/Config'
import { getFieldUi } from '../component'

export default function ConfigTunnel({ tunnels, closeTunnel, onSave }) {
   const [configContext] = React.useContext(ConfigContext)
   const [configJson, setConfigJson] = React.useState({})
   const [fields, setFields] = React.useState([])
   const elements = []

   const onConfigChange = (e, value) => {
      let updatedConfig
      const type = _.get(configJson, `${e.target.name}.dataType`)
      if (type === 'boolean' || type === 'html' || type === 'select') {
         updatedConfig = _.set(configJson, `${e.target.name}.value`, value)
      } else {
         updatedConfig = _.set(
            configJson,
            `${e.target.name}.value`,
            e.target.value
         )
      }
      setConfigJson(prev => ({
         ...prev,
         ...updatedConfig,
      }))
   }

   const getHeaderUi = ({ title, fieldData, key }) => {
      const indentation = `${key.split('.').length * 8}px`
      return (
         <div
            id={key}
            style={{
               marginLeft: indentation,
            }}
         >
            <h1 style={{ borderBottom: '1px solid #888D9D' }}>
               {title.toUpperCase()}
            </h1>
            {fieldData.description && (
               <p style={{ color: '#888D9D', fontSize: '14px' }}>
                  {fieldData.description}
               </p>
            )}
         </div>
      )
   }

   const showConfigUi = (configData, rootKey) => {
      _.forOwn(configData, (value, key) => {
         const isFieldObject = _.has(value, 'value')
         if (isFieldObject) {
            const updatedRootkey = rootKey ? `${rootKey}.${key}` : key
            elements.push(
               getFieldUi({
                  key: updatedRootkey,
                  configJson,
                  onConfigChange,
               })
            )
         } else {
            const updatedRootkey = rootKey ? `${rootKey}.${key}` : key
            if (typeof value === 'object' && value !== null) {
               elements.push(
                  getHeaderUi({
                     title: key,
                     fieldData: value,
                     key: updatedRootkey,
                  })
               )
               showConfigUi(value, updatedRootkey)
            }
         }
      })
   }

   const renderAllFields = (data, rootKey) => {
      showConfigUi(data, rootKey)
      setFields([...elements])
   }

   React.useEffect(() => {
      if (configContext.moduleType === 'system-defined') {
         const hasConfigTemplate = Boolean(
            configContext?.systemModule?.configTemplate
         )

         if (hasConfigTemplate) {
            const updatedConfigData = _.defaultsDeep(
               configContext?.config,
               configContext?.systemModule?.configTemplate
            )

            setConfigJson(updatedConfigData)
         } else {
            setConfigJson({})
            setFields([])
         }
      }
   }, [configContext])

   React.useEffect(() => {
      if (Object.keys(configJson).length) {
         renderAllFields(configJson, '')
      }
   }, [configJson])

   return (
      <div>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="full">
               <TunnelHeader
                  title="Config Details"
                  close={() => closeTunnel(1)}
                  right={{
                     title: 'Save',
                     action: () => onSave(configContext.id, configJson),
                  }}
               />
               <TunnelBody>
                  {fields.length > 0 ? (
                     <div>
                        {fields.map((config, index) => (
                           <div key={index}>
                              {config}
                              <Spacer size="16px" />
                           </div>
                        ))}
                     </div>
                  ) : (
                     <p style={{ textAlign: 'center', fontSize: '2rem' }}>
                        There are no config related to this Module
                     </p>
                  )}
               </TunnelBody>
            </Tunnel>
         </Tunnels>
      </div>
   )
}
