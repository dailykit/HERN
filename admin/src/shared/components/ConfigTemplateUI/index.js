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
      //only for brandSettings
      !noneditMode && setSaveAllSettings(configJSON)
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

   const getHeaderUI = ({ title, fieldData, key, isArray, isSubarray }) => {
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
            <div className="btn-group">
               {editMode && isArray && (
                  <button
                     type="button"
                     className={`add-${key}`}
                     onClick={e => {
                        fieldData.value.push(
                           JSON.parse(JSON.stringify(fieldData.userInsertType))
                        )
                        setConfigJSON(prev => ({
                           ...prev,
                           ...configJSON,
                        }))
                     }}
                  >
                     <svg
                        width="21"
                        height="21"
                        viewBox="0 0 21 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <rect
                           x="0.111816"
                           y="0.0976562"
                           width="20"
                           height="20"
                           rx="2"
                           fill="#367BF5"
                        />
                        <path
                           fillRule="evenodd"
                           clip-rule="evenodd"
                           d="M10.1119 5.81201C10.3392 5.81201 10.5572 5.90232 10.718 6.06306C10.8787 6.22381 10.969 6.44183 10.969 6.66915V9.24058H13.5405C13.7678 9.24058 13.9858 9.33089 14.1465 9.49163C14.3073 9.65238 14.3976 9.8704 14.3976 10.0977C14.3976 10.3251 14.3073 10.5431 14.1465 10.7038C13.9858 10.8646 13.7678 10.9549 13.5405 10.9549H10.969V13.5263C10.969 13.7536 10.8787 13.9716 10.718 14.1324C10.5572 14.2931 10.3392 14.3834 10.1119 14.3834C9.88456 14.3834 9.66654 14.2931 9.50579 14.1324C9.34505 13.9716 9.25474 13.7536 9.25474 13.5263V10.9549H6.68331C6.45599 10.9549 6.23797 10.8646 6.07722 10.7038C5.91648 10.5431 5.82617 10.3251 5.82617 10.0977C5.82617 9.8704 5.91648 9.65238 6.07722 9.49163C6.23797 9.33089 6.45599 9.24058 6.68331 9.24058H9.25474V6.66915C9.25474 6.44183 9.34505 6.22381 9.50579 6.06306C9.66654 5.90232 9.88456 5.81201 10.1119 5.81201V5.81201Z"
                           fill="white"
                        />
                     </svg>
                  </button>
               )}
               {editMode && isSubarray && (
                  <button
                     type="button"
                     className={`delete-${key}`}
                     onClick={e => {
                        let index = Number(_.last(key.split('.')))
                        let parentKey = key.split('.')
                        parentKey.splice(parentKey.length - 1)
                        parentKey = parentKey.join('.')
                        console.log('[Config]---> ', configJSON)
                        let new_values = _.get(configJSON, parentKey)
                        console.log('[New Values]---> ', new_values, parentKey)
                        new_values.splice(index, 1)
                        console.log('[Config]---> ', configJSON)
                        setConfigJSON(prev => ({
                           ...prev,
                           ...configJSON,
                        }))
                     }}
                  >
                     <svg
                        width="30"
                        height="30"
                        viewBox="0 0 21 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <rect
                           x="0.864258"
                           y="0.0976562"
                           width="20"
                           height="20"
                           rx="2"
                           fill="white"
                        />
                        <path
                           fillRule="evenodd"
                           clip-rule="evenodd"
                           d="M12.5311 6.88299H14.6142C15.0087 6.88299 15.3285 7.20278 15.3285 7.59727C15.3285 7.99176 15.0087 8.31156 14.6142 8.31156H13.7811V13.4306C13.7811 13.8908 13.408 14.2639 12.9478 14.2639H8.78109C8.32085 14.2639 7.94775 13.8908 7.94775 13.4306V8.31156H7.11419C6.7197 8.31156 6.3999 7.99176 6.3999 7.59727C6.3999 7.20278 6.7197 6.88299 7.11419 6.88299H9.19775V6.764C9.19775 6.30376 9.57085 5.93066 10.0311 5.93066H11.6978C12.158 5.93066 12.5311 6.30376 12.5311 6.764V6.88299ZM10.3878 9.68066C10.3878 9.48342 10.2279 9.32352 10.0306 9.32352C9.83338 9.32352 9.67348 9.48342 9.67348 9.68066V12.1807C9.67348 12.3779 9.83338 12.5378 10.0306 12.5378C10.2279 12.5378 10.3878 12.3779 10.3878 12.1807V9.68066ZM11.6978 9.32352C11.895 9.32352 12.0549 9.48342 12.0549 9.68066V12.1807C12.0549 12.3779 11.895 12.5378 11.6978 12.5378C11.5005 12.5378 11.3406 12.3779 11.3406 12.1807V9.68066C11.3406 9.48342 11.5005 9.32352 11.6978 9.32352Z"
                           fill="#919699"
                        />
                     </svg>
                  </button>
               )}
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
            </div>
         </Styles.ConfigTemplateHeader>
      )
   }

   const showConfigUI = (configData, rootKey) => {
      _.forOwn(configData, (value, key) => {
         const isFieldObject = _.has(value, 'value')
         console.log('Config (Key, Value) ->>', key, value)

         if (isFieldObject) {
            if (value?.userInsertType && Array.isArray(value.userInsertType)) {
               const updatedRootkey = rootKey
                  ? `${rootKey}.${key}.value`
                  : `${key}.value`
               console.log('[Key from Array block] --> ', key)

               elements.push(
                  getHeaderUI({
                     title: value.label,
                     fieldData: value,
                     key: updatedRootkey,
                     isArray: true,
                  })
               )

               console.log('[Updated Root Key] -->', value, updatedRootkey)
               showConfigUI(value.value, updatedRootkey)
            } else if (typeof value?.userInsertType === 'string') {
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
            }
         } else {
            const updatedRootkey = rootKey ? `${rootKey}.${key}` : key
            if (
               typeof value === 'object' &&
               value !== null &&
               !Array.isArray(value)
            ) {
               elements.push(
                  getHeaderUI({
                     title: key,
                     fieldData: value,
                     key: updatedRootkey,
                  })
               )
               showConfigUI(value, updatedRootkey)
            } else if (value !== null && Array.isArray(value)) {
               elements.push(
                  getHeaderUI({
                     title: Number(key) + 1,
                     fieldData: value,
                     key: updatedRootkey,
                     isSubarray: true,
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
   }, [configJSON, editMode])

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
                     (editMode && mode == 'editing') || noneditMode ? (
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
                           style={{ color: '#367BF5' }}
                        >
                           Discard
                        </Button>,
                        <Button
                           key="submit"
                           type="primary"
                           loading={modalLoading}
                           onClick={handleOk}
                           style={{ backgroundColor: '#367BF5' }}
                        >
                           Save
                        </Button>,
                     ]}
                  >
                     {' '}
                     <Layout>
                        <Sider>
                           <WarningIcon />
                        </Sider>
                        <Content>
                           {' '}
                           Your Changes will be lost. Please save your changes.
                           <br />
                           Click Save to save your changes.
                        </Content>
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
   max-width: 200px;
   padding-right: 20px;
`
export const Content = styled.div`
   flex: auto;
   min-height: 0;
`
