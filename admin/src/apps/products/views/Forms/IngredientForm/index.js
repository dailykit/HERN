import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ComboButton,
   Flex,
   Form,
   Spacer,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
   Dropdown,
} from '@dailykit/ui'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logger } from '../../../../../shared/utils'
import { CloseIcon, EyeIcon, TickIcon } from '../../../assets/icons'
import {
   IngredientContext,
   reducers,
   state as initialState,
} from '../../../context/ingredient'
import {
   S_INGREDIENT,
   S_SIMPLE_RECIPES_FROM_INGREDIENT_AGGREGATE,
   UPDATE_INGREDIENT,
   INGREDIENT_CATEGORIES_INGREDIENTS_AGGREGATE,
   INGREDIENT_INGREDIENT_CATEGORY_UPDATE,
   INGREDIENT_CATEGORY_CREATE,
} from '../../../graphql'
import { Processings, Stats } from './components'
import validator from './validators'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
   InsightDashboard,
} from '../../../../../shared/components'
import { useTabs } from '../../../../../shared/providers'
import { HeaderWrapper, InputTextWrapper } from './styled'
import { LinkedRecipesTunnel } from './tunnels'

const IngredientForm = () => {
   const { setTabTitle, tab, addTab } = useTabs()
   const { id: ingredientId } = useParams()
   const [ingredientState, ingredientDispatch] = React.useReducer(
      reducers,
      initialState
   )

   const [
      linkedRecipesTunnels,
      openLinkedRecipesTunnel,
      closeLinkedRecipesTunnel,
   ] = useTunnel(1)

   const [title, setTitle] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [category, setCategory] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const [state, setState] = React.useState({})
   const [linkedRecipesCount, setLinkedRecipesCount] = React.useState(0)
   const [options, setOptions] = React.useState([])
   const [searchIngredientCategory, setSearchIngredientCategory] =
      React.useState('')

   const selectedOption = option => {
      updateIngredientCategory({
         variables: { id: { _eq: state.id }, category: option.title },
      })
   }
   const searchedOption = option => {
      setSearchIngredientCategory(option)
   }

   const addIngredientCategory = () => {
      _addIngredientCategory({
         variables: {
            name: searchIngredientCategory,
         },
      })

      setSearchIngredientCategory('')
   }

   // Subscriptions
   const { loading, error } = useSubscription(S_INGREDIENT, {
      variables: {
         id: ingredientId,
      },
      onSubscriptionData: data => {
         setState(data.subscriptionData.data.ingredient)
         setTitle({
            ...title,
            value: data.subscriptionData.data.ingredient.name,
         })
         setCategory({
            ...category,
            value: data.subscriptionData.data.ingredient.category || '',
         })
      },
   })

   useSubscription(INGREDIENT_CATEGORIES_INGREDIENTS_AGGREGATE, {
      onSubscriptionData: data => {
         let newOptions = []
         data.subscriptionData.data.ingredientCategories.forEach((item, i) => {
            const ingredientData = { id: i }
            ingredientData.title = item.name
            ingredientData.description =
               'This is used ' +
               item.ingredients_aggregate.aggregate.count +
               ' times'
            newOptions = [...newOptions, ingredientData]
         })
         setOptions(newOptions)
      },
   })

   useSubscription(S_SIMPLE_RECIPES_FROM_INGREDIENT_AGGREGATE, {
      variables: {
         where: {
            ingredientId: {
               _eq: state.id,
            },
            isArchived: { _eq: false },
            simpleRecipe: {
               isArchived: { _eq: false },
            },
         },
      },
      onSubscriptionData: data => {
         setLinkedRecipesCount(
            data.subscriptionData.data
               .simpleRecipeIngredientProcessingsAggregate.aggregate.count
         )
      },
   })

   // Mutations
   const [updateIngredient] = useMutation(UPDATE_INGREDIENT, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: () => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [updateIngredientCategory] = useMutation(
      INGREDIENT_INGREDIENT_CATEGORY_UPDATE,
      {
         onCompleted: () => {
            toast.success('Updated!')
         },
         onError: () => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [_addIngredientCategory] = useMutation(INGREDIENT_CATEGORY_CREATE, {
      onCompleted: () => {
         toast.success('Ingredient category added!')
      },
      onError: error => {
         toast.error('Failed to add ingredient category!')
         logger(error)
      },
   })

   React.useEffect(() => {
      if (!tab && !loading && !isEmpty(title.value)) {
         addTab(title.value, `/products/ingredients/${ingredientId}`)
      }
   }, [tab, loading, title.value, addTab])

   // Handlers
   const updateName = async () => {
      const { isValid, errors } = validator.name(title.value)
      if (isValid) {
         const { data } = await updateIngredient({
            variables: {
               id: state.id,
               set: {
                  name: title.value,
               },
            },
         })
         if (data) {
            setTabTitle(title.value)
         }
      }
      setTitle({
         ...title,
         meta: {
            isTouched: true,
            errors,
            isValid,
         },
      })
   }
   const togglePublish = () => {
      const val = !state.isPublished
      if (val && !state.isValid.status) {
         toast.error('Ingredient should be valid!')
      } else {
         updateIngredient({
            variables: {
               id: state.id,
               set: {
                  isPublished: val,
               },
            },
         })
      }
   }

   if (loading) return <InlineLoader />
   if (!loading && error) {
      toast.error('Failed to fetch Ingredient!')
      logger(error)
      return <ErrorState />
   }

   return (
      <IngredientContext.Provider
         value={{ ingredientState, ingredientDispatch }}
      >
         <Banner id="products-app-single-ingredient-top" />
         <Tunnels tunnels={linkedRecipesTunnels}>
            <Tunnel layer={1} size="sm">
               <LinkedRecipesTunnel
                  state={state}
                  closeTunnel={closeLinkedRecipesTunnel}
               />
            </Tunnel>
         </Tunnels>
         <HeaderWrapper>
            <InputTextWrapper>
               <Form.Group>
                  <Form.Label htmlFor="title" title="title">
                     Ingredient Name*
                  </Form.Label>
                  <Form.Text
                     id="title"
                     name="title"
                     value={title.value}
                     placeholder="Enter ingredient name"
                     onChange={e =>
                        setTitle({ ...title, value: e.target.value })
                     }
                     onBlur={updateName}
                     hasError={!title.meta.isValid && title.meta.isTouched}
                  />
                  {title.meta.isTouched &&
                     !title.meta.isValid &&
                     title.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>
               <Spacer xAxis size="16px" />
               <Form.Group>
                  <Form.Label htmlFor="category" title="category">
                     Category
                  </Form.Label>
                  {options && (
                     <Dropdown
                        type="single"
                        variant="revamp"
                        addOption={addIngredientCategory}
                        options={options}
                        defaultOption={
                           options.find(
                              item => item.title === category.value
                           ) || null
                        }
                        searchedOption={searchedOption}
                        selectedOption={selectedOption}
                        typeName="category"
                     />
                  )}
               </Form.Group>
            </InputTextWrapper>

            <Flex
               container
               alignItems="center"
               justifyContent="flex-end"
               width="100%"
            >
               <Flex container alignItems="center">
                  <InsightDashboard
                     appTitle="Products App"
                     moduleTitle="Ingredient Page"
                     variables={{
                        ingredientId,
                     }}
                  />
               </Flex>
               <Spacer xAxis size="8px" />
               <div>
                  {state.isValid?.status ? (
                     <Flex container alignItems="center">
                        <TickIcon color="#00ff00" stroke={2} />
                        <Text as="p">All good!</Text>
                     </Flex>
                  ) : (
                     <Flex container alignItems="center">
                        <CloseIcon color="#ff0000" />
                        <Text as="p">{state.isValid?.error}</Text>
                     </Flex>
                  )}
               </div>
               <Spacer xAxis size="16px" />
               <ComboButton
                  type="ghost"
                  size="sm"
                  onClick={() => openLinkedRecipesTunnel(1)}
               >
                  <EyeIcon color="#00A7E1" />
                  {`Linked Recipes (${linkedRecipesCount})`}
               </ComboButton>
               <Spacer xAxis size="16px" />
               <Form.Toggle
                  name="published"
                  value={state.isPublished}
                  onChange={togglePublish}
               >
                  <Flex container alignItems="center">
                     Published
                     <Spacer xAxis size="16px" />
                     <Tooltip identifier="ingredient_publish" />
                  </Flex>
               </Form.Toggle>
            </Flex>
         </HeaderWrapper>
         <Spacer size="32px" />

         <Flex padding="32px" style={{ background: '#f3f3f3' }}>
            <Stats state={state} />
            <Spacer size="32px" />
            <Processings state={state} />
         </Flex>
         <Banner id="products-app-single-ingredient-bottom" />
      </IngredientContext.Provider>
   )
}

export default IngredientForm
