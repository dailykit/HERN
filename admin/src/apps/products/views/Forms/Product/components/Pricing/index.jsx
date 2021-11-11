import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, HelperText } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../shared/utils'
import { PRODUCT } from '../../../../../graphql'
import validator from '../../validators'

const Pricing = ({ state }) => {
   const [_state, _dispatch] = React.useReducer(reducer, initialState)

   console.log('🚀 ~ file: index.jsx ~ line 10 ~ Pricing ~ state', state)

   //Mutation
   const [updateProduct, { loading: inFlight }] = useMutation(PRODUCT.UPDATE, {
      variables: {
         id: state.id,
         set: {
            additionalText: _state.additionalText.value,
            price: _state.price.value || null,
            discount: _state.discount.value || null,
            tags: _state.tags.value
               ? _state.tags.value.split(',').map(tag => tag.trim())
               : [],
            description: _state.description.value,
         },
      },
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [updateDescription, { loading: loadingDesription }] = useMutation(
      PRODUCT.UPDATE,
      {
         onCompleted: () => {
            toast.success('Updated description!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            console.log(error)
            logger(error)
         },
      }
   )

   const [updateAdditionalText, { loading: loadingAdditionalText }] =
      useMutation(PRODUCT.UPDATE, {
         onCompleted: () => {
            toast.success('Updated additional text!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      })

   const [updateTags, { loading: loadingTags }] = useMutation(PRODUCT.UPDATE, {
      onCompleted: () => {
         toast.success('Updated tags!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [updatePrice, { loading: loadingPrice }] = useMutation(
      PRODUCT.UPDATE,
      {
         onCompleted: () => {
            toast.success('Updated Base Price!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [updateDiscount, { loading: loadingDiscount }] = useMutation(
      PRODUCT.UPDATE,
      {
         onCompleted: () => {
            toast.success('Updated Discount!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const save = () => {
      if (inFlight) return
      if (_state.price.meta.isValid && _state.discount.meta.isValid) {
         updateProduct()
      } else {
         toast.error('Invalid Values!')
      }
   }

   React.useEffect(() => {
      const seedState = {
         additionalText: {
            value: state.additionalText || '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },

         price: {
            value: state.price || '0',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },

         discount: {
            value: state.discount || '0',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },

         tags: {
            value: state.tags ? state.tags.join(', ') : '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },

         description: {
            value: state.description || '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
      }
      _dispatch({
         type: 'SEED',
         payload: {
            state: seedState,
         },
      })
   }, [state])

   const changePrice = price => {
      updatePrice({
         variables: {
            id: state.id,
            _set: {
               price: price,
            },
         },
      })
   }

   const changeDiscount = discount => {
      updateDiscount({
         variables: {
            id: state.id,
            _set: {
               discount: discount,
            },
         },
      })
   }

   const changeDescription = description => {
      updateDescription({
         variables: {
            id: state.id,
            _set: {
               description: description,
            },
         },
      })
   }

   const changeTags = tags => {
      updateTags({
         variables: {
            id: state.id,
            _set: {
               tags: tags.split(',').map(tag => tag.trim()),
            },
         },
      })
   }

   const changeAdditionalText = additionalText => {
      updateAdditionalText({
         variables: {
            id: state.id,
            _set: {
               additionalText: additionalText,
            },
         },
      })
   }

   return (
      <>
         <Flex width="1880px">
            <Spacer size="16px" />
            <Form.Group>
               {(_state.additionalText.value ||
                  _state.additionalText.meta.isTouched) && (
                  <Form.Label htmlFor="additionalText" title="additionalText">
                     <Flex container alignItems="center">
                        Additional Text
                     </Flex>
                  </Form.Label>
               )}

               <Form.Text
                  id="additionalText"
                  name="additionalText"
                  variant="revamp-sm"
                  onChange={e =>
                     _dispatch({
                        type: 'SET_VALUE',
                        payload: {
                           field: 'additionalText',
                           value: e.target.value,
                        },
                     })
                  }
                  onFocus={() => {
                     _dispatch({
                        type: 'SET_ERRORS',
                        payload: {
                           field: 'additionalText',
                           meta: {
                              isTouched: true,
                              isValid: true,
                              errors: [],
                           },
                        },
                     })
                  }}
                  onBlur={e => {
                     changeAdditionalText(e.target.value)
                     _dispatch({
                        type: 'SET_ERRORS',
                        payload: {
                           field: 'additionalText',
                           meta: {
                              isTouched: false,
                              isValid: true,
                              errors: [],
                           },
                        },
                     })
                  }}
                  value={_state.additionalText.value}
                  placeholder="enter additional text, this will be shown with name on store"
                  hasError={
                     _state.additionalText.meta.isTouched &&
                     !_state.additionalText.meta.isValid
                  }
               />
               {_state.additionalText.meta.isTouched &&
                  !_state.additionalText.meta.isValid &&
                  _state.additionalText.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="60px" />

            <Flex container style={{ gap: '70px' }}>
               <Form.Group>
                  <Form.Stepper
                     textBefore="$"
                     fieldName="Base Price:"
                     id="containers"
                     name="containers"
                     value={parseFloat(_state.price.value)}
                     width="70px"
                     onChange={value => {
                        _dispatch({
                           type: 'SET_VALUE',
                           payload: {
                              field: 'price',
                              value: parseFloat(value),
                           },
                        })
                        changePrice(value + '')
                     }}
                  />
               </Form.Group>

               <Form.Group>
                  <Form.Stepper
                     unitText="%"
                     fieldName="Discount:"
                     id="containers"
                     name="containers"
                     value={parseFloat(_state.discount.value)}
                     width="70px"
                     onChange={value => {
                        _dispatch({
                           type: 'SET_VALUE',
                           payload: {
                              field: 'discount',
                              value: parseFloat(value),
                           },
                        })
                        changeDiscount(value + '')
                     }}
                  />
               </Form.Group>
            </Flex>

            <Spacer size="60px" />
            <Form.Group>
               {(_state.tags.value || _state.tags.meta.isTouched) && (
                  <Form.Label htmlFor="tags" title="tags">
                     <Flex container alignItems="center">
                        Tags
                     </Flex>
                  </Form.Label>
               )}

               <Form.Text
                  id="tags"
                  name="tags"
                  variant="revamp-sm"
                  onChange={e => {
                     _dispatch({
                        type: 'SET_VALUE',
                        payload: {
                           field: 'tags',
                           value: e.target.value,
                        },
                     })
                     const { isValid, errors } = validator.csv(e.target.value)
                     _dispatch({
                        type: 'SET_ERRORS',
                        payload: {
                           field: 'tags',
                           meta: {
                              isTouched: true,
                              isValid,
                              errors,
                           },
                        },
                     })
                  }}
                  onBlur={e => {
                     if (_state.tags.meta.isValid) {
                        changeTags(e.target.value)
                     } else {
                        toast.error('Invalid values!')
                     }
                     _dispatch({
                        type: 'SET_ERRORS',
                        payload: {
                           field: 'tags',
                           meta: {
                              isTouched: false,
                              isValid: true,
                              errors: [],
                           },
                        },
                     })
                  }}
                  value={_state.tags.value}
                  placeholder="enter tags"
                  hasError={
                     _state.tags.meta.isTouched && !_state.tags.meta.isValid
                  }
                  onFocus={() => {
                     _dispatch({
                        type: 'SET_ERRORS',
                        payload: {
                           field: 'tags',
                           meta: {
                              isTouched: true,
                              isValid: true,
                              errors: [],
                           },
                        },
                     })
                  }}
               />
               {_state.tags.meta.isTouched &&
                  !_state.tags.meta.isValid &&
                  _state.tags.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="10px" />
            <HelperText
               type="hint"
               message="enter comma separated values, for example: No-gluten, sugarless"
            />
            <Spacer size="60px" />
            <Form.Group>
               {(_state.description.value ||
                  _state.description.meta.isTouched) && (
                  <Form.Label htmlFor="description" title="description">
                     <Flex container alignItems="center">
                        Description
                     </Flex>
                  </Form.Label>
               )}
               <Form.TextArea
                  id="description"
                  name="description"
                  onChange={e =>
                     _dispatch({
                        type: 'SET_VALUE',
                        payload: {
                           field: 'description',
                           value: e.target.value,
                        },
                     })
                  }
                  noBorder
                  style={{ padding: '0px' }}
                  value={_state.description.value}
                  onBlur={e => {
                     changeDescription(e.target.value)
                     _dispatch({
                        type: 'SET_ERRORS',
                        payload: {
                           field: 'description',
                           meta: {
                              isTouched: false,
                              isValid: true,
                              errors: [],
                           },
                        },
                     })
                  }}
                  onFocus={() => {
                     _dispatch({
                        type: 'SET_ERRORS',
                        payload: {
                           field: 'description',
                           meta: {
                              isTouched: true,
                              isValid: true,
                              errors: [],
                           },
                        },
                     })
                  }}
                  placeholder="Add Product Description"
               />
            </Form.Group>
         </Flex>
      </>
   )
}

export default Pricing

const initialState = {
   additionalText: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   price: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },

   discount: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },

   tags: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   description: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
}

const reducer = (state, { type, payload }) => {
   switch (type) {
      case 'SEED': {
         return {
            ...state,
            ...payload.state,
         }
      }
      case 'SET_VALUE': {
         return {
            ...state,
            [payload.field]: {
               ...state[payload.field],
               value: payload.value,
            },
         }
      }
      case 'SET_ERRORS': {
         return {
            ...state,
            [payload.field]: {
               ...state[payload.field],
               meta: payload.meta,
            },
         }
      }
      default:
         return state
   }
}
