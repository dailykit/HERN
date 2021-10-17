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
import { logger } from '../../utils'
import { useTabs } from '../../providers'
import validator from '../validator'
import { CREATE_SIMPLE_RECIPE } from '../../../apps/products/graphql'
import { repeat } from 'lodash'
import { Banner, Tooltip } from '../../components'

const CreateRecipe = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [recipe, setRecipe] = React.useState([
      {
         recipeName: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
         recipeAuthor: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createRecipe, { loading }] = useMutation(CREATE_SIMPLE_RECIPE, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.createSimpleRecipe.returning.map(separateTab => {
                  addTab(
                     separateTab.name,
                     `/products/recipes/${separateTab.id}`
                  )
               })
            }
         }
         console.log('The input contains:', input)
         setRecipe([
            {
               recipeName: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
               recipeAuthor: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Recipe!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the Recipe, please try again!'),
   })

   const createRecipeHandler = () => {
      try {
         const objects = recipe.filter(Boolean).map(recipe => ({
            name: `${recipe.recipeName.value}`,
            author: `${recipe.recipeAuthor.value}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createRecipe({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedRecipe = recipe
      const { name, value } = e.target
      if (name === `recipeName-${i}`) {
         const recipeNameIs = updatedRecipe[i].recipeName
         const recipeNameMeta = updatedRecipe[i].recipeName.meta

         recipeNameIs.value = value
         recipeNameMeta.isTouched = true
         recipeNameMeta.errors = validator.text(value).errors
         recipeNameMeta.isValid = validator.text(value).isValid
         setRecipe([...updatedRecipe])
         console.log('Recipe Name::::', recipe)
      }
      if (name === `recipeAuthor-${i}`) {
         const recipeAuthorIs = updatedRecipe[i].recipeAuthor
         const recipeAuthorMeta = updatedRecipe[i].recipeAuthor.meta

         recipeAuthorIs.value = value
         recipeAuthorMeta.isTouched = true
         recipeAuthorMeta.errors = validator.text(value).errors
         recipeAuthorMeta.isValid = validator.text(value).isValid

         setRecipe([...updatedRecipe])

         console.log(
            'Recipe Author::::',
            recipe.map(recipe => {
               return [
                  recipe.recipeAuthor.value,
                  recipe.recipeAuthor.meta.isValid,
               ]
            })
         )
      }
   }
   console.log('recipe :>> ', recipe)

   // const onBlur = (e, i) => {
   //    const { name, value } = e.target
   //    if (name === `recipeName-${i}` && name === `recipeAuthor-${i}`) {
   //       const recipeInstant = recipe[i]

   //       setRecipe([
   //          ...recipe,
   //          {
   //             ...recipeInstant,
   //             recipeName: {
   //                ...recipeInstant.recipeName,
   //                meta: {
   //                   ...recipeInstant.recipeName.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //             recipeAuthor: {
   //                ...recipeInstant.recipeAuthor,
   //                meta: {
   //                   ...recipeInstant.recipeAuthor.meta,
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
      let recipeValid = true
      recipe.map(recipe => {
         recipeValid =
            recipe.recipeName.meta.isValid && recipe.recipeAuthor.meta.isValid
         recipeValid = recipeValid && true
         return recipeValid
      })

      if (recipeValid === true) {
         return createRecipeHandler()
      }
      return toast.error('Recipe Name and Author is required!')
   }
   const close = () => {
      setRecipe([
         {
            recipeName: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
            recipeAuthor: {
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
            title="Add Recipe"
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
            tooltip={<Tooltip identifier="create_recipe_tunnelHeader" />}
         />
         <Banner id="product-app-recipe-create-recipe-tunnel-top" />
         <Flex padding="16px">
            {recipe.map((recipe, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`recipeName-${i}`}
                        title={`recipeName-${i}`}
                     >
                        Recipe Name*
                     </Form.Label>
                     <Form.Text
                        id={`recipeName-${i}`}
                        name={`recipeName-${i}`}
                        value={recipe.recipeName.value}
                        placeholder="Enter recipe name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `recipeName-${i}`)}
                        hasError={
                           !recipe.recipeName.meta.isValid &&
                           recipe.recipeName.meta.isTouched
                        }
                     />
                     {recipe.recipeName.meta.isTouched &&
                        !recipe.recipeName.meta.isValid &&
                        recipe.recipeName.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>

                  <Spacer yAxis size="16px" />
                  <Form.Group>
                     <Form.Label
                        htmlFor={`recipeAuthor-${i}`}
                        title={`recipeAuthor-${i}`}
                     >
                        Author Name*
                     </Form.Label>
                     <Form.Text
                        id={`recipeAuthor-${i}`}
                        name={`recipeAuthor-${i}`}
                        value={recipe.recipeAuthor.value}
                        placeholder="Enter author name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `recipeAuthor-${i}`)}
                        hasError={
                           !recipe.recipeAuthor.meta.isValid &&
                           recipe.recipeAuthor.meta.isTouched
                        }
                     />
                     {recipe.recipeAuthor.meta.isTouched &&
                        !recipe.recipeAuthor.meta.isValid &&
                        recipe.recipeAuthor.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Recipe"
               onClick={() =>
                  setRecipe([
                     ...recipe,
                     {
                        recipeName: {
                           value: null,
                           meta: {
                              isValid: false,
                              isTouched: false,
                              errors: [],
                           },
                        },
                        recipeAuthor: {
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
         <Banner id="product-app-recipe-create-recipe-tunnel-bottom" />
      </>
   )
}

export default CreateRecipe
