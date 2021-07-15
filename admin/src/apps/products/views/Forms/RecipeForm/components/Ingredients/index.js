import React from 'react'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Collapsible,
   ComboButton,
   Flex,
   Form,
   IconButton,
   PlusIcon,
   Spacer,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { DragNDrop, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import {
   DeleteIcon,
   EditIcon,
   InfoIcon,
   UserIcon,
} from '../../../../../assets/icons'
import { RecipeContext } from '../../../../../context/recipe'
import {
   DELETE_SIMPLE_RECIPE_INGREDIENT_PROCESSINGS,
   DELETE_SIMPLE_RECIPE_YIELD_SACHETS,
   DERIVE_SACHETS_FROM_BASE_YIELD,
   UPDATE_RECIPE,
   UPDATE_SIMPLE_RECIPE_YIELD_SACHET,
} from '../../../../../graphql'
import {
   IngredientsTunnel,
   ProcessingsTunnel,
   SachetTunnel,
   YieldInfoTunnel,
} from '../../tunnels'
import validator from '../../validators'
import styled from 'styled-components'
import { RefreshIcon } from '../../../../../../../shared/assets/icons'

const Ingredients = ({ state }) => {
   console.log(state.simpleRecipeIngredients)
   const { recipeDispatch } = React.useContext(RecipeContext)

   const [tunnels, openTunnel, closeTunnel] = useTunnel(2)
   const [
      yieldInfoTunnels,
      openYieldInfoTunnel,
      closeYieldInfoTunnel,
   ] = useTunnel(1)

   // Mutation
   const [updateRecipe] = useMutation(UPDATE_RECIPE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [deleteSimpleRecipeIngredientProcessings] = useMutation(
      DELETE_SIMPLE_RECIPE_INGREDIENT_PROCESSINGS,
      {
         onCompleted: () => {
            toast.success('Ingredient deleted!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const deleteIngredientProcessing = id => {
      const isConfirmed = window.confirm(
         'Are you sure you want to delete this ingredient?'
      )
      if (isConfirmed) {
         // TODO: add a trigger in DB to set sachet_yield records' isArchived : false - not necessary tho
         deleteSimpleRecipeIngredientProcessings({
            variables: {
               ids: [id],
            },
         })
      }
   }

   const upsertSachet = (
      yieldId,
      ingredientProcessingRecordId,
      ingredientId,
      processingId
   ) => {
      console.log({
         yieldId,
         ingredientProcessingRecordId,
         ingredientId,
         processingId,
      })
      recipeDispatch({
         type: 'UPSERT_SACHET',
         payload: {
            yieldId,
            ingredientProcessingRecordId,
            ingredientId,
            processingId,
         },
      })
      openTunnel(3)
   }

   const StyledFlex = styled(Flex)`
      @media screen and (max-width: 767px) {
         flex-direction: column;
         align-items: flex-start;
      }
   `

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <IngredientsTunnel
                  closeTunnel={closeTunnel}
                  openTunnel={openTunnel}
                  state={state}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <ProcessingsTunnel state={state} closeTunnel={closeTunnel} />
            </Tunnel>
            <Tunnel layer={3}>
               <SachetTunnel closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={yieldInfoTunnels}>
            <Tunnel layer={1}>
               <YieldInfoTunnel close={closeYieldInfoTunnel} />
            </Tunnel>
         </Tunnels>
         <StyledFlex container alignItems="center" justifyContent="flex-end">
            <Flex container alignItems="center">
               <Form.Checkbox
                  name="showIngredients"
                  value={state.showIngredients}
                  onChange={() =>
                     updateRecipe({
                        variables: {
                           id: state.id,
                           set: {
                              showIngredients: !state.showIngredients,
                           },
                        },
                     })
                  }
               >
                  <Flex container alignItems="center">
                     Show Ingredients on Store
                     <Tooltip identifier="recipe_show_ingredients" />
                  </Flex>
               </Form.Checkbox>
               <Spacer xAxis size="16px" />
               <Form.Checkbox
                  name="showIngredientsQuantity"
                  value={state.showIngredientsQuantity}
                  onChange={() =>
                     updateRecipe({
                        variables: {
                           id: state.id,
                           set: {
                              showIngredientsQuantity: !state.showIngredientsQuantity,
                           },
                        },
                     })
                  }
               >
                  <Flex container alignItems="center">
                     Show Ingredient Quantity on Store
                     <Tooltip identifier="recipe_show_ingredients_quantity" />
                  </Flex>
               </Form.Checkbox>
            </Flex>
         </StyledFlex>
         <Spacer size="16px" />
         {!state.simpleRecipeYields?.length ? (
            <Text as="p">
               You have to add at least one serving before adding Ingredients.
            </Text>
         ) : (
            <>
               <DragNDrop
                  list={state.simpleRecipeIngredients}
                  droppableId="simpleRecipeIngredientsDroppableId"
                  tablename="simpleRecipe_ingredient_processing"
                  schemaname="simpleRecipe"
               >
                  {state.simpleRecipeIngredients.map(
                     ({ id, ingredient, processing, linkedSachets }) => (
                        <Collapsible
                           isDraggable
                           isHeadClickable
                           key={id}
                           head={
                              <CollapsibleHead
                                 ingredient={ingredient}
                                 processing={processing}
                                 deleteIngredient={() =>
                                    deleteIngredientProcessing(id)
                                 }
                              />
                           }
                           body={
                              <CollapsibleBody
                                 ingredientProcessingRecordId={id}
                                 linkedSachets={linkedSachets}
                                 simpleRecipeYields={state.simpleRecipeYields}
                                 upsertSachet={yieldId =>
                                    upsertSachet(
                                       yieldId,
                                       id,
                                       ingredient.id,
                                       processing.id
                                    )
                                 }
                              />
                           }
                        />
                     )
                  )}
               </DragNDrop>
               <Spacer size="16px" />
               <ButtonTile
                  type="secondary"
                  text="Add Ingredient"
                  onClick={() => openTunnel(1)}
               />
            </>
         )}
      </>
   )
}

export default Ingredients

const CollapsibleHead = ({ ingredient, processing, deleteIngredient }) => {
   console.log(processing, 'processing log')
   return (
      <Flex
         container
         alignItems="center"
         justifyContent="space-between"
         width="100%"
      >
         <Flex container alignItems="center">
            <Text as="h3" title={ingredient?.name || 'Ingredient'}>
               {ingredient?.name || 'N/A'}
            </Text>
            <Spacer xAxis size="16px" />
            <Text as="p" title={processing?.name || 'Processing'}>
               {processing?.name || 'N/A'}
            </Text>
         </Flex>
         <IconButton type="ghost" onClick={deleteIngredient}>
            <DeleteIcon color="#FF5A52" />
         </IconButton>
      </Flex>
   )
}

const CollapsibleBody = ({
   ingredientProcessingRecordId,
   linkedSachets,
   simpleRecipeYields,
   upsertSachet,
}) => {
   const retryInfo = React.useRef(null)

   const [
      deriveSachetsFromBaseYield,
      { loading: generating, refetch },
   ] = useLazyQuery(DERIVE_SACHETS_FROM_BASE_YIELD, {
      onCompleted: data => {
         const [response] = data.simpleRecipe_deriveIngredientSachets
         console.log({ response })
         if (response && response.success) {
            toast.success(response.message)
         } else {
            toast.warn('Something is not right!')
         }
      },
      onError: error => {
         retryInfo.current = {
            ...retryInfo.current,
            tries: 1 + retryInfo.current.tries,
         }
         if (
            error.message ===
               'GraphQL error: invalid input syntax for type json' &&
            retryInfo.current.tries < 15
         ) {
            console.log('Retrying...')
            refetch({
               variables: {
                  args: {
                     sourceyieldid: retryInfo.current.recipeYield.baseYieldId,
                     targetyieldid: retryInfo.current.recipeYield.id,
                  },
               },
            })
         } else {
            toast.error('Failed to generate sachets!')
            console.log(error)
         }
      },
      fetchPolicy: 'cache-and-network',
   })

   const autoGenerate = recipeYield => {
      console.log({ recipeYield })
      if (recipeYield.id && recipeYield.baseYieldId) {
         retryInfo.current = {
            recipeYield,
            tries: 1,
         }
         deriveSachetsFromBaseYield({
            variables: {
               args: {
                  sourceyieldid: recipeYield.baseYieldId,
                  targetyieldid: recipeYield.id,
               },
            },
         })
      }
   }

   const findSachet = recipeYield => {
      const found = linkedSachets.find(
         ({ simpleRecipeYield }) => simpleRecipeYield.id === recipeYield.id
      )
      return found
   }

   const renderSachet = recipeYield => {
      const sachetFound = findSachet(recipeYield)

      if (sachetFound) {
         return (
            <Flex container alignItems="center">
               <Text as="title">
                  {`${sachetFound.ingredientSachet.quantity} ${sachetFound.ingredientSachet.unit}`}
               </Text>
               <Spacer xAxis size="16px" />
               <IconButton
                  type="ghost"
                  onClick={() => upsertSachet(recipeYield.id)}
               >
                  <EditIcon color="#00A7E1" />
               </IconButton>
            </Flex>
         )
      }

      return (
         <IconButton type="ghost" onClick={() => upsertSachet(recipeYield.id)}>
            <PlusIcon color="#00A7E1" />
         </IconButton>
      )
   }

   const renderRight = recipeYield => {
      const foundSachet = findSachet(recipeYield)

      if (foundSachet)
         return (
            <SachetDetails
               yieldId={recipeYield.id}
               ingredientProcessingRecordId={ingredientProcessingRecordId}
               slipName={foundSachet.slipName}
               isVisible={foundSachet.isVisible}
            />
         )
      if (recipeYield.baseYieldId) {
         return (
            <ComboButton
               type="ghost"
               size="sm"
               onClick={() => autoGenerate(recipeYield)}
               isLoading={
                  generating &&
                  recipeYield.id === retryInfo.current.recipeYield.id
               }
            >
               <RefreshIcon color="#00A7E1" size={16} />
               Auto-generate
            </ComboButton>
         )
      }

      return null
   }

   return (
      <>
         {simpleRecipeYields.map(recipeYield => (
            <Flex container margin="8px 0 0 0" alignItems="center">
               <Flex>
                  <Text as="subtitle"> Serving </Text>
                  <Text as="title"> {recipeYield.yield.serving} </Text>
               </Flex>
               <Spacer xAxis size="32px" />
               <Flex>
                  <Text as="subtitle"> Label </Text>
                  <Text as="title"> {recipeYield.yield.label || '-'} </Text>
               </Flex>
               <Spacer xAxis size="32px" />
               <Flex>
                  <Text as="subtitle"> Sachet </Text>
                  <Text as="title"> {renderSachet(recipeYield)} </Text>
               </Flex>
               <Spacer xAxis size="32px" />
               {renderRight(recipeYield)}
            </Flex>
         ))}
      </>
   )
}

const SachetDetails = ({
   yieldId,
   slipName,
   isVisible,
   ingredientProcessingRecordId,
}) => {
   const [history, setHistory] = React.useState({
      slipName,
      isVisible,
   })
   const [name, setName] = React.useState(slipName)
   const [visibility, setVisibility] = React.useState(isVisible)

   React.useEffect(() => {
      setHistory({
         slipName,
         isVisible,
      })
      setName(slipName)
      setVisibility(isVisible)
   }, [slipName, isVisible])

   // Mutation
   const [updateSachet] = useMutation(UPDATE_SIMPLE_RECIPE_YIELD_SACHET, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         setName(history.slipName)
         setVisibility(history.isVisible)
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const updateSlipName = () => {
      if (!name) {
         return toast.error('Slip name is required!')
      }
      updateSachet({
         variables: {
            ingredientProcessingRecordId,
            yieldId,
            set: {
               slipName: name,
            },
         },
      })
   }

   const updateVisibility = val => {
      setVisibility(val)
      updateSachet({
         variables: {
            ingredientProcessingRecordId,
            yieldId,
            set: {
               isVisible: val,
            },
         },
      })
   }

   return (
      <>
         <Flex>
            <Text as="subtitle"> Slip Name </Text>
            <Form.Text
               id={`slipName-${yieldId}`}
               name={`slipName-${yieldId}`}
               onBlur={updateSlipName}
               onChange={e => setName(e.target.value)}
               value={name}
               placeholder="Enter slip name"
               hasError={!name}
            />
         </Flex>
         <Spacer xAxis size="32px" />
         <Flex>
            <Text as="subtitle"> Visibility </Text>
            <Form.Toggle
               id={`isVisible=${yieldId}`}
               name={`isVisible=${yieldId}`}
               onChange={() => updateVisibility(!visibility)}
               value={visibility}
            />
         </Flex>
      </>
   )
}
