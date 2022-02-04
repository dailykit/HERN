import React from 'react'
import _ from 'lodash'
import {
   ComboButton,
   PlusIcon,
   ArrowDownIcon,
   ArrowUpIcon,
   EditIcon,
   Flex,
   Filler,
   TextButton,
} from '@dailykit/ui'
import { Card } from 'antd'
import { Text } from '@dailykit/ui'
import { FieldUI } from './getFieldUI'
import { EditModeProvider, useEditMode } from './EditModeContext'
import { Styles } from './styled'
import { toast } from 'react-toastify'
import { CrossIcon } from '../../assets/icons'

const ConfigTemplateUI = props => {
   return (
      <EditModeProvider>
         <ConfigUI {...props} />
      </EditModeProvider>
   )
}

const ConfigUI = ({ config, configSaveHandler, identifier, isChangeSaved, setIsSavedChange, noneditMode, setLinkedModuleId, setMode, mode }) => {
   const [configJSON, setConfigJSON] = React.useState({})
   const [fields, setFields] = React.useState([])
   const [description, setDescription] = React.useState('')
   const [isValid, setIsValid] = React.useState(true)
   const { editMode, setEditMode } = useEditMode()

   const elements = []

   //when there is any change in data
   const onConfigChange = (e, value) => {

      setIsSavedChange(false)

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
      console.log({ updatedConfig }, "updatedConfig")

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
            <div className="header">
               <h2>{title}</h2>
               {fieldData.description && <p>{fieldData.description}</p>}
            </div>
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
            {setDescription(fieldData.description)}
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
                  configSaveHandler={configSaveHandler}
                  isValid={isValid}
                  setIsValid={setIsValid}
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

   //for pageModule, this is to not have editMode when config is opened 
   React.useEffect(() => {
      if (noneditMode) {
         setEditMode(true)
      }

   }, [noneditMode])


   const handleEdit = () => {
      //after saving
      if (editMode) {
         configSaveHandler(configJSON)
         console.log(noneditMode)
         noneditMode && setLinkedModuleId(null)
         setMode('saved')
         //for pageModule this noneditMode tells the config belongs to pageModule 
         //and there is no requirement of editMode
         !noneditMode && setEditMode(false)
         setIsSavedChange(true)

      } else if (!editMode && !isChangeSaved && mode == 'editing') {
         toast.warning('Changes will be lost if not saved. Please save your changes.')
      }
      else {
         setMode('editing')
         //when editing
         setEditMode(true)
      }
   }
   return (
      <Styles.ConfigTemplateUI>
         {config ? (
            <>
               <Card
                  title={
                     identifier ? (<>
                        {/* for pageModule */}
                        {noneditMode && <button
                           title={'clear'}
                           onClick={() => setLinkedModuleId(null)}
                           style={{ cursor: "pointer", border: "none", backgroundColor: "transparent" }}
                        >
                           <CrossIcon size="14" />
                        </button>}&nbsp;&nbsp;
                        <Text as="h3" className="title">Edit {identifier}</Text></>
                     ) : (
                        <Text as="h3" style={{ textAlign: 'center' }}>
                           Edit
                        </Text>
                     )
                  }
                  style={{ width: '100%' }}
                  extra={
                     editMode ? (<>

                        <TextButton
                           type="solid"
                           size="sm"
                           disabled={!isValid}
                           onClick={handleEdit}
                        >
                           Save
                        </TextButton>
                     </>
                     ) : (
                        <ComboButton
                           className="edit_button"
                           type="ghost"
                           size="sm"
                           onClick={handleEdit}
                        >
                           <EditIcon color="#367bf5" /> Edit
                        </ComboButton>
                     )
                  }
               >
                  {fields.map((config, index) => (
                     <div key={index}>{config}</div>
                  ))}
               </Card>
            </>
         ) : (
            <Flex container justifyContent="center" padding="16px">
               <Filler
                  message="No brand's setting selected yet"
                  width="60%"
                  height="60%"
               />
            </Flex>
         )}
      </Styles.ConfigTemplateUI>
   )
}

export default ConfigTemplateUI
