import React from 'react'
import _ from 'lodash'
import {
   ComboButton,
   ArrowDownIcon,
   ArrowUpIcon,
   EditIcon,
   Flex,
   Filler,
   TextButton,
} from '@dailykit/ui'
import { Card, Modal, Button } from 'antd'
import { Text } from '@dailykit/ui'
import { FieldUI } from './getFieldUI'
import { EditModeProvider, useEditMode } from './EditModeContext'
import { Styles } from './styled'
import { CrossIcon, WarningIcon } from '../../assets/icons'
import styled from 'styled-components'

const ConfigTemplateUI = props => {
   return (
      <EditModeProvider>
         <ConfigUI {...props} />
      </EditModeProvider>
   )
}

const ConfigUI = ({
   config,
   configSaveHandler,
   identifier,
   isChangeSaved,
   setIsSavedChange,
   noneditMode,
   setLinkedModuleId,
   setMode,
   mode,
   saveAllSettings,
   setSaveAllSettings,
   alertShow,
}) => {
   const [configJSON, setConfigJSON] = React.useState({})
   const [fields, setFields] = React.useState([])

   //for showing description in config
   const [isValid, setIsValid] = React.useState(true)

   //for toggling between edit and save button on config
   const { editMode, setEditMode } = useEditMode()

   // for showing alert box
   const [modalVisible, setModalVisible] = React.useState(false)
   const [modalLoading, setModalLoading] = React.useState(false)

   //for dropdown arrow in displaying config
   const elements = []

   //when there is any change in data
   const onConfigChange = (e, value) => {
      //whenever there is any change isChangeSaved is false
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
      setSaveAllSettings(configJSON)
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

   React.useEffect(() => {
      if (alertShow && saveAllSettings !== {}) {
         setEditMode(false)
      }
   }, [alertShow])

   const handleEdit = () => {
      //after saving
      if (editMode) {
         configSaveHandler(configJSON)
         noneditMode && setLinkedModuleId(null)
         setMode('saved')

         //for pageModule this noneditMode tells the config belongs to pageModule
         //and there is no requirement of editMode
         !noneditMode && setEditMode(false)
         setIsSavedChange(true)
      } else if (!editMode && !isChangeSaved && mode == 'editing') {
         //showing warning(alert box)to save changes
         setModalVisible(true)
         console.log(modalVisible)
      } else {
         setMode('editing')
         //when editing
         setEditMode(true)
      }
   }

   const handleOk = () => {
      setModalLoading(true)
      setTimeout(() => {
         configSaveHandler()
         setModalLoading(false)
         noneditMode && setLinkedModuleId(null)
         setMode('saved')
         setEditMode(false)
         //for pageModule this noneditMode tells the config belongs to pageModule
         //and there is no requirement of editMode
         !noneditMode && setEditMode(false)
         setIsSavedChange(true)
         setModalVisible(false)
      }, 1000)
   }

   return (
      <Styles.ConfigTemplateUI>
         {config ? (
            <>
               <Card
                  title={
                     identifier ? (
                        <>
                           {/* for pageModule */}
                           {noneditMode && (
                              <button
                                 title={'clear'}
                                 onClick={() => setLinkedModuleId(null)}
                                 style={{
                                    cursor: 'pointer',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                 }}
                              >
                                 <CrossIcon size="14" />
                              </button>
                           )}
                           &nbsp;&nbsp;
                           <Text as="h3" className="title">
                              Edit {identifier}
                           </Text>
                        </>
                     ) : (
                        <Text as="h3" style={{ textAlign: 'center' }}>
                           Edit
                        </Text>
                     )
                  }
                  style={{ width: '100%' }}
                  extra={
                     editMode && mode == 'editing' ? (
                        <>
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

                  <Modal
                     centered
                     visible={modalVisible}
                     title="Unsaved Changes"
                     onOk={handleOk}
                     onCancel={() => setModalVisible(false)}
                     footer={[
                        <Button
                           key="back"
                           onClick={() => setModalVisible(false)}
                           style={{ color: "#367BF5" }}
                        >
                           Discard
                        </Button>,
                        <Button
                           key="submit"
                           type="primary"
                           loading={modalLoading}
                           onClick={handleOk}
                           style={{ backgroundColor: "#367BF5" }}
                        >
                           Save
                        </Button>,
                     ]}
                  > <Layout>
                        <Sider><WarningIcon /></Sider>
                        <Content> Your Changes will be lost. Please save your changes.
                           <br />Click Save to save your changes.</Content>
                     </Layout>
                  </Modal>
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

export const Layout = styled.div`
display: flex;
    flex: auto;
    flex-direction: row;
    min-height: 0;
`
export const Sider = styled.div`
max-width:200px;
padding-right:20px;
`
export const Content = styled.div`
flex: auto;
    min-height: 0;
`