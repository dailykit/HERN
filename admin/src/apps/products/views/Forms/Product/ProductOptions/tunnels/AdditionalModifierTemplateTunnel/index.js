import React, { useEffect } from 'react'
import {
   ComboButton,
   Filler,
   Flex,
   Form,
   IconButton,
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   RadioGroup,
   Spacer,
   Tag,
   TagGroup,
   Text,
   Tunnel,
   TunnelHeader,
   Tunnels,
   useMultiList,
   useSingleList,
   useTunnel,
} from '@dailykit/ui'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
} from '../../../../../../../../shared/components'
import { ADDITIONAL_MODIFIERS, MODIFIERS } from '../../../../../../graphql'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { TunnelBody } from '../../../tunnels/styled'
import { ModifiersContext } from '../../../../../../context/product/modifiers'
import { logger } from '../../../../../../../../shared/utils'
import { toast } from 'react-toastify'
import _ from 'lodash'
import {
   DeleteIcon,
   EditIcon,
   PlusIcon,
} from '../../../../../../../../shared/assets/icons'
import validator from '../../../validators'
import {
   ModifierFormTunnel,
   ModifierModeTunnel,
   ModifierOptionsTunnel,
   ModifierPhotoTunnel,
   ModifierTemplatesTunnel,
   ModifierTypeTunnel,
} from '..'

const AdditionalModifierTemplateTunnel = ({
   openTunnel,
   closeTunnel,
   additionalModifier,
   setAdditionalModifier,

   openOperationConfigTunnel,
   setModifierCategoryOption,
   modifierOpConfig,
   modifierCategoryOption,
}) => {
   const {
      modifiersState: { optionId },
      modifiersDispatch,
   } = React.useContext(ModifiersContext)
   console.log({ additionalModifier })

   const [modifierTunnels, openModifierTunnel, closeModifierTunnel] =
      useTunnel(6)
   //const
   const [modifierData, setModifierData] = React.useState({
      label: {
         value: null,
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      type: 'hidden',
   })
   const [selectedModifiers, setSelectedModifiers] = React.useState([])
   const [selectedPreviousModifiers, setSelectedPreviousModifiers] =
      React.useState([])

   console.log([selectedModifiers])

   // multi select list
   const {
      data: { modifiers = [] } = {},
      loading,
      error,
   } = useSubscription(MODIFIERS)

   // subscription existing data
   const {
      data: { additionalModifierData = [] } = {},
      loading: loadingAdditionalModifier,
      error: errorAdditionalModifier,
   } = useSubscription(ADDITIONAL_MODIFIERS.VIEW, {
      variables: {
         productOptionId: optionId,
      },
      onSubscriptionData: data => {
         const additionalModifierLabel = _.chain(
            data.subscriptionData.data.products_productOption_modifier
         )
            .groupBy('label')
            .map((value, key) => ({ label: key, additionalModifiers: value }))
            .value()
         const additionalModifierType = _.chain(
            data.subscriptionData.data.products_productOption_modifier
         )
            .groupBy('type')
            .map((value, key) => ({ type: key, additionalModifiers: value }))
            .value()

         console.log(' additionalModifierType', additionalModifierType)
         console.log([
            data.subscriptionData.data.products_productOption_modifier,
         ])
         const additionalModifierIds =
            data.subscriptionData.data.products_productOption_modifier.map(
               each => {
                  return each.modifierId
               }
            )
         setSelectedModifiers([...additionalModifierIds])
         setSelectedPreviousModifiers([...additionalModifierIds])
         setModifierData({
            ...modifierData,
            label: {
               ...modifierData.label,
               value: additionalModifierLabel[0]?.label,
               meta: {
                  ...modifierData.label.meta,
                  isValid: true,
               },
            },
            type: additionalModifierType[0]?.type,
         })
      },
   })
   // console.log('optionId', optionId, groupedList)

   useEffect(() => {
      if (additionalModifier.modifierId !== null) {
         const exists = selectedModifiers.find(
            p => p === additionalModifier.modifierId
         )
         if (exists) {
            toast.error('Modifier Exists !')
         } else {
            setSelectedModifiers([
               ...selectedModifiers,
               additionalModifier.modifierId,
            ])
         }
      }
   }, [additionalModifier])

   // Mutations
   const [createAdditionalModifier] = useMutation(ADDITIONAL_MODIFIERS.CREATE, {
      onCompleted: () => {
         toast.success('Addition Modifier created.')
         setModifierData({
            label: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
            type: 'hidden',
         })
         closeTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
         console.log('error', error)
      },
   })
   const [deleteModifiers] = useMutation(ADDITIONAL_MODIFIERS.DELETE)

   // onBlur
   const onBlur = e => {
      const { name, value } = e.target
      if (name === 'label') {
         setModifierData({
            ...modifierData,
            label: {
               ...modifierData.label,
               value: modifierData.label.value,
               meta: {
                  ...modifierData.label.meta,
                  isTouched: true,
                  errors: validator.label(value).errors,
                  isValid: validator.label(value).isValid,
               },
            },
         })
      }
   }
   // console.log('selectedModifiers', selectedModifiers)

   const save = () => {
      const newData = selectedModifiers.map(eachModifierId => ({
         label: modifierData.label.value,
         type: modifierData.type,
         productOptionId: optionId,
         modifierId: eachModifierId,
      }))

      if (selectedPreviousModifiers !== null) {
         selectedPreviousModifiers.forEach(eachModifierId => {
            deleteModifiers({
               variables: {
                  productOptionId: optionId,
                  modifierId: eachModifierId,
               },
            })
         })
      }
      // console.log('newData', newData)
      if (selectedModifiers.length > 0) {
         createAdditionalModifier({
            variables: {
               objects: newData,
            },
         })
      } else {
         toast.error('Modifiers can not be Null !')
      }
   }

   // handler
   const handlerDelete = ({ index }) => {
      const array = [...selectedModifiers]
      if (index !== -1) {
         array.splice(index, 1)
         setSelectedModifiers([...array])
      }
   }
   const handlerEditModifier = modifierId => {
      modifiersDispatch({
         type: 'MODIFIER_ID',
         payload: modifierId,
      })
      openModifierTunnel(2)
   }
   const radioOption = [
      { id: 1, title: 'Visible', payload: 'visible' },
      { id: 2, title: 'Hidden', payload: 'hidden' },
   ]
   if (loading) return <InlineLoader />
   if (error) {
      logger(error)
      return <ErrorState />
   }
   return (
      <>
         <TunnelHeader
            title="Additional Modifier Templates"
            right={{
               title: loading ? 'Saving...' : 'Save',
               action: save,
            }}
            close={() => closeTunnel(1)}
            tooltip={
               <Tooltip identifier="additional_modifier_templates_tunnel" />
            }
         />
         <TunnelBody>
            <Form.Group>
               <Form.Label htmlFor={`label`} title={`label`}>
                  Label
               </Form.Label>
               <Form.Text
                  id={`label`}
                  name={`label`}
                  value={modifierData.label.value}
                  placeholder="Enter Label"
                  onChange={e =>
                     setModifierData({
                        ...modifierData,
                        label: {
                           ...modifierData.label,
                           value: e.target.value,
                        },
                     })
                  }
                  onBlur={onBlur}
                  hasError={
                     !modifierData.label.meta.isValid &&
                     modifierData.label.meta.isTouched
                  }
               />
               {modifierData.label.meta.isTouched &&
                  !modifierData.label.meta.isValid &&
                  modifierData.label.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="10px" />
            <Flex>
               <div style={{ marginBottom: '0.5em' }}>Change type</div>
               <RadioGroup
                  options={radioOption}
                  active={modifierData.type === 'visible' ? 1 : 2}
                  onChange={radioOption =>
                     setModifierData({
                        ...modifierData,
                        type: radioOption.payload,
                     })
                  }
               />
            </Flex>
            <Spacer size="10px" />
            <Banner id="products-app-single-product-additional-modifier-modifierTunnel-top" />
            <Flex>
               {selectedModifiers.map((each, index) =>
                  modifiers.map((eachModifier, i) => {
                     if (each === eachModifier.id) {
                        return (
                           <>
                              <Flex container alignItems="center" key={index}>
                                 <Flex>
                                    <Text as="subtitle">Modifier Template</Text>
                                    <Text as="p">{eachModifier.title}</Text>
                                 </Flex>
                                 <Spacer xAxis size="16px" />
                                 <IconButton
                                    title="Edit Modifier"
                                    type="ghost"
                                    onClick={() => handlerEditModifier(each)}
                                 >
                                    <EditIcon />
                                 </IconButton>

                                 <IconButton
                                    title="Delete Modifier"
                                    type="ghost"
                                    onClick={() => handlerDelete(index)}
                                 >
                                    <DeleteIcon />
                                 </IconButton>
                              </Flex>
                           </>
                        )
                     }
                  })
               )}
            </Flex>
            <ComboButton
               type="ghost"
               onClick={() => {
                  openModifierTunnel(1)
                  setAdditionalModifier({
                     ...additionalModifier,
                     modifierIdStatus: true,
                     modifierId: null,
                  })
               }}
            >
               <PlusIcon /> Add Modifiers
            </ComboButton>
            <Banner id="products-app-single-product -additional-modifier-modifierTunnel-bottom" />
         </TunnelBody>

         <Tunnels tunnels={modifierTunnels}>
            <Tunnel layer={1}>
               <ModifierModeTunnel
                  open={openModifierTunnel}
                  close={closeModifierTunnel}
                  setModifierCategoryOption={setModifierCategoryOption}
                  setAdditionalModifier={setAdditionalModifier}
                  additionalModifier={additionalModifier}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <ModifierFormTunnel
                  open={openModifierTunnel}
                  close={closeModifierTunnel}
                  openOperationConfigTunnel={openOperationConfigTunnel}
                  modifierOpConfig={modifierOpConfig}
                  setModifierCategoryOption={setModifierCategoryOption}
               />
            </Tunnel>
            <Tunnel layer={3}>
               <ModifierTypeTunnel
                  open={openModifierTunnel}
                  close={closeModifierTunnel}
               />
            </Tunnel>
            <Tunnel layer={4}>
               <ModifierOptionsTunnel
                  open={openModifierTunnel}
                  close={closeModifierTunnel}
               />
            </Tunnel>
            <Tunnel layer={5}>
               <ModifierPhotoTunnel
                  open={openModifierTunnel}
                  close={closeModifierTunnel}
               />
            </Tunnel>
            <Tunnel layer={6}>
               <ModifierTemplatesTunnel
                  open={openModifierTunnel}
                  close={closeModifierTunnel}
                  additionalModifier={additionalModifier}
                  setAdditionalModifier={setAdditionalModifier}
                  setModifierCategoryOption={setModifierCategoryOption}
                  modifierCategoryOption={modifierCategoryOption}
               />
            </Tunnel>
         </Tunnels>
      </>
   )
}

export default AdditionalModifierTemplateTunnel
