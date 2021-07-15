import React, { useEffect, useRef } from 'react'
import { useMutation, useSubscription, useLazyQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'

import {
   ButtonTile,
   Flex,
   Select,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
   PlusIcon,
   IconButton,
   ContextualMenu,
   Context,
   Form,
   Spacer,
   ComboButton,
   Dropdown,
   Popup,
} from '@dailykit/ui'

import {
   Serving,
   CalCount,
   FoodCost,
   Yield,
   ChefPay,
   VisibiltyOn,
   VisibiltyOff,
   AutoGenerate,
   NextArrow,
   PreviousArrow,
   PlusIconLarge,
} from '../../../../../assets/icons'
import { ExternalLink } from '../../../../../../../shared/assets/icons'
import { toast } from 'react-toastify'
import {
   StyledCardEven,
   Heading,
   StyledCardIngredient,
   SatchetCard,
   StyledButton,
} from './styles'
import {
   Tooltip,
   InlineLoader,
   DragNDrop,
   NutritionTunnel,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import {
   DELETE_SIMPLE_RECIPE_YIELD,
   S_PROCESSINGS,
   UPDATE_SIMPLE_RECIPE_INGREDIENT_PROCESSING,
   CREATE_PROCESSINGS,
   UPSERT_MASTER_PROCESSING,
   S_SACHETS,
   UPSERT_MASTER_UNIT,
   CREATE_SACHET,
   UPSERT_SIMPLE_RECIPE_YIELD_SACHET,
   UPDATE_SIMPLE_RECIPE_YIELD_SACHET,
   DELETE_SIMPLE_RECIPE_INGREDIENT_PROCESSINGS,
   DERIVE_SACHETS_FROM_BASE_YIELD,
   UPDATE_RECIPE,
   PROCESSINGS,
   SACHETS,
   UPDATE_NUTRITIONINFO,
} from '../../../../../graphql'
import { ServingsTunnel, IngredientsTunnel } from '../../tunnels'
import { RecipeContext } from '../../../../../context/recipe'
import { Nutrition } from '../../../../../../../shared/components'
import { Button } from 'react-scroll'
import { constant, stubFalse } from 'lodash'

const Servings = ({ state }) => {
   const { recipeState } = React.useContext(RecipeContext)

   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [ingredientsTunnel, openingredientTunnel, closeingredientTunnel] =
      useTunnel(2)
   const [nutritionTunnels, openNutritionTunnel, closeNutritionTunnel] =
      useTunnel(3)
   const [buttonClickRightRender, setButtonClickRightRender] =
      React.useState(false)
   const [buttonClickLeftRender, setButtonClickLeftRender] =
      React.useState(false)
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

   const [deleteYield] = useMutation(DELETE_SIMPLE_RECIPE_YIELD, {
      onCompleted: () => {
         toast.success('Deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handlers
   const remove = serving => {
      const confirmed = window.confirm(
         `Are you sure you want to delete serving - ${serving.yield.serving}?`
      )
      if (confirmed)
         deleteYield({
            variables: {
               id: serving.id,
            },
         })
   }

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
   const retryInfo = React.useRef(null)

   const [deriveSachetsFromBaseYield, { loading: generating, refetch }] =
      useLazyQuery(DERIVE_SACHETS_FROM_BASE_YIELD, {
         onCompleted: data => {
            const [response] = data.simpleRecipe_deriveIngredientSachets
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
                        sourceyieldid:
                           retryInfo.current.recipeYield.baseYieldId,
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
   const [showNutritionalInfo, setShowNutritionalInfo] = React.useState(false)
   const [selectedNutrition, setSelectedNutrition] = React.useState(null)
   const [selectedYieldId, setSelectedYieldId] = React.useState(null)

   const options =
      state.simpleRecipeYields?.map((option, index) => {
         console.log(option, 'option')
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
         return (
            <StyledCardEven
               baseYieldId={option.baseYieldId}
               key={index}
               index={index}
               id={option.id}
               nutritionIsInSync={option.nutritionIsInSync}
            >
               <Serving />
               <div id="Serving">{option.yield.serving}</div>
               {option.baseYieldId ? (
                  <div id="menu">
                     <IconButton
                        type="ghost"
                        size="sm"
                        onClick={() => autoGenerate(option)}
                        isLoading={
                           generating &&
                           option.id === retryInfo.current.recipeYield.id
                        }
                     >
                        <AutoGenerate />
                     </IconButton>
                  </div>
               ) : (
                  <></>
               )}
               <div id="menu">
                  <ContextualMenu position="left">
                     <Context
                        title="Delete"
                        handleClick={() => remove(option)}
                     ></Context>
                     {option.baseYieldId ? (
                        <Context>
                           <ComboButton
                              type="ghost"
                              size="sm"
                              onClick={() => autoGenerate(option)}
                              isLoading={
                                 generating &&
                                 option.id === retryInfo.current.recipeYield.id
                              }
                           >
                              <AutoGenerate />
                              <div style={{ color: '#202020' }}>
                                 Auto-generate
                              </div>
                           </ComboButton>
                        </Context>
                     ) : (
                        <></>
                     )}
                  </ContextualMenu>
               </div>

               <p> {option.yield.label} </p>
               <div
                  id="calCount"
                  onClick={() => {
                     setShowNutritionalInfo(!showNutritionalInfo)
                     if (option.nutritionalInfo) {
                        setSelectedNutrition(option.nutritionalInfo)
                     } else {
                        setSelectedNutrition(null)
                     }
                     setSelectedYieldId(option.id)
                  }}
               >
                  <CalCount />{' '}
                  {option.nutritionalInfo === null
                     ? 'N/A'
                     : option.nutritionalInfo.calories + ' cal'}
               </div>
               <div id="foodCost">
                  <FoodCost /> {option.cost}$
               </div>
               <div id="yield">
                  <Yield /> 2kg
               </div>
            </StyledCardEven>
         )
      }) || []

   const ingredientsOptions =
      state.simpleRecipeIngredients?.map((option, index) => {
         console.log(option, 'Adrish option')
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
         //console.log(option, 'option outside Processing')
         return (
            <div
               key={index}
               style={{
                  display: 'grid',
                  gridTemplateColumns: `238px repeat(${state.simpleRecipeYields?.length}, 160px)`,
                  gridTemplateRows: `170px`,
               }}
            >
               <StyledCardIngredient
                  buttonClickLeftRender={buttonClickLeftRender}
               >
                  <div id="ingredientName" style={{ display: 'inline-block' }}>
                     <Link
                        title={option.ingredient.name}
                        style={{
                           display: 'inline-block',
                           width: '156px',
                           height: '20px',
                           paddingTop: '2px',
                           whiteSpace: 'nowrap',
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           color: '#367BF5',
                        }}
                        to={`/products/ingredients/${option.ingredient.id}`}
                     >
                        {option.ingredient.name}
                     </Link>
                     <span>
                        <Link
                           to={`/products/ingredients/${option.ingredient.id}`}
                        >
                           <ExternalLink />
                        </Link>
                     </span>
                  </div>

                  <div id="menu">
                     <ContextualMenu position="left">
                        <Context
                           title="Delete"
                           handleClick={() =>
                              deleteIngredientProcessing(option.id)
                           }
                        ></Context>
                     </ContextualMenu>
                  </div>

                  <Spacer size="4px" />

                  <div id="dropdown">
                     <Processings state={state} option={option} />
                  </div>

                  <div id="calCountIngredient">
                     <CalCount /> 2% per saving
                  </div>
                  <div id="chefPay">
                     <ChefPay /> 2$
                  </div>
               </StyledCardIngredient>

               {state.simpleRecipeYields?.map((object, index) => {
                  // console.log(defaultSachetOption, 'Adrish defaultSachetOption')
                  //console.log(object, "sachet object")
                  let defaultSachetOption = {}
                  let defaultslipName = ''
                  let visibility = ''
                  let cost = null
                  let nutritionalInfo = {}
                  option.linkedSachets.map((item, index) => {
                     if (item.simpleRecipeYield.id == object.id) {
                        defaultslipName = item.slipName
                        visibility = item.isVisible
                        defaultSachetOption = {
                           id: item.ingredientSachet.id,
                           title: `${item.ingredientSachet.quantity} ${item.ingredientSachet.unit}`,
                        }
                        cost = item.ingredientSachet.cost
                        if (item.ingredientSachet.nutritionalInfo !== null) {
                           nutritionalInfo =
                              item.ingredientSachet.nutritionalInfo
                        }
                     }
                  })
                  return (
                     <React.Fragment key={index}>
                        <SatchetCard index={index}>
                           <Sachets
                              defaultslipName={defaultslipName}
                              object={object}
                              option={option}
                           />
                           <Spacer size="3px" />
                           <div id="sachetDetails">
                              <SachetDetails
                                 cost={cost}
                                 nutritionalInfo={nutritionalInfo}
                                 yieldId={object.id}
                                 ingredientProcessingRecordId={option.id}
                                 slipName={defaultslipName}
                                 isVisible={visibility}
                                 disabled={
                                    Object.keys(defaultSachetOption).length == 0
                                       ? true
                                       : false
                                 }
                                 index={index}
                              />
                           </div>
                        </SatchetCard>
                     </React.Fragment>
                  )
               })}
            </div>
         )
      }) || []
   const recipeForm = useRef(null)

   useEffect(() => {
      if (state.simpleRecipeYields?.length > 5) {
         setButtonClickRightRender(true)
      } else {
         setButtonClickRightRender(false)
         setButtonClickLeftRender(false)
      }
   }, [state.simpleRecipeYields, state.simpleRecipeYields?.length])

   let [buttonClickRight, setButtonClickRight] = React.useState(0)
   let [buttonClickLeft, setButtonClickLeft] = React.useState(0)

   const onButtonClickLeft = () => {
      setButtonClickLeft(++buttonClickLeft)
      recipeForm.current.scrollLeft -= 160
      if (buttonClickLeft > 0) {
         setButtonClickRightRender(true)
      }
      if (buttonClickLeft - buttonClickRight === 0) {
         setButtonClickLeftRender(false)
         setButtonClickRight(0)
         setButtonClickLeft(0)
      }
   }
   const onButtonClickRight = () => {
      setButtonClickRight(++buttonClickRight)

      recipeForm.current.scrollLeft += 160
      if (
         state.simpleRecipeYields.length -
            buttonClickRight +
            buttonClickLeft ===
         5
      ) {
         setButtonClickRightRender(false)
      }
      if (buttonClickRight > 0) {
         setButtonClickLeftRender(true)
      }
   }

   const [updateNutritionInfo] = useMutation(UPDATE_NUTRITIONINFO, {
      onCompleted: () => {
         toast.success('Nutrition updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const nutritionInfo = () => {
      updateNutritionInfo({
         variables: {
            simpleRecipeYieldIds: [selectedYieldId],
         },
      })
   }

   return (
      <>
         {/* {console.log(ingredientProcessings, 'Adrish Processings')} */}
         <>
            <Tunnels tunnels={tunnels}>
               <Tunnel layer={1} size="sm">
                  <ServingsTunnel state={state} closeTunnel={closeTunnel} />
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={ingredientsTunnel}>
               <Tunnel layer={1} size="sm">
                  <IngredientsTunnel
                     state={state}
                     closeTunnel={closeingredientTunnel}
                  />
               </Tunnel>
            </Tunnels>
            <Tunnels tunnels={nutritionTunnels}>
               <Tunnel layer={1} size="md">
                  <NutritionTunnel
                     tunnels={nutritionTunnels}
                     closeTunnel={closeNutritionTunnel}
                     onSave={value => {console.log(value)}}
                     value={{}}
                     perDynamic={true}
                  />
               </Tunnel>
            </Tunnels>
            <Popup
               show={showNutritionalInfo}
               clickOutsidePopup={() => setShowNutritionalInfo(false)}
            >
               <Popup.Actions>
                  <Popup.Text type="NutritionalInfo">
                     Nutritional Info
                     <ComboButton
                        type="ghost"
                        size="sm"
                        onClick={() => nutritionInfo()}
                     >
                        <AutoGenerate />
                        <div style={{ color: '#202020' }}>Sync</div>
                     </ComboButton>
                  </Popup.Text>
                  <ComboButton
                     type="ghost"
                     size="sm"
                     onClick={() => openNutritionTunnel(1)}
                  >
                     <PlusIcon />
                     <div style={{ color: '#202020' }}>Add Nutritional Info</div>
                  </ComboButton>
                  <Popup.Close
                     closePopup={() =>
                        setShowNutritionalInfo(!showNutritionalInfo)
                     }
                  />
               </Popup.Actions>
               <Popup.ConfirmText>
                  {selectedNutrition !== null ? (
                     <Nutrition data={selectedNutrition} />
                  ) : (
                     <>No Nutritional Info!</>
                  )}
               </Popup.ConfirmText>
            </Popup>

            <div
               style={{
                  display: 'grid',
                  gridTemplateColumns: `auto auto auto`,
               }}
            >
               <div></div>
               <div>
                  <div
                     style={{
                        padding: '18px 0px 12.5px 30px',
                        fontFamily: 'Roboto',
                        fontStyle: 'normal',
                        fontWeight: '500',
                        fontSize: '28px',
                        lineHeight: '36px',
                        letterSpacing: '0.32px',
                        color: '#202020',
                     }}
                  >
                     Servings & Ingredients
                     <Tooltip identifier="recipe_servings" />
                  </div>
                  <div
                     style={{
                        padding: '12.5px 0px 31px 30px',
                        display: 'inline-block',
                     }}
                  >
                     <Form.Toggle
                        name="showIngredients"
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
                        iconWithText
                        value={state.showIngredients}
                        size={48}
                     >
                        <div
                           style={{
                              fontFamily: 'Roboto',
                              fontStyle: 'normal',
                              fontWeight: '500',
                              fontSize: '16px',
                              lineHeight: '16px',
                              letterSpacing: '0.32px',
                              color: '#202020',
                           }}
                        >
                           Show Ingredients on Store
                        </div>
                     </Form.Toggle>
                  </div>

                  <div
                     style={{
                        padding: '12.5px 0px 31px 30px',
                        display: 'inline-block',
                        marginLeft: '434px',
                     }}
                  >
                     <Form.Toggle
                        name="showIngredientsQuantity"
                        onChange={() =>
                           updateRecipe({
                              variables: {
                                 id: state.id,
                                 set: {
                                    showIngredientsQuantity:
                                       !state.showIngredientsQuantity,
                                 },
                              },
                           })
                        }
                        iconWithText
                        value={state.showIngredientsQuantity}
                        size={48}
                     >
                        <div
                           style={{
                              fontFamily: 'Roboto',
                              fontStyle: 'normal',
                              fontWeight: '500',
                              fontSize: '16px',
                              lineHeight: '16px',
                              letterSpacing: '0.32px',
                              color: '#202020',
                           }}
                        >
                           Show Ingredient Quantity on Store
                        </div>
                     </Form.Toggle>
                  </div>

                  {options.length ? (
                     <div
                        style={{
                           display: 'grid',
                           gridTemplateColumns: '30px 1080px 30px',
                        }}
                     >
                        {buttonClickLeftRender ? (
                           <button
                              style={{
                                 width: '30px',
                                 height: '30px',
                                 border: 'none',
                                 background: '#FFFFFF',
                                 boxShadow: '-2px 2px 6px rgba(0, 0, 0, 0.15)',
                                 borderRadius: '50%',
                                 marginTop: '25px',
                              }}
                              onClick={onButtonClickLeft}
                           >
                              <PreviousArrow />
                           </button>
                        ) : (
                           <div></div>
                        )}

                        <div
                           ref={recipeForm}
                           style={{
                              overflow: 'auto',
                              whiteSpace: 'nowrap',
                              overflowY: 'hidden',
                              overflowX: 'hidden',
                              scrollBehavior: 'smooth',
                           }}
                        >
                           <div
                              style={{
                                 display: 'grid',
                                 gridTemplateColumns: `283px repeat(${state.simpleRecipeYields?.length}, 160px)`,
                              }}
                           >
                              <IconButton
                                 variant="secondary"
                                 onClick={() => {
                                    openTunnel(1)
                                 }}
                                 style={{
                                    width: '283px',
                                    height: '85px',
                                    marginTop: '0px',
                                    paddingTop: '0px',
                                    left: '0',
                                    position: 'sticky',
                                    zIndex: '+5',
                                    background: '#F4F4F4',
                                 }}
                                 type="solid"
                              >
                                 <PlusIconLarge />
                              </IconButton>

                              {options}
                           </div>
                           {
                              <>
                                 <Spacer size="40px" />
                                 <DragNDrop
                                    list={state.simpleRecipeIngredients}
                                    droppableId="simpleRecipeIngredientsDroppableId"
                                    tablename="simpleRecipe_ingredient_processing"
                                    schemaname="simpleRecipe"
                                    isDefaultDrag={false}
                                    customDragStyle={{
                                       left: '0',
                                       position: 'sticky',
                                       overflowX: 'hidden',
                                       zIndex: '+5',
                                       display: 'inline-block',
                                       width: '27px',
                                       height: '27px',
                                       borderRadius: '50%',
                                       background: '#f4f4f4',
                                       margin: '0px 18px 0px 0px',
                                       fontFamily: 'Roboto',
                                       fontStyle: 'normal',
                                       fontWeight: 'bold',
                                       fontSize: '12px',
                                       lineHeight: '16px',
                                       color: '#919699',
                                       letterSpacing: '0.32px',
                                       padding: '7px 0px 0px 0px',
                                       textAlign: 'center',
                                       cursor: 'move',
                                    }}
                                    componentHeight={130}
                                 >
                                    {ingredientsOptions}
                                 </DragNDrop>
                              </>
                           }

                           <ComboButton
                              style={{
                                 left: '0',
                                 position: 'sticky',
                                 width: '100%',
                                 display: 'flex',
                                 justifyContent: 'center',
                                 fontSize: 'large',
                              }}
                              type="ghost"
                              onClick={() => openingredientTunnel(1)}
                           >
                              <PlusIcon color="#367BF5" />
                              Add Ingredient
                           </ComboButton>
                        </div>
                        {buttonClickRightRender && (
                           <button
                              style={{
                                 width: '30px',
                                 height: '30px',
                                 border: 'none',
                                 background: '#FFFFFF',
                                 boxShadow: '-2px 2px 6px rgba(0, 0, 0, 0.15)',
                                 borderRadius: '50%',
                                 marginTop: '25px',
                              }}
                              onClick={onButtonClickRight}
                           >
                              <NextArrow />
                           </button>
                        )}
                     </div>
                  ) : (
                     <ComboButton
                        style={{
                           width: '100%',
                           display: 'flex',
                           justifyContent: 'center',
                        }}
                        type="ghost"
                        onClick={() => openTunnel(1)}
                     >
                        <PlusIcon color="#367BF5" />
                        Add Servings
                     </ComboButton>
                  )}
               </div>
               <div></div>
            </div>
         </>
      </>
   )
}

export default Servings

const SachetDetails = ({
   cost,
   nutritionalInfo,
   yieldId,
   slipName,
   ingredientProcessingRecordId,
   isVisible,
   disabled,
   index,
}) => {
   const [history, setHistory] = React.useState({
      slipName,
      isVisible,
   })
   const [showNutritionalInfoSachet, setShowNutritionalInfoSachet] =
      React.useState(false)
   const [selectedNutritionSachet, setSelectedNutritionSachet] =
      React.useState(null)
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
         <Popup
            show={showNutritionalInfoSachet}
            clickOutsidePopup={() => setShowNutritionalInfoSachet(false)}
         >
            <Popup.Actions>
               <Popup.Text type="NutritionalInfo">Nutritional Info</Popup.Text>
               <Popup.Close
                  closePopup={() =>
                     setShowNutritionalInfoSachet(!showNutritionalInfoSachet)
                  }
               />
            </Popup.Actions>
            <Popup.ConfirmText>
               {selectedNutritionSachet !== null ? (
                  <Nutrition data={selectedNutritionSachet} />
               ) : (
                  <>No Nutritional Info!</>
               )}
            </Popup.ConfirmText>
         </Popup>
         <div style={{ width: '150px' }}>
            <Form.Text
               id={`slipName-${yieldId}`}
               name={`slipName-${yieldId}`}
               onBlur={updateSlipName}
               onChange={e => setName(e.target.value)}
               variant="revamp-sm"
               value={name}
               placeholder="enter slip name"
               hasError={!name}
               disabled={disabled}
            />
         </div>
         <div style={{ display: 'inline-block', width: '130px' }}>
            <div
               style={{
                  display: 'inline-block',
                  minWidth: '36px',
                  height: '16px',
                  background: '#F6C338',
                  cursor: 'help',
                  borderRadius: '40px',
                  fontFamily: 'Roboto',
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  lineHeight: '16px',
                  margin: '0px 2px 0px 0px',
                  letterSpacing: '0.32px',
                  padding: '1px 5px 2.5px 5px',
                  color: '#FFFFFF',
               }}
               onClick={() => {
                  setShowNutritionalInfoSachet(!showNutritionalInfoSachet)
                  if (Object.keys(nutritionalInfo).length !== 0) {
                     setSelectedNutritionSachet(nutritionalInfo)
                  } else {
                     setSelectedNutritionSachet(null)
                  }
               }}
            >
               <CalCount />{' '}
               {Object.keys(nutritionalInfo).length === 0
                  ? 'N/A'
                  : `${nutritionalInfo.calories} cal`}
            </div>
            <div
               style={{
                  display: 'inline-block',
                  minWidth: '36px',
                  height: '16px',
                  background: '#8AC03B',
                  borderRadius: '40px',
                  fontFamily: 'Roboto',
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  lineHeight: '16px',
                  margin: '0px 0px 0px 2px',
                  letterSpacing: '0.32px',
                  padding: '1px 5px 2.5px 5px',
                  color: '#FFFFFF',
               }}
            >
               <FoodCost /> {cost === null ? 'N/A' : `${cost} $`}
            </div>
         </div>

         {disabled ? (
            <></>
         ) : visibility ? (
            <StyledButton
               index={index}
               onClick={() => updateVisibility(!visibility)}
            >
               <VisibiltyOn />
            </StyledButton>
         ) : (
            <StyledButton
               index={index}
               onClick={() => updateVisibility(!visibility)}
            >
               <VisibiltyOff />
            </StyledButton>
         )}
      </>
   )
}

const Processings = ({ state, option }) => {
   const [ProcessingOptions, setProcessingOptions] = React.useState([])
   const [ingredientProcessings, setIngredientProcessings] = React.useState([])
   const [ingredientStateId, setingredientStateId] = React.useState(0)
   let [search] = React.useState('')

   const [loadProcessing, { called, loading, data }] = useLazyQuery(
      PROCESSINGS,
      {
         variables: {
            where: {
               _and: [
                  { ingredientId: { _eq: ingredientStateId } },
                  { isArchived: { _eq: false } },
               ],
            },
         },
         onCompleted: data => {
            const processings = data.ingredientProcessings
            //console.log('inside processing loading')
            setIngredientProcessings(processings)
         },
         fetchPolicy: 'cache-and-network',
      }
   )
   //console.log(ingredientProcessings,"ingredientProcessings")
   const [upsertMasterProcessing] = useMutation(UPSERT_MASTER_PROCESSING, {
      onCompleted: data => {
         createProcessing({
            variables: {
               procs: [
                  {
                     ingredientId: ingredientStateId,
                     processingName:
                        data.createMasterProcessing.returning[0].name,
                  },
               ],
            },
         })
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [createProcessing] = useMutation(CREATE_PROCESSINGS, {
      onCompleted: data => {
         //console.log(data)
         const processing = {
            id: data.createIngredientProcessing.returning[0].id,
            title: data.createIngredientProcessing.returning[0].processingName,
         }
         // add(processing)
         loadProcessing()
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [updateSimpleRecipeIngredientProcessing] = useMutation(
      UPDATE_SIMPLE_RECIPE_INGREDIENT_PROCESSING,
      {
         onCompleted: () => {
            toast.success('Processing added!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   let dropDownReadOnly = true
   let optionsWithoutDescription = []
   if (option.processing == null) {
      dropDownReadOnly = false
   }
   const selectedOption = processing => {
      updateSimpleRecipeIngredientProcessing({
         variables: {
            id: option.id,
            _set: {
               processingId: processing.id,
               simpleRecipeId: state.id,
            },
         },
      })
   }
   const searchedOption = searchedProcessing => {
      search = searchedProcessing
      //console.log(search, 'Adrish Search')
   }

   const quickCreateProcessing = () => {
      let processingName =
         search.slice(0, 1).toUpperCase() + search.slice(1).toLowerCase()
      setingredientStateId(option.ingredient.id)

      //console.log(ingredientStateId, 'ingredientStateId')
      upsertMasterProcessing({
         variables: {
            name: processingName,
         },
      })
   }

   let defaultName = ''
   if (option.processing === null) {
      defaultName = ''
   } else {
      defaultName = option.processing.name
   }
   // console.log(option, 'option inside Processing')
   // console.log(defaultName, 'defaultName')
   return (
      <div style={{ width: '190px' }}>
         <Dropdown
            type="single"
            defaultName={defaultName}
            isLoading={loading}
            defaultOption={option.processing}
            addOption={quickCreateProcessing}
            options={ingredientProcessings}
            searchedOption={searchedOption}
            selectedOption={selectedOption}
            readOnly={dropDownReadOnly}
            handleClick={() => {
               setingredientStateId(option.ingredient.id)
               loadProcessing()
            }}
            typeName="processing"
         />
      </div>
   )
}

const Sachets = ({ defaultslipName, option, object }) => {
   const [upsertMasterUnit] = useMutation(UPSERT_MASTER_UNIT, {
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [createSachet] = useMutation(CREATE_SACHET, {
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const [upsertRecipeYieldSachet] = useMutation(
      UPSERT_SIMPLE_RECIPE_YIELD_SACHET,
      {
         onCompleted: () => {
            toast.success('Sachet added!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   let sachetDisabled = false
   const [sachets, setSachets] = React.useState([])

   const [loadSachets, { called, loading, data }] = useLazyQuery(SACHETS, {
      variables: {
         where: {
            _and: [
               { ingredientId: { _eq: option.ingredient.id } },
               { isArchived: { _eq: false } },
            ],
         },
      },
      onCompleted: data => {
         const updatedSachets = data.ingredientSachets.map(sachet => ({
            ...sachet,
            title: `${sachet.quantity} ${sachet.unit}`,
         }))

         setSachets([...updatedSachets])
      },
      fetchPolicy: 'cache-and-network',
   })
   let sachetOptions = []

   if (option.processing == null) {
      sachetDisabled = true
   }
   sachetOptions = []
   let search = ''
   let loader = false

   let defaultSachetOption = {}
   //console.log(object , "Adrish Ingredient options")
   option.linkedSachets.map((item, index) => {
      if (item.simpleRecipeYield.id == object.id) {
         loader = true
         defaultSachetOption = {
            id: item.ingredientSachet.id,
            title: `${item.ingredientSachet.quantity} ${item.ingredientSachet.unit}`,
         }
      }
   })

   const quickCreateSachet = async () => {
      if (!search.includes(' '))
         return toast.error('Quantity and Unit should be space separated!')
      const [quantity, unit] = search.toLowerCase().trim().split(' ')
      if (quantity && unit) {
         await upsertMasterUnit({
            variables: {
               name: unit,
            },
         })
         await createSachet({
            variables: {
               objects: [
                  {
                     ingredientId: option.ingredient.id,
                     ingredientProcessingId: option.processing.id,
                     quantity: +quantity,
                     unit,
                     tracking: false,
                  },
               ],
            },
         })
         await loadSachets()
      } else {
         toast.error('Enter a valid quantity and unit!')
      }
   }
   const selectedSachetOption = sachet => {
      upsertRecipeYieldSachet({
         variables: {
            yieldId: object.id,
            ingredientProcessingRecordId: option.id,
            ingredientSachetId: sachet.id,
            slipName:
               defaultslipName.length > 0
                  ? defaultslipName
                  : option.ingredient.name,
         },
      })
   }
   const searchedSachetOption = searchedSachet => {
      search = searchedSachet
   }

   return (
      <Dropdown
         disabled={sachetDisabled}
         options={sachets}
         defaultName={defaultSachetOption.title}
         addOption={quickCreateSachet}
         searchedOption={searchedSachetOption}
         isLoading={loading}
         selectedOption={selectedSachetOption}
         handleClick={() => {
            loadSachets()
         }}
         type="single"
         variant="revamp"
         typeName="sachet"
      />
   )
}
