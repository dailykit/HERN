import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Dropdown,
   Flex,
   Form,
   Spacer,
   TunnelHeader,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { useTabs } from '../../providers'
import validator from '../validator'
import { CREATE_INGREDIENTS } from '../../../apps/products/graphql'
import { repeat } from 'lodash'
import { Banner, Tooltip } from '../../components'

const CreateIngredient = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [ingredient, setIngredient] = React.useState([
      {
         ingredientName: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createIngredient, { loading }] = useMutation(CREATE_INGREDIENTS, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.createIngredient.returning.map(separateTab => {
                  addTab(
                     separateTab.name,
                     `/products/ingredients/${separateTab.id}`
                  )
               })
            }
         }
         console.log('The input contains:', input)
         setIngredient([
            {
               ingredientName: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Ingredient!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the Ingredient, please try again!'),
   })

   const createIngredientHandler = () => {
      try {
         const objects = ingredient.filter(Boolean).map(ingredient => ({
            name: `${ingredient.ingredientName.value}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createIngredient({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedIngredient = ingredient
      const { name, value } = e.target
      if (name === `ingredientName-${i}`) {
         const ingredientNameIs = updatedIngredient[i].ingredientName
         const ingredientNameMeta = updatedIngredient[i].ingredientName.meta

         ingredientNameIs.value = value
         ingredientNameMeta.isTouched = true
         ingredientNameMeta.errors = validator.text(value).errors
         ingredientNameMeta.isValid = validator.text(value).isValid
         setIngredient([...updatedIngredient])
         console.log('Ingredient Name::::', ingredient)
      }
   }
   console.log('ingredient :>> ', ingredient)

   // const onBlur = (e, i) => {
   //    const { name, value } = e.target
   //    if (name === `ingredientName-${i}` && name === `ingredientAuthor-${i}`) {
   //       const ingredientInstant = ingredient[i]

   //       setIngredient([
   //          ...ingredient,
   //          {
   //             ...ingredientInstant,
   //             ingredientName: {
   //                ...ingredientInstant.ingredientName,
   //                meta: {
   //                   ...ingredientInstant.ingredientName.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //             ingredientAuthor: {
   //                ...ingredientInstant.ingredientAuthor,
   //                meta: {
   //                   ...ingredientInstant.ingredientAuthor.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //          },
   //       ])
   //    }
   // }

   const save = type => {
      setClick(type)
      let ingredientValid = true
      ingredient.map(ingredient => {
         ingredientValid = ingredient.ingredientName.meta.isValid
         ingredientValid = ingredientValid && true
         return ingredientValid
      })

      if (ingredientValid === true) {
         return createIngredientHandler()
      }
      return toast.error('Ingredient Name is required!')
   }
   const close = () => {
      setIngredient([
         {
            ingredientName: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
         },
      ])
      closeTunnel(1)
   }
   return (
      <>
         <TunnelHeader
            title="Add Ingredient"
            right={{
               action: () => {
                  save('save')
               },
               title: loading && click === 'save' ? 'Saving...' : 'Save',
               // disabled: types.filter(Boolean).length === 0,
            }}
            extraButtons={[
               {
                  action: () => {
                     save('SaveAndOpen')
                  },
                  title:
                     loading && click === 'SaveAndOpen'
                        ? 'Saving...'
                        : 'Save & Open',
               },
            ]}
            close={close}
            tooltip={<Tooltip identifier="create_ingredient_tunnelHeader" />}
         />
         <Banner id="product-app-ingredient-create-ingredient-tunnel-top" />
         <Flex padding="16px">
            {ingredient.map((ingredient, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`ingredientName-${i}`}
                        title={`ingredientName-${i}`}
                     >
                        Ingredient Name*
                     </Form.Label>
                     <Form.Text
                        id={`ingredientName-${i}`}
                        name={`ingredientName-${i}`}
                        value={ingredient.ingredientName.value}
                        placeholder="Enter ingredient name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `ingredientName-${i}`)}
                        hasError={
                           !ingredient.ingredientName.meta.isValid &&
                           ingredient.ingredientName.meta.isTouched
                        }
                     />
                     {ingredient.ingredientName.meta.isTouched &&
                        !ingredient.ingredientName.meta.isValid &&
                        ingredient.ingredientName.meta.errors.map(
                           (error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           )
                        )}
                  </Form.Group>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Ingredient"
               onClick={() =>
                  setIngredient([
                     ...ingredient,
                     {
                        ingredientName: {
                           value: null,
                           meta: {
                              isValid: false,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     },
                  ])
               }
            />
         </Flex>
         <Spacer xAxis size="24px" />
         <Banner id="product-app-ingredient-create-ingredient-tunnel-bottom" />
      </>
   )
}

export default CreateIngredient
