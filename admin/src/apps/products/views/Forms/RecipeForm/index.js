import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   Spacer,
   Text,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanels,
   HorizontalTabPanel,
   HorizontalTabs,
   ComboButton,
   Tunnel,
   useTunnel,
   Tunnels,
} from '@dailykit/ui'
import { isEmpty, stubTrue } from 'lodash'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
   InsightDashboard,
} from '../../../../../shared/components'
import { logger, randomSuffix } from '../../../../../shared/utils'
import { CloseIcon, EyeIcon, TickIcon } from '../../../assets/icons'
import { useTabs } from '../../../../../shared/providers'
import {
   RecipeContext,
   reducers,
   state as initialState,
} from '../../../context/recipe'
import {
   CREATE_SIMPLE_RECIPE,
   PRODUCTS,
   S_RECIPE,
   S_SIMPLE_PRODUCTS_FROM_RECIPE_AGGREGATE,
   UPDATE_RECIPE,
} from '../../../graphql'
import {
   Information,
   Photo,
   Procedures,
   RecipeCard,
   Servings,
} from './components'
import validator from './validators'
import { ResponsiveFlex, StyledFlex } from '../RecipeForm/styled'
import { CloneIcon, PlusIcon } from '../../../../../shared/assets/icons'
import { useDnd } from '../../../../../shared/components/DragNDrop/useDnd'
import { CreateProductTunnel, LinkedProductsTunnel } from './tunnels'

const RecipeForm = () => {
   // Context
   const { setTabTitle, tab, addTab } = useTabs()
   const { initiatePriority } = useDnd()
   const { id: recipeId } = useParams()
   const [recipeState, recipeDispatch] = React.useReducer(
      reducers,
      initialState
   )

   const [productTunnels, openProductsTunnel, closeProductsTunnel] =
      useTunnel(1)
   const [
      linkedProductsTunnels,
      openLinkedProductsTunnel,
      closeLinkedProductsTunnel,
   ] = useTunnel(1)

   // States
   const [state, setState] = React.useState({})
   const [linkedProductsCount, setLinkedProductsCount] = React.useState(0)

   const [title, setTitle] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })

   // Subscription
   const { loading, error } = useSubscription(S_RECIPE, {
      variables: {
         id: recipeId,
      },
      onSubscriptionData: data => {
         const recipe = data.subscriptionData.data.simpleRecipe
         console.log(
            '🚀 ~ file: index.js ~ line 74 ~ RecipeForm ~ recipe',
            recipe
         )
         setState(recipe)
         setTitle({
            ...title,
            value: recipe.name,
         })
         if (recipe.simpleRecipeIngredients) {
            initiatePriority({
               tablename: 'simpleRecipe_ingredient_processing',
               schemaname: 'simpleRecipe',
               data: recipe.simpleRecipeIngredients,
            })
         }
      },
   })
   useSubscription(S_SIMPLE_PRODUCTS_FROM_RECIPE_AGGREGATE, {
      skip: !state.simpleRecipeYields,
      variables: {
         where: {
            simpleRecipeYieldId: {
               _in: state.simpleRecipeYields?.map(y => y.id),
            },
            isArchived: { _eq: false },
            product: {
               isArchived: { _eq: false },
            },
         },
         distinct_on: ['productId'],
      },
      onSubscriptionData: data => {
         setLinkedProductsCount(
            data.subscriptionData.data.productOptionsAggregate.aggregate.count
         )
      },
   })

   // Mutation
   const [createRecipe, { loading: cloning }] = useMutation(
      CREATE_SIMPLE_RECIPE,
      {
         onCompleted: input => {
            addTab(
               input.createSimpleRecipe.returning[0].name,
               `/products/recipes/${input.createSimpleRecipe.returning[0].id}`
            )
            toast.success('Recipe added!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )
   const [updateRecipe] = useMutation(UPDATE_RECIPE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   React.useEffect(() => {
      if (!tab && !loading && !isEmpty(title.value)) {
         addTab(title.value, `/products/recipes/${recipeId}`)
      }
   }, [tab, loading, title.value, addTab])

   // Handlers
   const updateName = async () => {
      const { isValid, errors } = validator.name(title.value)
      if (isValid) {
         const { data } = await updateRecipe({
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
         toast.error('Recipe should be valid!')
      } else {
         updateRecipe({
            variables: {
               id: state.id,
               set: {
                  isPublished: val,
               },
            },
         })
      }
   }
   const toggleSubRecipe = () => {
      const val = !state.isSubRecipe
      updateRecipe({
         variables: {
            id: state.id,
            set: {
               isSubRecipe: val,
            },
         },
      })
   }
   const clone = () => {
      if (cloning) return
      const clonedRecipe = {
         name: `${state.name}-${randomSuffix()}`,
         assets: state.assets,
         isPublished: state.isPublished,
         isSubRecipe: state.isSubRecipe,
         author: state.author,
         type: state.type,
         description: state.description,
         cookingTime: state.cookingTime,
         notIncluded: state.notIncluded,
         cuisine: state.cuisine,
         utensils: state.utensils,
         showIngredients: state.showIngredients,
         showIngredientsQuantity: state.showIngredientsQuantity,
         showProcedures: state.showProcedures,
      }
      const clonedRecipeYields = state.simpleRecipeYields.map(ry => ({
         yield: ry.yield,
      }))
      const clonedSimpleRecipeIngredients = state.simpleRecipeIngredients.map(
         ing => ({
            ingredientId: ing.ingredient.id,
            processingId: ing.processing.id,
            position: ing.position,
         })
      )
      const clonedInstructionSets = state.instructionSets.map(set => {
         const newSet = {
            position: set.position,
            title: set.title,
         }
         const newSteps = set.instructionSteps.map(step => ({
            position: step.position,
            description: step.description,
            isVisible: step.isVisible,
            title: step.title,
            assets: step.assets,
         }))
         newSet.instructionSteps = {
            data: newSteps,
         }
         return newSet
      })
      clonedRecipe.simpleRecipeYields = {
         data: clonedRecipeYields,
      }
      clonedRecipe.simpleRecipeIngredients = {
         data: clonedSimpleRecipeIngredients,
      }
      clonedRecipe.instructionSets = {
         data: clonedInstructionSets,
      }
      createRecipe({
         variables: {
            objects: clonedRecipe,
         },
      })
   }

   if (loading) return <InlineLoader />
   if (!loading && error) {
      toast.error('Failed to fetch Recipe!')
      logger(error)
      return <ErrorState />
   }

   return (
      <RecipeContext.Provider value={{ recipeState, recipeDispatch }}>
         <>
            {/* View */}
            <Tunnels tunnels={productTunnels}>
               <Tunnel layer={1}>
                  <CreateProductTunnel
                     state={state}
                     closeTunnel={closeProductsTunnel}
                  />
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={linkedProductsTunnels}>
               <Tunnel layer={1} size="sm">
                  <LinkedProductsTunnel
                     state={state}
                     closeTunnel={closeLinkedProductsTunnel}
                  />
               </Tunnel>
            </Tunnels>
            <Banner id="products-app-recipes-create-recipe-top" />
            <ResponsiveFlex
               container
               justifyContent="space-between"
               alignItems="center"
               padding="16px 0"
               maxWidth="1280px"
               width="calc(100vw - 64px)"
               margin="0 auto"
               style={{ borderBottom: '1px solid #f3f3f3' }}
            >
               <Flex 
                  container
                  as='header'
                  justifyContent='space-between'
                  width='100%'
                  style={{marginLeft:'4px'}}
               >  
               <Form.Group >
                  <Form.Text
                     id="title"
                     name="title"
                     value={title.value}
                     variant="revamp"
                     placeholder="Enter recipe title"
                     onChange={e =>
                        setTitle({ ...title, value: e.target.value })
                     }
                     onBlur={updateName}
                     hasError={!title.meta.isValid && title.meta.isTouched}
                     style={{width:'150%', textAlign:'left'}}
                  />
                  {title.meta.isTouched &&
                     !title.meta.isValid &&
                     title.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>            
               </Flex>
               </ResponsiveFlex>
               <ResponsiveFlex
                  container
                  alignItems="center"
                  padding="16px 0"
                  maxWidth="1280px"
                  width="calc(100vw - 64px)"
                  margin="0 auto"
                  style={{ borderBottom: '1px solid #f3f3f3' }}
               >
               <Flex 
                  container 
                  alignItems="center" 
                  height="100%"
                  style={{marginLeft:'4px'}} 
                  >
                  {state.isValid?.status ? (
                     <>
                        <TickIcon color="#00ff00" stroke={2} />
                        <Text as="p" style={{marginBottom:'0px '}}>All good!</Text>
                     </>
                  ) : (
                     <>
                        <CloseIcon color="#ff0000" />
                        <Text as="p" style={{marginBottom:'0px '}}>{state.isValid?.error}</Text>
                     </>
                  )}
                  <ComboButton
                     type="ghost"
                     size="sm"
                     onClick={() => openLinkedProductsTunnel(1)}
                  >
                     <EyeIcon color="#00A7E1" />
                     {`Linked Products (${linkedProductsCount})`}
                  </ComboButton>

                  <ComboButton
                     type="ghost"
                     size="sm"
                     onClick={() => openProductsTunnel(1)}
                  >
                     <PlusIcon color="#00A7E1" />
                     Create Product
                  </ComboButton>

                  <ComboButton
                     type="ghost"
                     size="sm"
                     onClick={clone}
                     isLoading={cloning}
                  >
                     <CloneIcon color="#00A7E1" />
                     Clone Recipe
                  </ComboButton>
                  <Form.Toggle
                     name="subRecipe"
                     value={state.isSubRecipe}
                     onChange={toggleSubRecipe}
                  >
                     {' '}
                     <Flex container alignItems="center" style={{position:'relative' ,right:'-22px'}}>
                        Sub Recipe
                        <Tooltip identifier="sub_publish" />
                     </Flex>
                  </Form.Toggle>

                  <Form.Toggle
                     name="published"
                     value={state.isPublished}
                     onChange={togglePublish}
                  >
                     <Flex container alignItems="center" style={{position:'relative' ,right:'-22px'}}>
                        Published
                        <Tooltip identifier="recipe_publish" />
                     </Flex>
                  </Form.Toggle>
               </Flex>
            
               </ResponsiveFlex>
            <Flex width="calc(100vw - 64px)" margin="0 auto" padding="32px 0">
               <HorizontalTabs>
                  <HorizontalTabList>
                     <HorizontalTab>Basic Details</HorizontalTab>
                     <HorizontalTab>Ingredients</HorizontalTab>
                     <HorizontalTab>Cooking Steps</HorizontalTab>
                     <HorizontalTab>Insights</HorizontalTab>
                  </HorizontalTabList>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        <Flex maxWidth="1280px" margin="0 auto" >
                           <StyledFlex container >
                              <Information state={state} />
                              <Spacer xAxis size="32px" />
                              <Photo state={state} />
                           </StyledFlex>
                        </Flex>
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Servings state={state} />
                        <Spacer size="32px" />
                        <Banner id="products-app-single-ingredient-ingredient-tab-bottom" />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Procedures state={state} />
                        <Banner id="products-app-single-ingredient-cooking-steps-tab-bottom" />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <InsightDashboard
                           appTitle="Products App"
                           moduleTitle="Recipe Page"
                           variables={{
                              recipeId,
                           }}
                           showInTunnel={false}
                        />
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            </Flex>
            <Banner id="products-app-recipes-create-recipe-bottom" />
         </>
      </RecipeContext.Provider>
   )
}

export default RecipeForm
