import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   Form,
   IconButton,
   Spacer,
   TunnelHeader,
   Text,
   Dropdown,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { DeleteIcon } from '../../../../../../../shared/assets/icons'
import { logger } from '../../../../../../../shared/utils'
import {
   CREATE_SIMPLE_RECIPE_YIELDS,
   S_SIMPLE_RECIPE_YIELDS,
} from '../../../../../graphql'
import validator from '../../validators'
import { TunnelBody } from '../styled'
import {
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'

const ServingsTunnel = ({ state, closeTunnel }) => {
   // State
   const [options, setOptions] = React.useState([])
   const [baseYieldId, setBaseYieldId] = React.useState(null)
   const [servings, setServings] = React.useState([
      {
         serving: {
            value: '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
         label: {
            value: '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
         yield: {
            value: '',
            meta: {
               isTouched: false,
               isValid: true,
               errors: [],
            },
         },
      },
   ])

   //  Subscription
   const { loading } = useSubscription(S_SIMPLE_RECIPE_YIELDS, {
      variables: {
         where: {
            isArchived: { _eq: false },
            simpleRecipeId: { _eq: state.id },
         },
      },
      onSubscriptionData: data => {
         const { simpleRecipeYields } = data.subscriptionData.data
         const ops = simpleRecipeYields
            .sort((a, b) => a.yield.serving - b.yield.serving)
            .map(y => ({
               id: y.id,
               title: String(y.yield.serving),
            }))
         setOptions(ops)
      },
   })

   // Mutation
   const [createYields, { loading: inFlight }] = useMutation(
      CREATE_SIMPLE_RECIPE_YIELDS,
      {
         onCompleted: () => {
            toast.success('Servings added!')
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const selectedOption = option => setBaseYieldId(option.id)
   const searchedOption = option => console.log(option)

   const save = () => {
      if (inFlight || !servings.length) return
      const hasInvalidFields = servings.some(
         object =>
            !object.serving.meta.isValid ||
            !object.serving.value.trim() ||
            !object.label.meta.isValid ||
            !object.yield.meta.isValid
      )
      if (hasInvalidFields) {
         return toast.error('All servings should be valid!')
      }

      const objects = servings.map(object => ({
         simpleRecipeId: state.id,
         baseYieldId,
         yield: {
            serving: +object.serving.value.trim(),
            label: object.label.value.trim(),
            quantity: {
               value:
                  object.yield.value === ''
                     ? null
                     : +object.yield.value.substr(
                          0,
                          object.yield.value.indexOf(' ')
                       ),
               unit:
                  object.yield.value === ''
                     ? null
                     : object.yield.value
                          .substr(object.yield.value.indexOf(' '))
                          .trim(),
            },
         },
         nutritionInfo: {
            data: {},
         },
      }))
      createYields({
         variables: {
            objects,
         },
      })
   }

   const handleChange = (field, value, index) => {
      const newServings = [...servings]
      console.log(newServings)
      newServings[index] = {
         ...newServings[index],
         [field]: {
            ...newServings[index][field],
            value,
         },
      }
      setServings([...newServings])
   }

   const handleFocus = (field, index) => {
      const newServings = [...servings]
      newServings[index] = {
         ...newServings[index],
         [field]: {
            ...newServings[index][field],
            meta: {
               isTouched: true,
               isValid: true,
               errors: [],
            },
         },
      }
      setServings([...newServings])
      console.log(newServings)
   }

   const validate = (field, index) => {
      const { isValid, errors } = validator[field](servings[index][field].value)
      const newServings = servings
      newServings[index] = {
         ...servings[index],
         [field]: {
            ...servings[index][field],
            meta: {
               isTouched: false,
               isValid,
               errors,
            },
         },
      }
      setServings([...newServings])
   }

   const addField = () => {
      console.log('added')
      if (servings.every(object => object.serving.value.trim().length)) {
         setServings([
            ...servings,
            {
               serving: {
                  value: '',
                  meta: {
                     isTouched: false,
                     isValid: true,
                     errors: [],
                  },
               },
               label: {
                  value: '',
                  meta: {
                     isTouched: false,
                     isValid: true,
                     errors: [],
                  },
               },
               yield: {
                  value: '',
                  meta: {
                     isTouched: false,
                     isValid: true,
                     errors: [],
                  },
               },
            },
         ])
      }
   }

   const removeField = index => {
      const newServings = servings
      newServings.splice(index, 1)
      setServings([...newServings])
   }

   return (
      <>
         <TunnelHeader
            title="Add Servings"
            right={{ action: save, title: inFlight ? 'Adding...' : 'Add' }}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="servings_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-recipes-create-recipe-servings-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  <Text as="subtitle">Derive from another serving</Text>
                  <Dropdown
                     type="single"
                     options={options}
                     searchedOption={searchedOption}
                     selectedOption={selectedOption}
                     placeholder="type what you're looking for..."
                  />
                  <Spacer size="32px" />
                  {servings.map((object, i) => (
                     <>
                        <Flex container alignItems="end">
                           <Flex container alignItems="start">
                              <Form.Group>
                                 {(servings[i].serving.value ||
                                    servings[i].serving.meta.isTouched) && (
                                    <Form.Label
                                       htmlFor={`serving-${i}`}
                                       title={`serving-${i}`}
                                    >
                                       Serving*
                                    </Form.Label>
                                 )}

                                 <Form.Text
                                    id={`serving-${i}`}
                                    name={`serving-${i}`}
                                    variant="revamp-sm"
                                    onChange={e =>
                                       handleChange(
                                          'serving',
                                          e.target.value,
                                          i
                                       )
                                    }
                                    onFocus={() => {
                                       handleFocus('serving', i)
                                    }}
                                    onBlur={() => validate('serving', i)}
                                    value={object.serving.value}
                                    placeholder="Enter serving"
                                    hasError={
                                       object.serving.meta.isTouched &&
                                       !object.serving.meta.isValid
                                    }
                                 />
                                 {!object.serving.meta.isTouched &&
                                    !object.serving.meta.isValid &&
                                    object.serving.meta.errors.map(
                                       (error, index) => (
                                          <Form.Error key={index}>
                                             {error}
                                          </Form.Error>
                                       )
                                    )}
                              </Form.Group>
                              <Spacer xAxis size="8px" />
                              <Form.Group>
                                 {(servings[i].label.value ||
                                    servings[i].label.meta.isTouched) && (
                                    <Form.Label
                                       htmlFor={`label-${i}`}
                                       title={`label-${i}`}
                                    >
                                       Label
                                    </Form.Label>
                                 )}

                                 <Form.Text
                                    id={`label-${i}`}
                                    name={`label-${i}`}
                                    onChange={e =>
                                       handleChange('label', e.target.value, i)
                                    }
                                    variant="revamp-sm"
                                    onFocus={() => {
                                       handleFocus('label', i)
                                    }}
                                    onBlur={() => validate('label', i)}
                                    value={object.label.value}
                                    placeholder="Enter label"
                                    hasError={
                                       object.label.meta.isTouched &&
                                       !object.label.meta.isValid
                                    }
                                 />
                                 {!object.label.meta.isTouched &&
                                    !object.label.meta.isValid &&
                                    object.label.meta.errors.map(
                                       (error, index) => (
                                          <Form.Error key={index}>
                                             {error}
                                          </Form.Error>
                                       )
                                    )}
                              </Form.Group>
                           </Flex>
                           <Spacer xAxis size="16px" />
                           <IconButton
                              type="ghost"
                              onClick={() => removeField(i)}
                           >
                              <DeleteIcon color="#FF5A52" />
                           </IconButton>
                        </Flex>
                        <Spacer size="16px" />
                        <Flex container alignItems="end">
                           <Flex container alignItems="start">
                              <Form.Group>
                                 {(servings[i].yield.value ||
                                    servings[i].yield.meta.isTouched) && (
                                    <Form.Label
                                       htmlFor={`yield-${i}`}
                                       title={`yield-${i}`}
                                    >
                                       Yield
                                    </Form.Label>
                                 )}
                                 <Form.Text
                                    id={`yield-${i}`}
                                    name={`yield-${i}`}
                                    variant="revamp-sm"
                                    onChange={e =>
                                       handleChange('yield', e.target.value, i)
                                    }
                                    onBlur={() => validate('yield', i)}
                                    onFocus={() => {
                                       handleFocus('yield', i)
                                    }}
                                    value={object.yield.value}
                                    placeholder="Enter yield"
                                    hasError={
                                       object.yield.meta.isTouched &&
                                       !object.yield.meta.isValid
                                    }
                                 />
                                 {!object.yield.meta.isTouched &&
                                    !object.yield.meta.isValid &&
                                    object.yield.meta.errors.map(
                                       (error, index) => (
                                          <Form.Error key={index}>
                                             {error}
                                          </Form.Error>
                                       )
                                    )}
                              </Form.Group>
                           </Flex>
                        </Flex>
                        <Spacer size="16px" />
                     </>
                  ))}
                  <ButtonTile
                     type="secondary"
                     text="Add More"
                     onClick={addField}
                  />
               </>
            )}
            <Banner id="products-app-recipes-create-recipe-servings-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default ServingsTunnel
