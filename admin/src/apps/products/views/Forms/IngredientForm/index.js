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
   TextButton,
   TunnelHeader,
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
import styled from 'styled-components'
import IngredientInsight from './components/Insight'

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
   const [insightTunnels, openInsightTunnel, closeInsightTunnel] = useTunnel(1)
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
         <Tunnels tunnels={insightTunnels}>
            <Tunnel layer={1} size="full">
               <TunnelHeader
                  title="Ingredient Insight"
                  close={() => closeInsightTunnel(1)}
                  description="This is a description"
               />
               <TunnelBody>
                  <IngredientInsight ingredientId={ingredientId} />
               </TunnelBody>
            </Tunnel>
         </Tunnels>
         <Flex
            container
            as="header"
            justifyContent="space-between"
            width="100%"
         >
            <HeaderWrapper>
               <InputTextWrapper>
                  <Flex container width="50%">
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
                           hasError={
                              !title.meta.isValid && title.meta.isTouched
                           }
                        />
                        {title.meta.isTouched &&
                           !title.meta.isValid &&
                           title.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Form.Group>
                  </Flex>
                  <Spacer xAxis size="16px" />
                  <Flex container width="50%" height="100%">
                     <Form.Group>
                        <Form.Label htmlFor="category" title="category">
                           Category
                        </Form.Label>
                        <Flex height="40px" padding="10px 0 0 0 ">
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
                        </Flex>
                     </Form.Group>
                  </Flex>
               </InputTextWrapper>

               <Flex
                  container
                  alignItems="center"
                  justifyContent="flex-end"
                  width="100%"
                  height="100%"
               >
                  <Flex
                     container
                     alignItems="center"
                     padding="6px 16px"
                     margin="25px 0 0 0 "
                  >
                     {/* <InsightDashboard
                     appTitle="Products App"
                     moduleTitle="Ingredient Page"
                     variables={{
                        ingredientId,
                     }}
                  /> */}
                     <TextButton
                        type="outline"
                        size="sm"
                        onClick={() => openInsightTunnel(1)}
                     >
                        View Insight
                     </TextButton>
                  </Flex>
                  <Spacer xAxis size="11px" />
                  <div style={{ height: '77%' }}>
                     {state.isValid?.status ? (
                        <Flex
                           container
                           alignItems="center"
                           padding="6px 16px"
                           margin="25px 0 0 0 "
                        >
                           <TickIcon color="#00ff00" stroke={2} />
                           <Text as="p" style={{ margin: '0px' }}>
                              {' '}
                              All good!
                           </Text>
                        </Flex>
                     ) : (
                        <Flex
                           container
                           alignItems="center"
                           padding="6px 16px"
                           margin="25px 0 0 0 "
                        >
                           <CloseIcon color="#ff0000" />
                           <Text as="p" style={{ margin: '0px' }}>
                              {state.isValid?.error}
                           </Text>
                        </Flex>
                     )}
                  </div>
                  <Spacer xAxis size="11px" />
                  <ComboButton
                     type="ghost"
                     size="sm"
                     title="Link this ingredient to other"
                     style={{
                        padding: '6px 16px',
                        height: '63%',
                        margin: '25px 0 0 0 ',
                     }}
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
                     style={{ margin: '25px 0 0 0', height: '32px' }}
                  >
                     <Flex
                        container
                        title="Publish this ingredient"
                        alignItems="center"
                        padding="6px 0px 6px 16px"
                        margin="0px -30px 0px 0px"
                     >
                        Published
                        <Spacer xAxis size="16px" />
                        <Tooltip identifier="ingredient_publish" />
                     </Flex>
                  </Form.Toggle>
               </Flex>
            </HeaderWrapper>
         </Flex>
         <Flex padding="16px 32px 32px 32px">
            <Flex
               style={{
                  background: '#f3f3f3',
                  padding: '32px',
                  borderRadius: '20px',
               }}
            >
               <Stats state={state} />
            </Flex>
            <Spacer size="32px" />
            <Flex style={{ background: '#ffffff' }}>
               <Processings state={state} />
            </Flex>
         </Flex>
         <Banner id="products-app-single-ingredient-bottom" />
      </IngredientContext.Provider>
   )
}
const TunnelBody = styled.div`
   padding: 10px 16px 0px 32px;
   height: calc(100% - 103px);
   overflow: auto;
`
export default IngredientForm
