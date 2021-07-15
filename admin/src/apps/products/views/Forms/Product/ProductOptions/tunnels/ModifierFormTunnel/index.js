import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   ComboButton,
   Form,
   PlusIcon,
   RadioGroup,
   Spacer,
   Text,
   TunnelHeader,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { CloseIcon } from '../../../../../../../../shared/assets/icons'
import {
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../../shared/components'
import { logger, randomSuffix } from '../../../../../../../../shared/utils'
import { DeleteIcon } from '../../../../../../assets/icons'
import { ModifiersContext } from '../../../../../../context/product/modifiers'
import {
   MODIFIER,
   MODIFIER_CATEGORIES,
   MODIFIER_OPTION,
} from '../../../../../../graphql'
import validator from '../../../validators'
import { Flex, Grid, TunnelBody } from '../../../tunnels/styled'
import {
   Action,
   CategoryWrapper,
   ImageContainer,
   OptionBottom,
   OptionTop,
   OptionWrapper,
} from './styled'

const ModifierFormTunnel = ({
   open,
   close,
   openOperationConfigTunnel,
   modifierOpConfig,
}) => {
   const {
      modifiersState: { modifierId, optionId },
      modifiersDispatch,
   } = React.useContext(ModifiersContext)

   const [modifier, setModifier] = React.useState(null)
   const [modifierName, setModifierName] = React.useState({
      value: null,
      meta: {
         errors: [],
         isValid: true,
         isTouched: false,
      },
   })

   const { loading } = useSubscription(MODIFIER.VIEW, {
      variables: {
         id: modifierId,
      },
      onSubscriptionData: data => {
         setModifier(data.subscriptionData.data.modifier)
         setModifierName({
            ...modifierName,
            value: data.subscriptionData.data.modifier.name,
         })
      },
   })

   const handleNameUpdate = () => {
      const { isValid, errors } = validator.name(modifierName.value)
      if (isValid) {
         updateModifier({
            variables: {
               id: modifier.id,
               _set: {
                  name: modifierName.value,
               },
            },
         })
      }
      setModifierName({
         ...modifierName,
         meta: {
            isValid,
            errors,
            isTouched: true,
         },
      })
   }

   // Mutations
   const [updateModifier] = useMutation(MODIFIER.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [createModifierCategory] = useMutation(MODIFIER_CATEGORIES.CREATE, {
      onCompleted: () => toast.success('Category created!'),
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [updateOption] = useMutation(MODIFIER_OPTION.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
         modifiersDispatch({
            type: 'OPTION_ID',
            payload: null,
         })
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   React.useEffect(() => {
      if (modifierOpConfig && optionId) {
         updateOption({
            variables: {
               id: optionId,
               _set: {
                  operationConfigId: modifierOpConfig.id,
               },
            },
         })
      }
   }, [modifierOpConfig])

   if (loading) return <InlineLoader />

   return (
      <>
         <TunnelHeader
            title="Create New Modifier Template"
            close={() => close(2)}
            right={{
               title: 'Done',
               action: () => close(2),
            }}
            tooltip={<Tooltip identifier="add_modifier_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-single-product-add-modifier-tunnel-top" />

            <Form.Group>
               <Form.Label htmlFor="name" title="name">
                  Template Name*
               </Form.Label>
               <Form.Text
                  id="name"
                  name="name"
                  onBlur={handleNameUpdate}
                  onChange={e =>
                     setModifierName({ ...modifierName, value: e.target.value })
                  }
                  value={modifierName.value}
                  placeholder="Enter template name"
                  hasError={
                     modifierName.meta.isTouched && !modifierName.meta.isValid
                  }
               />
               {modifierName.meta.isTouched &&
                  !modifierName.meta.isValid &&
                  modifierName.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            {modifier?.categories.map(category => (
               <Category
                  category={category}
                  key={category.id}
                  open={open}
                  openOperationConfigTunnel={openOperationConfigTunnel}
               />
            ))}
            <ButtonTile
               type="secondary"
               text="Add Category"
               onClick={() =>
                  createModifierCategory({
                     variables: {
                        object: {
                           name: `category-${randomSuffix()}`,
                           modifierTemplateId: modifier.id,
                        },
                     },
                  })
               }
            />
            <Banner id="products-app-single-product-add-modifier-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default ModifierFormTunnel

export const Category = ({ category, open, openOperationConfigTunnel }) => {
   const options = [
      { id: 'single', title: 'Single' },
      { id: 'multiple', title: 'Multiple' },
   ]

   const { modifiersDispatch } = React.useContext(ModifiersContext)

   const [name, setName] = React.useState({
      value: category.name,
      meta: {
         isValid: true,
         isTouched: false,
         errors: [],
      },
   })
   const [min, setMin] = React.useState({
      value: category.limits?.min ?? '',
      meta: {
         isValid: true,
         isTouched: false,
         errors: [],
      },
   })
   const [max, setMax] = React.useState({
      value: category.limits?.max ?? '',
      meta: {
         isValid: true,
         isTouched: false,
         errors: [],
      },
   })

   const [updateCategory] = useMutation(MODIFIER_CATEGORIES.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [deleteCategory] = useMutation(MODIFIER_CATEGORIES.DELETE, {
      onCompleted: () => {
         toast.success('Category deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [createOption] = useMutation(MODIFIER_OPTION.CREATE, {
      onCompleted: () => toast.success('Option created!'),
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const handleNameUpdate = () => {
      const { isValid, errors } = validator.name(name.value)
      if (isValid) {
         updateCategory({
            variables: {
               id: category.id,
               _set: {
                  name: name.value,
               },
            },
         })
      }
      setName({
         ...name,
         meta: {
            isValid,
            errors,
            isTouched: true,
         },
      })
   }

   const handleLimitChange = limit => {
      switch (limit) {
         case 'min': {
            const { isValid, errors } = validator.min(min.value)
            if (isValid) {
               updateCategory({
                  variables: {
                     id: category.id,
                     _set: {
                        limits: {
                           min: +min.value,
                           max: +max.value,
                        },
                     },
                  },
               })
            }
            setMin({
               ...min,
               meta: {
                  isValid,
                  errors,
                  isTouched: true,
               },
            })
            break
         }
         case 'max': {
            const { isValid, errors } = validator.max(max.value)
            if (isValid) {
               updateCategory({
                  variables: {
                     id: category.id,
                     _set: {
                        limits: {
                           min: +min.value,
                           max: +max.value,
                        },
                     },
                  },
               })
            }
            setMax({
               ...max,
               meta: {
                  isValid,
                  errors,
                  isTouched: true,
               },
            })
            break
         }
      }
   }

   const createIndependentOption = () => {
      createOption({
         variables: {
            object: {
               modifierCategoryId: category.id,
               name: `option-${randomSuffix()}`,
               originalName: '',
            },
         },
      })
   }

   return (
      <CategoryWrapper id={category.id}>
         <Action
            onClick={() => deleteCategory({ variables: { id: category.id } })}
         >
            <DeleteIcon color="#FF5A52" />
         </Action>
         <Form.Group>
            <Form.Label
               htmlFor={`categoryName-${category.id}`}
               title={`categoryName-${category.id}`}
            >
               Category Name*
            </Form.Label>
            <Form.Text
               id={`categoryName-${category.id}`}
               name={`categoryName-${category.id}`}
               onBlur={handleNameUpdate}
               onChange={e => setName({ ...name, value: e.target.value })}
               value={name.value}
               placeholder="Enter category name"
               hasError={name.meta.isTouched && !name.meta.isValid}
            />
            {name.meta.isTouched &&
               !name.meta.isValid &&
               name.meta.errors.map((error, index) => (
                  <Form.Error key={index}>{error}</Form.Error>
               ))}
         </Form.Group>
         <Spacer size="8px" />
         <Grid>
            <div>
               <Text as="subtitle">Type</Text>
               <RadioGroup
                  options={options}
                  active={category.type}
                  onChange={option =>
                     updateCategory({
                        variables: {
                           id: category.id,
                           _set: {
                              type: option.id,
                              limits:
                                 option.id === 'single'
                                    ? null
                                    : {
                                         min: 1,
                                         max: null,
                                      },
                           },
                        },
                     })
                  }
               />
            </div>
            <div>
               <Text as="subtitle">Flags</Text>
               <Grid>
                  <Form.Checkbox
                     name={`isVisible-${category.id}`}
                     value={category.isVisible}
                     onChange={() =>
                        updateCategory({
                           variables: {
                              id: category.id,
                              _set: {
                                 isVisible: !category.isVisible,
                              },
                           },
                        })
                     }
                  >
                     Visible
                  </Form.Checkbox>
                  <Form.Checkbox
                     name={`isRequired-${category.id}`}
                     value={category.isRequired}
                     onChange={() =>
                        updateCategory({
                           variables: {
                              id: category.id,
                              _set: {
                                 isRequired: !category.isRequired,
                              },
                           },
                        })
                     }
                  >
                     Required
                  </Form.Checkbox>
               </Grid>
            </div>
         </Grid>
         <Spacer size="8px" />
         {category.type === 'multiple' && (
            <>
               <Text as="subtitle">Limits</Text>
               <Grid cols="3">
                  <Form.Group>
                     <Form.Label
                        htmlFor={`min-${category.id}`}
                        title={`min-${category.id}`}
                     >
                        Min*
                     </Form.Label>
                     <Form.Number
                        id={`min-${category.id}`}
                        name={`min-${category.id}`}
                        onBlur={() => handleLimitChange('min')}
                        onChange={e => {
                           setMin({ ...min, value: e.target.value })
                        }}
                        value={min.value}
                        placeholder="Enter min value"
                        hasError={!min.meta.isValid && min.meta.isTouched}
                     />
                     {min.meta.isTouched &&
                        !min.meta.isValid &&
                        min.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`min-${category.id}`}
                        title={`min-${category.id}`}
                     >
                        Max*
                     </Form.Label>
                     <Form.Number
                        id={`max-${category.id}`}
                        name={`max-${category.id}`}
                        onBlur={() => handleLimitChange('max')}
                        onChange={e => {
                           setMax({ ...max, value: e.target.value })
                        }}
                        value={max.value}
                        placeholder="Enter max value"
                        hasError={!max.meta.isValid && max.meta.isTouched}
                     />
                     {max.meta.isTouched &&
                        !max.meta.isValid &&
                        max.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
               </Grid>
            </>
         )}
         <Text as="subtitle">Options</Text>
         {category.options.map(option => (
            <Option
               open={open}
               openOperationConfigTunnel={openOperationConfigTunnel}
               option={option}
               key={option.id}
            />
         ))}
         <Grid>
            <ButtonTile
               type="secondary"
               text="Add Option"
               onClick={createIndependentOption}
            />
            <ButtonTile
               type="secondary"
               text="Add Option from Existing Items"
               onClick={() => {
                  modifiersDispatch({
                     type: 'CATEGORY_ID',
                     payload: category.id,
                  })
                  open(3)
               }}
            />
         </Grid>
      </CategoryWrapper>
   )
}

const Option = ({ open, openOperationConfigTunnel, option }) => {
   const { modifiersDispatch } = React.useContext(ModifiersContext)

   const [name, setName] = React.useState({
      value: option.name || '',
      meta: {
         isValid: true,
         isTouched: false,
         errors: [],
      },
   })
   const [price, setPrice] = React.useState({
      value: option.price ?? '',
      meta: {
         isValid: true,
         isTouched: false,
         errors: [],
      },
   })
   const [discount, setDiscount] = React.useState({
      value: option.discount ?? '',
      meta: {
         isValid: true,
         isTouched: false,
         errors: [],
      },
   })
   const [quantity, setQuantity] = React.useState({
      value: option.quantity ?? '',
      meta: {
         isValid: true,
         isTouched: false,
         errors: [],
      },
   })

   const [updateOption] = useMutation(MODIFIER_OPTION.UPDATE, {
      onCompleted: () => toast.success('Updated!'),
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [deleteOption] = useMutation(MODIFIER_OPTION.DELETE, {
      onCompleted: () => toast.success('Option deleted!'),
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const handleOnBlur = field => {
      switch (field) {
         case 'name': {
            const { isValid, errors } = validator.name(name.value)
            if (isValid) {
               updateOption({
                  variables: {
                     id: option.id,
                     _set: {
                        name: name.value,
                     },
                  },
               })
            }
            setName({
               ...name,
               meta: {
                  isValid,
                  errors,
                  isTouched: true,
               },
            })
            break
         }
         case 'price': {
            const { isValid, errors } = validator.price(price.value)
            if (isValid) {
               updateOption({
                  variables: {
                     id: option.id,
                     _set: {
                        price: +price.value,
                     },
                  },
               })
            }
            setPrice({
               ...price,
               meta: {
                  isValid,
                  errors,
                  isTouched: true,
               },
            })
            break
         }
         case 'discount': {
            const { isValid, errors } = validator.discount(discount.value)
            if (isValid) {
               updateOption({
                  variables: {
                     id: option.id,
                     _set: {
                        discount: discount.value,
                     },
                  },
               })
            }
            setDiscount({
               ...discount,
               meta: {
                  isValid,
                  errors,
                  isTouched: true,
               },
            })
            break
         }
         case 'quantity': {
            const { isValid, errors } = validator.quantity(quantity.value)
            if (isValid) {
               updateOption({
                  variables: {
                     id: option.id,
                     _set: {
                        quantity: quantity.value,
                     },
                  },
               })
            }
            setQuantity({
               ...quantity,
               meta: {
                  isValid,
                  errors,
                  isTouched: true,
               },
            })
            break
         }
      }
   }

   return (
      <OptionWrapper>
         <Action onClick={() => deleteOption({ variables: { id: option.id } })}>
            <DeleteIcon color="#FF5A52" />
         </Action>
         <OptionTop>
            {option.image ? (
               <ImageContainer>
                  <Action
                     onClick={() =>
                        updateOption({
                           variables: {
                              id: option.id,
                              _set: {
                                 image: null,
                              },
                           },
                        })
                     }
                  >
                     <DeleteIcon color="#FF5A52" />
                  </Action>
                  <img src={option.image} alt={option} />
               </ImageContainer>
            ) : (
               <ButtonTile
                  type="primary"
                  size="sm"
                  text="Add Photo"
                  onClick={() => {
                     modifiersDispatch({
                        type: 'OPTION_ID',
                        payload: option.id,
                     })
                     open(5)
                  }}
               />
            )}
            <div>
               <Flex>
                  <div>
                     <Form.Group>
                        <Form.Label
                           htmlFor={`optionName-${option.id}`}
                           title={`optionName-${option.id}`}
                        >
                           Option Name*
                        </Form.Label>
                        <Form.Text
                           id={`optionName-${option.id}`}
                           name={`optionName-${option.id}`}
                           onBlur={() => handleOnBlur('name')}
                           onChange={e =>
                              setName({ ...name, value: e.target.value })
                           }
                           value={name.value}
                           placeholder="Enter option name"
                           hasError={name.meta.isTouched && !name.meta.isValid}
                        />
                        {name.meta.isTouched &&
                           !name.meta.isValid &&
                           name.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Form.Group>
                     <small>{option.originalName}</small>
                  </div>
               </Flex>
               <Spacer size="8px" />
               <Grid cols="3">
                  <Form.Group>
                     <Form.Label
                        htmlFor={`optionPrice-${option.id}`}
                        title={`optionPrice-${option.id}`}
                     >
                        Price*
                     </Form.Label>
                     <Form.Number
                        id={`optionPrice-${option.id}`}
                        name={`optionPrice-${option.id}`}
                        onBlur={() => handleOnBlur('price')}
                        onChange={e =>
                           setPrice({ ...price, value: e.target.value })
                        }
                        value={price.value}
                        placeholder="Enter price"
                        hasError={!price.meta.isValid && price.meta.isTouched}
                     />
                     {price.meta.isTouched &&
                        !price.meta.isValid &&
                        price.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`optionDiscount-${option.id}`}
                        title={`optionDiscount-${option.id}`}
                     >
                        Discount(%)*
                     </Form.Label>
                     <Form.Number
                        id={`optionDiscount-${option.id}`}
                        name={`optionDiscount-${option.id}`}
                        onBlur={() => handleOnBlur('discount')}
                        onChange={e =>
                           setDiscount({ ...discount, value: e.target.value })
                        }
                        value={discount.value}
                        placeholder="Enter discount"
                        hasError={
                           !discount.meta.isValid && discount.meta.isTouched
                        }
                     />
                     {discount.meta.isTouched &&
                        !discount.meta.isValid &&
                        discount.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`optionQty-${option.id}`}
                        title={`optionQty-${option.id}`}
                     >
                        Quantity
                     </Form.Label>
                     <Form.Number
                        id={`optionQty-${option.id}`}
                        name={`optionQty-${option.id}`}
                        onBlur={() => handleOnBlur('quantity')}
                        onChange={e =>
                           setQuantity({ ...quantity, value: e.target.value })
                        }
                        value={quantity.value}
                        placeholder="Enter quantity"
                        hasError={
                           !quantity.meta.isValid && quantity.meta.isTouched
                        }
                     />
                     {quantity.meta.isTouched &&
                        !quantity.meta.isValid &&
                        quantity.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
               </Grid>
            </div>
         </OptionTop>
         <OptionBottom>
            <div />
            <Form.Checkbox
               name={`isActiveOption-${option.id}`}
               value={option.isActive}
               onChange={() =>
                  updateOption({
                     variables: {
                        id: option.id,
                        _set: { isActive: !option.isActive },
                     },
                  })
               }
            >
               Active
            </Form.Checkbox>
            <Form.Checkbox
               name={`isVisibleOption-${option.id}`}
               value={option.isVisible}
               onChange={() =>
                  updateOption({
                     variables: {
                        id: option.id,
                        _set: { isVisible: !option.isVisible },
                     },
                  })
               }
            >
               Visible
            </Form.Checkbox>
            <Flex container alignItems="center">
               {option?.operationConfig ? (
                  <ComboButton
                     type="ghost"
                     size="sm"
                     onClick={() =>
                        updateOption({
                           variables: {
                              id: option.id,
                              _set: {
                                 operationConfigId: null,
                              },
                           },
                        })
                     }
                  >
                     <CloseIcon color="#19B7EE" />
                     {option.operationConfig.name}
                  </ComboButton>
               ) : (
                  <ComboButton
                     type="ghost"
                     size="sm"
                     onClick={() => {
                        modifiersDispatch({
                           type: 'OPTION_ID',
                           payload: option.id,
                        })
                        openOperationConfigTunnel(1)
                     }}
                  >
                     <PlusIcon color="#19B7EE" />
                     Operation Config
                  </ComboButton>
               )}
            </Flex>
         </OptionBottom>
      </OptionWrapper>
   )
}
