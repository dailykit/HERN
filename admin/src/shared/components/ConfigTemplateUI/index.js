import React from 'react'
import _ from 'lodash'
import styled from 'styled-components'
import {
   ComboButton,
   PlusIcon,
   ArrowDownIcon,
   ArrowUpIcon,
   EditIcon,
} from '@dailykit/ui'
import { FieldUI } from './getFieldUI'
import { EditModeProvider, useEditMode } from './EditModeContext'

const ConfigTemplateUI = props => {
   return (
      <EditModeProvider>
         <ConfigUI {...props} />
      </EditModeProvider>
   )
}

const ConfigUI = ({ config, configSaveHandler }) => {
   const [configJSON, setConfigJSON] = React.useState({})
   const [fields, setFields] = React.useState([])
   const { editMode, setEditMode } = useEditMode()
   const elements = []
   const onConfigChange = (e, value) => {
      let updatedConfig
      const type = _.get(configJSON, `${e.target.name}.dataType`)
      if (type === 'boolean' || type === 'html' || type === 'select') {
         updatedConfig = _.set(configJSON, `${e.target.name}.value`, value)
      } else {
         updatedConfig = _.set(
            configJSON,
            `${e.target.name}.value`,
            e.target.value
         )
      }
      setConfigJSON(prev => ({
         ...prev,
         ...updatedConfig,
      }))
   }

   const handleToggle = key => {
      const up = document.querySelector(`[data-arrow-diretion='down-${key}']`)
      const down = document.querySelector(`[data-arrow-diretion='up-${key}']`)
      up.classList.toggle('display-none')
      down.classList.toggle('display-none')
      const upArrows = document.querySelectorAll(
         `[data-arrow-diretion^='up-${key}.']`
      )
      const downArrows = document.querySelectorAll(
         `[data-arrow-diretion^='down-${key}.']`
      )
      const elements = document.querySelectorAll(
         `[data-config-path^="${key}."]`
      )
      const isOpen = up.classList.contains('display-none')
      elements.forEach(dom => {
         dom.classList.remove('display-none')
         if (isOpen) {
            dom.classList.add('display-none')
            upArrows.forEach(node => node.classList.add('display-none'))
            downArrows.forEach(node => node.classList.remove('display-none'))
         }
      })
   }
   const getHeaderUI = ({ title, fieldData, key }) => {
      const indentation = `${key.split('.').length * 8}px`
      return (
         <Styles.ConfigTemplateHeader
            id={key}
            data-config-path={key}
            indentation={indentation}
         >
            <h3>{title}</h3>
            <button
               type="button"
               className="display-none"
               onClick={() => handleToggle(key)}
               data-arrow-diretion={`up-${key}`}
            >
               <ArrowUpIcon />
            </button>
            <button
               type="button"
               onClick={() => handleToggle(key)}
               data-arrow-diretion={`down-${key}`}
            >
               <ArrowDownIcon color="#367BF5" />
            </button>
            {fieldData.description && <p>{fieldData.description}</p>}
         </Styles.ConfigTemplateHeader>
      )
   }

   const showConfigUI = (configData, rootKey) => {
      _.forOwn(configData, (value, key) => {
         const isFieldObject = _.has(value, 'value')
         if (isFieldObject) {
            const updatedRootkey = rootKey ? `${rootKey}.${key}` : key
            elements.push(
               <FieldUI
                  fieldKey={updatedRootkey}
                  configJSON={configJSON}
                  onConfigChange={onConfigChange}
                  value={value}
               />
            )
         } else {
            const updatedRootkey = rootKey ? `${rootKey}.${key}` : key
            if (typeof value === 'object' && value !== null) {
               elements.push(
                  getHeaderUI({
                     title: key,
                     fieldData: value,
                     key: updatedRootkey,
                  })
               )
               showConfigUI(value, updatedRootkey)
            }
         }
      })
   }
   const renderAllFields = (data, rootKey) => {
      showConfigUI(data, rootKey)
      setFields([...elements])
   }

   React.useEffect(() => {
      if (Object.keys(configJSON).length) {
         renderAllFields(configJSON, '')
      }
   }, [configJSON])

   React.useEffect(() => {
      if (config) {
         setConfigJSON(config)
      } else {
         setConfigJSON({})
      }
      setFields([])
   }, [config])

   const handleEdit = () => {
      if (editMode) {
         configSaveHandler(configJSON)
         setEditMode(false)
      } else {
         setEditMode(true)
      }
   }
   return (
      <Styles.ConfigTemplateUI>
         <Styles.Header>
            <Styles.Heading>Edit Component</Styles.Heading>
            {editMode ? (
               <ComboButton type="solid" size="sm" onClick={handleEdit}>
                  Save
                  <PlusIcon color="#fff" />
               </ComboButton>
            ) : (
               <ComboButton type="ghost" size="sm" onClick={handleEdit}>
                  Edit <EditIcon color="#367bf5" />
               </ComboButton>
            )}
         </Styles.Header>

         <div>
            {fields.map((config, index) => (
               <div key={index}>{config}</div>
            ))}
         </div>
      </Styles.ConfigTemplateUI>
   )
}

const Styles = {
   ConfigTemplateUI: styled.div`
      .display-none {
         display: none;
      }
      padding: 16px;
   `,
   Header: styled.div`
      display: flex;
      justify-content: space-between;
      align-items: center;
   `,
   Heading: styled.div`
      color: #202020;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      padding: 0 0 16px 0;
   `,
   ConfigTemplateHeader: styled.div`
      display: flex;
      align-items: center;
      justify-content: space-between;
      > button {
         border: none;
         background: transparent;
      }
      > h3 {
         font-weight: 500;
         font-size: 14px;
         line-height: 16px;
         letter-spacing: 0.16px;
         color: #919699;
         text-transform: capitalize;
         padding: 4px;
         margin-left: ${({ indentation }) => indentation};
      }
   `,
}
export default ConfigTemplateUI
