import React from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import {
   Filler,
   Flex,
   Form,
   HelperText,
   RadioGroup,
   Spacer,
   Text,
   TunnelHeader,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { CUISINES, UPDATE_RECIPE } from '../../../../../graphql'
import validator from '../../validators'
import { TunnelBody } from '../styled'

const InformationTunnel = ({ state, closeTunnel }) => {
   // State
   const [_state, _dispatch] = React.useReducer(reducer, initialState)

   const options = [
      { id: 'Non-vegetarian', title: 'Non-vegetarian' },
      { id: 'Vegetarian', title: 'Vegetarian' },
      { id: 'Vegan', title: 'Vegan' },
   ]

   // Subscription
   const { data: { cuisineNames = [] } = {}, loading } = useQuery(CUISINES, {
      onCompleted: data => {
         if (!state.cuisine && data.cuisineNames.length) {
            _dispatch({
               type: 'SET_VALUE',
               payload: {
                  field: 'cuisine',
                  value: data.cuisineNames[0].title,
               },
            })
         }
      },
      onError: error => {
         console.log('Something went wrong!')
         logger(error)
      },
      fetchPolicy: 'cache-and-network',
   })

   // Mutation
   const [updateRecipe, { loading: inFlight }] = useMutation(UPDATE_RECIPE, {
      variables: {
         id: state.id,
         set: {
            type: _state.type.value,
            cuisine: _state.cuisine.value,
            cookingTime: _state.cookingTime.value || null,
            author: _state.author.value,
            utensils: _state.utensils.value
               ? _state.utensils.value.split(',').map(tag => tag.trim())
               : [],
            notIncluded: _state.notIncluded.value
               ? _state.notIncluded.value.split(',').map(tag => tag.trim())
               : [],
            description: _state.description.value,
         },
      },
      onCompleted: () => {
         toast.success('Updated!')
         closeTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const save = () => {
      if (inFlight) return
      if (_state.utensils.meta.isValid && _state.cookingTime.meta.isValid) {
         updateRecipe()
      } else {
         toast.error('Invalid values!')
      }
   }

   React.useEffect(() => {
      const seedState = {
         type: {
            value: state.type || 'Vegetarian',
         },
         cuisine: {
            value: state.cuisine || '',
         },
         cookingTime: {
            value: state.cookingTime || '30',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
         author: {
            value: state.author || '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
         notIncluded: {
            value: state.notIncluded ? state.notIncluded.join(', ') : '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
         utensils: {
            value: state.utensils ? state.utensils.join(', ') : '',
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
   }, [])

   return (
      <>
         <TunnelHeader
            title="Add Basic Information"
            right={{
               action: save,
               title: inFlight ? 'Saving...' : 'Save',
            }}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="basic_information_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-recipes-create-recipe-basic-information-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  {cuisineNames.length ? (
                     <>
                        <Flex container alignItems="center">
                           <Text as="subtitle">Type</Text>
                           <Tooltip identifier="recipe_type" />
                        </Flex>
                        <RadioGroup
                           options={options}
                           active={_state.type.value}
                           onChange={option =>
                              _dispatch({
                                 type: 'SET_VALUE',
                                 payload: {
                                    field: 'type',
                                    value: option.title,
                                 },
                              })
                           }
                        />
                        <Spacer size="16px" />
                        <Flex maxWidth="300px">
                           <Form.Group>
                              <Form.Label htmlFor="cuisine" title="cuisine">
                                 <Flex container alignItems="center">
                                    Cuisine
                                    <Tooltip identifier="recipe_cuisine" />
                                 </Flex>
                              </Form.Label>
                              <Form.Select
                                 id="cuisine"
                                 name="cuisine"
                                 options={cuisineNames}
                                 onChange={e =>
                                    _dispatch({
                                       type: 'SET_VALUE',
                                       payload: {
                                          field: 'cuisine',
                                          value: e.target.value,
                                       },
                                    })
                                 }
                                 value={_state.cuisine.value}
                                 placeholder="Choose cuisine"
                              />
                           </Form.Group>
                        </Flex>
                        <Spacer size="16px" />
                        <Flex container>
                           <Form.Group>
                              <Form.Label htmlFor="author" title="author">
                                 <Flex container alignItems="center">
                                    Author
                                    <Tooltip identifier="recipe_author" />
                                 </Flex>
                              </Form.Label>
                              <Form.Text
                                 id="author"
                                 name="author"
                                 onChange={e =>
                                    _dispatch({
                                       type: 'SET_VALUE',
                                       payload: {
                                          field: 'author',
                                          value: e.target.value,
                                       },
                                    })
                                 }
                                 value={_state.author.value}
                                 placeholder="Enter author name"
                                 hasError={
                                    _state.author.meta.isTouched &&
                                    !_state.author.meta.isValid
                                 }
                              />
                              {_state.author.meta.isTouched &&
                                 !_state.author.meta.isValid &&
                                 _state.author.meta.errors.map(
                                    (error, index) => (
                                       <Form.Error key={index}>
                                          {error}
                                       </Form.Error>
                                    )
                                 )}
                           </Form.Group>
                           <Spacer xAxis size="16px" />
                           <Form.Group>
                              <Form.Label
                                 htmlFor="cookingTime"
                                 title="cookingTime"
                              >
                                 <Flex container alignItems="center">
                                    Cooking Time(mins)
                                    <Tooltip identifier="recipe_cooking_time" />
                                 </Flex>
                              </Form.Label>
                              <Form.Number
                                 id="cookingTime"
                                 name="cookingTime"
                                 value={_state.cookingTime.value}
                                 placeholder="Enter cooking time"
                                 onChange={e =>
                                    _dispatch({
                                       type: 'SET_VALUE',
                                       payload: {
                                          field: 'cookingTime',
                                          value: e.target.value,
                                       },
                                    })
                                 }
                                 onBlur={() => {
                                    const {
                                       isValid,
                                       errors,
                                    } = validator.cookingTime(
                                       _state.cookingTime.value
                                    )
                                    _dispatch({
                                       type: 'SET_ERRORS',
                                       payload: {
                                          field: 'cookingTime',
                                          meta: {
                                             isTouched: true,
                                             isValid,
                                             errors,
                                          },
                                       },
                                    })
                                 }}
                                 hasError={
                                    _state.cookingTime.meta.isTouched &&
                                    !_state.cookingTime.meta.isValid
                                 }
                              />
                              {_state.cookingTime.meta.isTouched &&
                                 !_state.cookingTime.meta.isValid &&
                                 _state.cookingTime.meta.errors.map(
                                    (error, index) => (
                                       <Form.Error key={index}>
                                          {error}
                                       </Form.Error>
                                    )
                                 )}
                           </Form.Group>
                        </Flex>
                        <Spacer size="16px" />
                        <Form.Group>
                           <Form.Label htmlFor="utensils" title="utensils">
                              <Flex container alignItems="center">
                                 Utensils
                                 <Tooltip identifier="recipe_utensils" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="utensils"
                              name="utensils"
                              onChange={e =>
                                 _dispatch({
                                    type: 'SET_VALUE',
                                    payload: {
                                       field: 'utensils',
                                       value: e.target.value,
                                    },
                                 })
                              }
                              onBlur={() => {
                                 const { isValid, errors } = validator.csv(
                                    _state.utensils.value
                                 )
                                 _dispatch({
                                    type: 'SET_ERRORS',
                                    payload: {
                                       field: 'utensils',
                                       meta: {
                                          isTouched: true,
                                          isValid,
                                          errors,
                                       },
                                    },
                                 })
                              }}
                              value={_state.utensils.value}
                              placeholder="Enter utensils"
                              hasError={
                                 _state.utensils.meta.isTouched &&
                                 !_state.utensils.meta.isValid
                              }
                           />
                           {_state.utensils.meta.isTouched &&
                              !_state.utensils.meta.isValid &&
                              _state.utensils.meta.errors.map(
                                 (error, index) => (
                                    <Form.Error key={index}>{error}</Form.Error>
                                 )
                              )}
                        </Form.Group>
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Pan, Spoon, Bowl"
                        />
                        <Spacer size="16px" />
                        <Form.Group>
                           <Form.Label
                              htmlFor="notIncluded"
                              title="notIncluded"
                           >
                              <Flex container alignItems="center">
                                 What you'll need
                                 <Tooltip identifier="recipe_not_included" />
                              </Flex>
                           </Form.Label>
                           <Form.Text
                              id="notIncluded"
                              name="notIncluded"
                              onChange={e =>
                                 _dispatch({
                                    type: 'SET_VALUE',
                                    payload: {
                                       field: 'notIncluded',
                                       value: e.target.value,
                                    },
                                 })
                              }
                              onBlur={() => {
                                 const { isValid, errors } = validator.csv(
                                    _state.notIncluded.value
                                 )
                                 _dispatch({
                                    type: 'SET_ERRORS',
                                    payload: {
                                       field: 'notIncluded',
                                       meta: {
                                          isTouched: true,
                                          isValid,
                                          errors,
                                       },
                                    },
                                 })
                              }}
                              value={_state.notIncluded.value}
                              placeholder="Enter what you'll need"
                              hasError={
                                 _state.notIncluded.meta.isTouched &&
                                 !_state.notIncluded.meta.isValid
                              }
                           />
                           {_state.notIncluded.meta.isTouched &&
                              !_state.notIncluded.meta.isValid &&
                              _state.notIncluded.meta.errors.map(
                                 (error, index) => (
                                    <Form.Error key={index}>{error}</Form.Error>
                                 )
                              )}
                        </Form.Group>
                        <HelperText
                           type="hint"
                           message="Enter comma separated values, for example: Salt, Oil, Pepper"
                        />
                        <Spacer size="16px" />
                        <Form.Group>
                           <Form.Label
                              htmlFor="description"
                              title="description"
                           >
                              <Flex container alignItems="center">
                                 Description
                                 <Tooltip identifier="recipe_description" />
                              </Flex>
                           </Form.Label>
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
                              value={_state.description.value}
                              placeholder="Write description for recipe"
                           />
                        </Form.Group>
                     </>
                  ) : (
                     <Filler
                        message="No cuisines found! To start, add some."
                        height="500px"
                     />
                  )}
               </>
            )}
            <Banner id="products-app-recipes-create-recipe-basic-information-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default InformationTunnel

const initialState = {
   type: {
      value: 'Vegetarian',
   },
   cuisine: {
      value: '',
   },
   cookingTime: {
      value: '30',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   author: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   notIncluded: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   utensils: {
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
