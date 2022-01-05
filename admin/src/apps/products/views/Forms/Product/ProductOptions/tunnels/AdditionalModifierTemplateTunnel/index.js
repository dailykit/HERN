import React, { useEffect } from 'react'
import {
   Filler,
   Flex,
   Form,
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
   TunnelHeader,
   useMultiList,
   useSingleList,
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

const AdditionalModifierTemplateTunnel = ({ close }) => {
   const {
      modifiersState: { optionId },
   } = React.useContext(ModifiersContext)

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
   const [groupedList, setGroupedList] = React.useState(null)
   const [selectedModifiers, setSelectedModifiers] = React.useState(null)

   // multi select list
   const [search, setSearch] = React.useState('')
   const [isCreating, setIsCreating] = React.useState(false)
   const {
      data: { modifiers = [] } = {},
      loading,
      error,
   } = useSubscription(MODIFIERS)
   const [list, selected, selectOption] = useMultiList(modifiers)

   // subscription existing data
   const {
      data: { additionalModifier = [] } = {},
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
         setGroupedList(additionalModifierLabel)
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
      if (list.length > 0 && groupedList && groupedList.length) {
         const selectedModifiers = groupedList[0]?.additionalModifiers.map(
            eachModifier => {
               return list.find(item => item.id === eachModifier.modifierId)
            }
         )
         setSelectedModifiers(selectedModifiers)
         // console.log('selected modifiers', selectedModifiers)
         selectedModifiers.forEach(x => {
            selectOption('id', x.id)
         })
      }
   }, [list, groupedList])

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
            modifierIds: null,
            type: 'hidden',
         })
         close(1)
         close(3)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
         // console.log('error', error)
      },
   })
   const [deleteModifiers] = useMutation(ADDITIONAL_MODIFIERS.DELETE)

   // validator function
   const validator = value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text.length < 1) {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
      return { isValid, errors }
   }

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
                  errors: validator(value).errors,
                  isValid: validator(value).isValid,
               },
            },
         })
      }
   }
   // console.log('selectedModifiers', selectedModifiers)

   const save = () => {
      const labelValid = modifierData.label.meta.isValid
      const newData = selected.map(eachModifier => ({
         label: modifierData.label.value,
         type: modifierData.type,
         productOptionId: optionId,
         modifierId: eachModifier.id,
      }))

      if (selectedModifiers !== null) {
         selectedModifiers.forEach(x => {
            deleteModifiers({
               variables: {
                  productOptionId: optionId,
                  modifierId: x.id,
               },
            })
         })
      }

      // console.log('newData', newData)
      if (labelValid === true) {
         createAdditionalModifier({
            variables: {
               objects: newData,
            },
         })
      } else {
         toast.error('Label field can not be empty')
      }
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
            close={() => close(3)}
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
            <Banner id="products-app-single-product-additional-modifier-tunnel-top" />
            {!modifiers.length ? (
               <Filler
                  message="No modifiers found! To start, please add some."
                  height="500px"
               />
            ) : (
               <List>
                  <ListSearch
                     onChange={value => setSearch(value)}
                     placeholder="type what you’re looking for..."
                  />
                  {selected.length > 0 && (
                     <TagGroup style={{ margin: '8px 0' }}>
                        {selected.map(option => (
                           <Tag
                              key={option.id}
                              title={option.title}
                              onClick={() => selectOption('id', option.id)}
                           >
                              {option.title}
                           </Tag>
                        ))}
                     </TagGroup>
                  )}
                  <ListHeader type="MSL1" label="Modifiers" />
                  <ListOptions
                     search={search}
                     handleOnCreate={() => setIsCreating(true)}
                     isCreating={isCreating}
                  >
                     {list
                        .filter(option =>
                           option.title.toLowerCase().includes(search)
                        )
                        .map(option => (
                           <ListItem
                              type="MSL1"
                              key={option.id}
                              title={option.title}
                              onClick={() => selectOption('id', option.id)}
                              isActive={selected.find(
                                 item => item.id === option.id
                              )}
                           />
                        ))}
                  </ListOptions>
               </List>
            )}
            <Banner id="products-app-single-product -additional-modifier-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default AdditionalModifierTemplateTunnel
