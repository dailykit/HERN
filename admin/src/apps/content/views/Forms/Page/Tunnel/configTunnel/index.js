import React from 'react'
import _ from 'lodash'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {
   TunnelHeader,
   Tunnel,
   Tunnels,
   Dropdown,
   Form,
   Flex,
   Spacer,
} from '@dailykit/ui'
// import { GET_FILES, LINK_CSS_FILES } from '../../../graphql'
import { TunnelBody } from './style'
import ConfigContext from '../../../../../context/Config'
import { isConfigFileExist, getFile } from '../../../../../utils'
import { getFieldUi } from '../component'
export default function ConfigTunnel({
   tunnels,
   openTunnel,
   closeTunnel,
   onSave,
   selectedOption,
}) {
   const [configContext, setConfigContext] = React.useContext(ConfigContext)
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
      setConfigJson(prev => {
         return {
            ...prev,
            ...updatedConfig,
         }
      })
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

   const renderAllFields = (data, rootKey) => {
      showConfigUi(data, rootKey)

      console.log('elements', elements)

      setFields([...elements])
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

   React.useEffect(() => {
      const fetchFile = async () => {
         const filePath = configContext?.file?.path
            .replace('components', 'components/config')
            .replace('ejs', 'json')
         const response = await getFile(filePath)
         if (response.status === 200) {
            const configData = await response.json()
            const updatedConfigData = _.defaultsDeep(
               configContext.config,
               configData
            )
            console.log('configJson', configData)

            console.log('updatedConfig', updatedConfigData)
            setConfigJson(updatedConfigData)
         }
      }
      fetchFile()
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
                  <div>
                     {fields.map((config, index) => {
                        return (
                           <div key={index}>
                              {config}
                              <Spacer size="16px" />
                           </div>
                        )
                     })}
                  </div>
               </TunnelBody>
            </Tunnel>
         </Tunnels>
      </div>
   )
}
