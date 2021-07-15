import React from 'react'
import { toast } from 'react-toastify'

import {
   Tunnels,
   Tunnel,
   TunnelHeader,
   Flex,
   Form,
   Spacer,
   Text,
   HelperText,
} from '@dailykit/ui'
import { Tooltip } from '../Tooltip'
import Banner from '../Banner'

const NutritionTunnel = ({
   tunnels,
   title,
   closeTunnel,
   value,
   onSave,
   perDynamic=false,
}) => {
   const [state, dispatch] = React.useReducer(reducer, initialState)

   const validate = e => {
      let isValid = true
      let errors = []
      if (
         e.target.value.indexOf(' ') >= 0 === true &&
         e.target.value.indexOf(',') >= 0 === false
      ) {
         isValid = false
         errors = [...errors, 'Different values should be separated by a comma']
      } else if (Number.isNaN(e.target.value) || +e.target.value < 0) {
         isValid = false
         errors = [...errors, 'Invalid input!']
      }

      dispatch({
         type: 'SET_ERRORS',
         payload: {
            field: e.target.name,
            meta: {
               isTouched: true,
               isValid,
               errors,
            },
         },
      })
   }

   const onChange = e => {
      dispatch({
         type: 'SET_VALUE',
         payload: {
            field: e.target.name,
            value: e.target.value,
         },
      })
   }

   const getDailyValue = (type, value) => {
      switch (type) {
         case 'Total Fat':
            return Math.round((parseInt(value, 10) / 78) * 100) + '%'
         case 'Saturated Fat':
            return Math.round((parseInt(value, 10) / 20) * 100) + '%'
         case 'Cholesterol':
            return Math.round((parseInt(value, 10) / 300) * 100) + '%'
         case 'Sodium':
            return Math.round((parseInt(value, 10) / 2300) * 100) + '%'
         case 'Total Carbs':
            return Math.round((parseInt(value, 10) / 275) * 100) + '%'
         case 'Dietary Fibre':
            return Math.round((parseInt(value, 10) / 28) * 100) + '%'
         default:
            return 'NA'
      }
   }

   const save = () => {
      const isStateValid = Object.values(state).every(val => val.meta.isValid)
      if (isStateValid) {
         onSave({
            per: +state.per.value,
            calories: +state.calories.value || 0,
            totalFat: +state.totalFat.value || 0,
            saturatedFat: +state.saturatedFat.value || 0,
            transFat: +state.transFat.value || 0,
            cholesterol: +state.cholesterol.value || 0,
            sodium: +state.sodium.value || 0,
            totalCarbohydrates: +state.totalCarbohydrates.value || 0,
            dietaryFibre: +state.dietaryFibre.value || 0,
            sugars: +state.sugars.value || 0,
            protein: +state.protein.value || 0,
            vitaminA: +state.vitaminA.value || 0,
            vitaminC: +state.vitaminC.value || 0,
            calcium: +state.calcium.value || 0,
            iron: +state.iron.value || 0,
            excludes: state.excludes.value || '',
            allergens: state.allergens.value || '',
         })
         closeTunnel(1)
      } else {
         toast.error('Invalid input found!')
      }
   }

   React.useEffect(() => {
      if (value && Object.keys(value).length) {
         const seedState = {}
         for (const [k, v] of Object.entries(value)) {
            seedState[k] = {
               value: v,
               meta: {
                  isTouched: false,
                  isValid: true,
                  errors: [],
               },
            }
         }
         dispatch({
            type: 'SEED',
            payload: {
               state: seedState,
            },
         })
      }
   }, [value])

   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="md">
            <TunnelHeader
               title={title || 'Add Nutrition'}
               extraButtons={[
                  {
                     title: 'Reset',
                     action: () => alert('Action2 triggered!')
                  }
               ]}
               right={{ action: save, title: 'Save' }}
               close={() => closeTunnel(1)}
               tooltip={<Tooltip identifier="nutrition_tunnel" />}
            />
            <Banner id="nutrition-tunnel-top" />
            <Flex
               padding="16px"
               height="calc(100vh - 106px)"
               style={{ overflow: 'auto' }}
            >
               {!perDynamic ? (
                  <HelperText
                     type="hint"
                     message={`Add values per 100 gms`}
                  />
               ) : (
                  <Flex container alignItems="end" margin="0 0 16px 0">
                     <Form.Group>
                        <Form.Label htmlFor="per" title="per">
                           Per
                        </Form.Label>
                        <Form.Number
                           id="per"
                           name="per"
                           onChange={onChange}
                           onBlur={validate}
                           value={state.per.value}
                           placeholder="Enter per"
                           hasError={
                              state.per.meta.isTouched &&
                              !state.per.meta.isValid
                           }
                        />
                        {state.per.meta.isTouched &&
                           !state.per.meta.isValid &&
                           state.per.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Form.Group>
                  </Flex>
               )}

               <Spacer size="16px" />
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="calories" title="calories">
                        Calories
                     </Form.Label>
                     <Form.Number
                        id="calories"
                        name="calories"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.calories.value}
                        placeholder="Enter calories"
                        hasError={
                           state.calories.meta.isTouched &&
                           !state.calories.meta.isValid
                        }
                     />
                     {state.calories.meta.isTouched &&
                        !state.calories.meta.isValid &&
                        state.calories.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="totalFat" title="totalFat">
                        Total Fat
                     </Form.Label>
                     <Form.Number
                        id="totalFat"
                        name="totalFat"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.totalFat.value}
                        placeholder="Enter total fat"
                        hasError={
                           state.totalFat.meta.isTouched &&
                           !state.totalFat.meta.isValid
                        }
                     />
                     {state.totalFat.meta.isTouched &&
                        !state.totalFat.meta.isValid &&
                        state.totalFat.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">gms</Text>
                  <Spacer xAxis size="16px" />
                  <Text as="title">
                     {state.totalFat.meta.isValid &&
                        getDailyValue('Total Fat', +state.totalFat.value)}
                  </Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Spacer xAxis size="32px" />
                  <Form.Group>
                     <Form.Label htmlFor="saturatedFat" title="saturatedFat">
                        Saturated Fat
                     </Form.Label>
                     <Form.Number
                        id="saturatedFat"
                        name="saturatedFat"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.saturatedFat.value}
                        placeholder="Enter saturated fat"
                        hasError={
                           state.saturatedFat.meta.isTouched &&
                           !state.saturatedFat.meta.isValid
                        }
                     />
                     {state.saturatedFat.meta.isTouched &&
                        !state.saturatedFat.meta.isValid &&
                        state.saturatedFat.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">gms</Text>
                  <Spacer xAxis size="16px" />
                  <Text as="title">
                     {state.saturatedFat.meta.isValid &&
                        getDailyValue(
                           'Saturated Fat',
                           +state.saturatedFat.value
                        )}
                  </Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Spacer xAxis size="32px" />
                  <Form.Group>
                     <Form.Label htmlFor="transFat" title="transFat">
                        Trans Fat
                     </Form.Label>
                     <Form.Number
                        id="transFat"
                        name="transFat"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.transFat.value}
                        placeholder="Enter trans fat"
                        hasError={
                           state.transFat.meta.isTouched &&
                           !state.transFat.meta.isValid
                        }
                     />
                     {state.transFat.meta.isTouched &&
                        !state.transFat.meta.isValid &&
                        state.transFat.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">gms</Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="cholesterol" title="cholesterol">
                        Cholesterol
                     </Form.Label>
                     <Form.Number
                        id="cholesterol"
                        name="cholesterol"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.cholesterol.value}
                        placeholder="Enter cholesterol"
                        hasError={
                           state.cholesterol.meta.isTouched &&
                           !state.cholesterol.meta.isValid
                        }
                     />
                     {state.cholesterol.meta.isTouched &&
                        !state.cholesterol.meta.isValid &&
                        state.cholesterol.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">mg</Text>
                  <Spacer xAxis size="16px" />
                  <Text as="title">
                     {state.cholesterol.meta.isValid &&
                        getDailyValue('Cholesterol', +state.cholesterol.value)}
                  </Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="sodium" title="sodium">
                        Sodium
                     </Form.Label>
                     <Form.Number
                        id="sodium"
                        name="sodium"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.sodium.value}
                        placeholder="Enter sodium"
                        hasError={
                           state.sodium.meta.isTouched &&
                           !state.sodium.meta.isValid
                        }
                     />
                     {state.sodium.meta.isTouched &&
                        !state.sodium.meta.isValid &&
                        state.sodium.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">mg</Text>
                  <Spacer xAxis size="16px" />
                  <Text as="title">
                     {state.sodium.meta.isValid &&
                        getDailyValue('Sodium', +state.sodium.value)}
                  </Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label
                        htmlFor="totalCarbohydrates"
                        title="totalCarbohydrates"
                     >
                        Total Carbohydrates
                     </Form.Label>
                     <Form.Number
                        id="totalCarbohydrates"
                        name="totalCarbohydrates"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.totalCarbohydrates.value}
                        placeholder="Enter total carbohydrates"
                        hasError={
                           state.totalCarbohydrates.meta.isTouched &&
                           !state.totalCarbohydrates.meta.isValid
                        }
                     />
                     {state.totalCarbohydrates.meta.isTouched &&
                        !state.totalCarbohydrates.meta.isValid &&
                        state.totalCarbohydrates.meta.errors.map(
                           (error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           )
                        )}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">gms</Text>
                  <Spacer xAxis size="16px" />
                  <Text as="title">
                     {state.totalCarbohydrates.meta.isValid &&
                        getDailyValue(
                           'Total Carbs',
                           +state.totalCarbohydrates.value
                        )}
                  </Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Spacer xAxis size="32px" />
                  <Form.Group>
                     <Form.Label htmlFor="dietaryFibre" title="dietaryFibre">
                        Dietary Fibre
                     </Form.Label>
                     <Form.Number
                        id="dietaryFibre"
                        name="dietaryFibre"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.dietaryFibre.value}
                        placeholder="Enter dietary fibre"
                        hasError={
                           state.dietaryFibre.meta.isTouched &&
                           !state.dietaryFibre.meta.isValid
                        }
                     />
                     {state.dietaryFibre.meta.isTouched &&
                        !state.dietaryFibre.meta.isValid &&
                        state.dietaryFibre.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">gms</Text>
                  <Spacer xAxis size="16px" />
                  <Text as="title">
                     {state.dietaryFibre.meta.isValid &&
                        getDailyValue(
                           'Dietary Fibre',
                           +state.dietaryFibre.value
                        )}
                  </Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Spacer xAxis size="32px" />
                  <Form.Group>
                     <Form.Label htmlFor="sugars" title="sugars">
                        Sugars
                     </Form.Label>
                     <Form.Number
                        id="sugars"
                        name="sugars"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.sugars.value}
                        placeholder="Enter sugars"
                        hasError={
                           state.sugars.meta.isTouched &&
                           !state.sugars.meta.isValid
                        }
                     />
                     {state.sugars.meta.isTouched &&
                        !state.sugars.meta.isValid &&
                        state.sugars.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">gms</Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="protein" title="protein">
                        Protein
                     </Form.Label>
                     <Form.Number
                        id="protein"
                        name="protein"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.protein.value}
                        placeholder="Enter protein"
                        hasError={
                           state.protein.meta.isTouched &&
                           !state.protein.meta.isValid
                        }
                     />
                     {state.protein.meta.isTouched &&
                        !state.protein.meta.isValid &&
                        state.protein.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">gms</Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="vitaminA" title="vitaminA">
                        Vitamin A
                     </Form.Label>
                     <Form.Number
                        id="vitaminA"
                        name="vitaminA"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.vitaminA.value}
                        placeholder="Enter vitamin A"
                        hasError={
                           state.vitaminA.meta.isTouched &&
                           !state.vitaminA.meta.isValid
                        }
                     />
                     {state.vitaminA.meta.isTouched &&
                        !state.vitaminA.meta.isValid &&
                        state.vitaminA.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">%</Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="vitaminC" title="vitaminC">
                        Vitamin C
                     </Form.Label>
                     <Form.Number
                        id="vitaminC"
                        name="vitaminC"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.vitaminC.value}
                        placeholder="Enter vitamin C"
                        hasError={
                           state.vitaminC.meta.isTouched &&
                           !state.vitaminC.meta.isValid
                        }
                     />
                     {state.vitaminC.meta.isTouched &&
                        !state.vitaminC.meta.isValid &&
                        state.vitaminC.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">%</Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="calcium" title="calcium">
                        Calcium
                     </Form.Label>
                     <Form.Number
                        id="calcium"
                        name="calcium"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.calcium.value}
                        placeholder="Enter calcium"
                        hasError={
                           state.calcium.meta.isTouched &&
                           !state.calcium.meta.isValid
                        }
                     />
                     {state.calcium.meta.isTouched &&
                        !state.calcium.meta.isValid &&
                        state.calcium.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">%</Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="iron" title="iron">
                        Iron
                     </Form.Label>
                     <Form.Number
                        id="iron"
                        name="iron"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.iron.value}
                        placeholder="Enter iron"
                        hasError={
                           state.iron.meta.isTouched && !state.iron.meta.isValid
                        }
                     />
                     {state.iron.meta.isTouched &&
                        !state.iron.meta.isValid &&
                        state.iron.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
                  <Text as="title">%</Text>
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="excludes" title="excludes">
                        Excludes
                     </Form.Label>
                     <Form.Text
                        id="excludes"
                        name="excludes"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.excludes.value}
                        placeholder="Enter excludes"
                        hasError={
                           state.excludes.isTouched &&
                           !state.excludes.meta.isValid
                        }
                     />
                     {state.excludes.meta.isTouched &&
                        !state.excludes.meta.isValid &&
                        state.excludes.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
               </Flex>
               <Flex container alignItems="end" margin="0 0 16px 0">
                  <Form.Group>
                     <Form.Label htmlFor="allergens" title="allergens">
                        Allergens
                     </Form.Label>
                     <Form.Text
                        id="allergens"
                        name="allergens"
                        onChange={onChange}
                        onBlur={validate}
                        value={state.allergens.value}
                        placeholder="Enter allergens"
                        hasError={
                           state.allergens.isTouched &&
                           !state.allergens.meta.isValid
                        }
                     />
                     {state.allergens.meta.isTouched &&
                        !state.allergens.meta.isValid &&
                        state.allergens.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Spacer xAxis size="8px" />
               </Flex>
            </Flex>
            <Banner id="nutrition-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}

export default NutritionTunnel

const initialState = {
   per: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   calories: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   totalFat: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   saturatedFat: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   transFat: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   cholesterol: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   sodium: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   totalCarbohydrates: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   dietaryFibre: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   sugars: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   protein: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   vitaminA: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   vitaminC: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   calcium: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   iron: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   excludes: {
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   },
   allergens: {
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
