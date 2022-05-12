import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ComboButton,
   Flex,
   Form,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabs,
   Spacer,
   Text,
   Dropdown,
} from '@dailykit/ui'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
   InsightDashboard,
} from '../../../../../shared/components'
import { useTabs } from '../../../../../shared/providers'
import { logger, randomSuffix } from '../../../../../shared/utils'
import { CloseIcon, TickIcon } from '../../../assets/icons'
import { ProductProvider } from '../../../context/product'
import { ModifiersProvider } from '../../../context/product/modifiers'
import {
   INSERT_PRODUCT_CATEGORY,
   OPTIONS_FROM_VEG_NONVEG,
   PRODUCT,
   PRODUCTS,
   PRODUCT_CATEGORIES,
} from '../../../graphql'
import { Assets, Description, Pricing } from './components'
import CustomizableProductComponents from './CustomizableProductComponents'
import ProductOptions from './ProductOptions'
import { ResponsiveFlex, StyledFlex } from './styled'
import validator from './validators'
import ComboProductComponents from './ComboProductComponents'
import { CloneIcon } from '../../../../../shared/assets/icons'
import { InventoryBundleProvider } from '../../../context/product/inventoryBundle'
import ProductInsight from './components/Insight'
import { MASTER } from '../../../../settings/graphql/index'
import { SEOSettings } from './components'
import { ProductSettings } from './ProductSettings'
const Product = () => {
   const { id: productId } = useParams()

   const { setTabTitle, tab, addTab } = useTabs()

   const [title, setTitle] = React.useState({
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [posist_baseItemId, setPosist_baseItemId] = React.useState({
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   // const [defaultProductOptionId, setDefaultProductOptionId] = React.useState({
   //    id: null
   // })
   const [state, setState] = React.useState({})
   const [dropDownOptions, setDropDownOptions] = React.useState([])
   const [subCategoryOptions, setSubCategoryOptions] = React.useState([])
   const [searchedCategoryOption, setSearchedCategoryOption] =
      React.useState('')
   const [searchedOptions, setSearchedOption] = React.useState(null)
   // Subscription
   const { loading, error } = useSubscription(PRODUCT.VIEW, {
      variables: {
         id: productId,
      },
      onSubscriptionData: data => {
         // console.log(data.subscriptionData.data)
         setState(data.subscriptionData.data.product)
         setTitle({
            ...title,
            value: data.subscriptionData.data.product.name,
         })
         setPosist_baseItemId({
            ...posist_baseItemId,
            value: data.subscriptionData.data.product.posist_baseItemId,
         })
         // setDefaultProductOptionId({
         //    ...defaultProductOptionId,
         //    id: data.subscriptionData.data.product.defaultProductOptionId,
         // })
      },
   })

   useSubscription(OPTIONS_FROM_VEG_NONVEG, {
      onSubscriptionData: data => {
         let newOptions = []
         data.subscriptionData.data.master_vegNonvegType.forEach(item => {
            newOptions = [
               ...newOptions,
               { id: Math.random(), title: item.label },
            ]
         })
         setDropDownOptions(newOptions)
      },
   })

   useSubscription(PRODUCT_CATEGORIES, {
      onSubscriptionData: ({ subscriptionData }) => {
         setSubCategoryOptions(
            subscriptionData.data.productCategories.map(
               (eachCategory, index) => ({
                  ...eachCategory,
                  id: index + 1,
                  title: eachCategory.name,
               })
            )
         )
      },
   })
   const [insertProductCategory] = useMutation(INSERT_PRODUCT_CATEGORY, {
      onCompleted: () => {
         toast.success('Product Category Added!')
      },
      onError: error => {
         toast.error('Failed to add product category')
         logger(error)
      },
   })
   // Mutation

   const [addType] = useMutation(MASTER.VEG_NONVEG.CREATE, {
      onCompleted: () => {
         toast.success('Type added')
      },
      onError: error => {
         toast.error('Failed to add vegNonVeg type')
         logger(error)
      },
   })

   const [createProduct, { loading: cloning }] = useMutation(PRODUCTS.CREATE, {
      onCompleted: data => {
         toast.success('Product cloned!')
         addTab(
            data.createProduct.name,
            `/products/products/${data.createProduct.id}`
         )
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [updateProduct] = useMutation(PRODUCT.UPDATE, {
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
         addTab(title.value, `/products/products/${productId}`)
      }
   }, [tab, addTab, loading, title.value])

   // Handlers
   const updateName = async () => {
      const { isValid, errors } = validator.name(title.value)
      if (isValid) {
         const { data } = await updateProduct({
            variables: {
               id: state.id,
               _set: {
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
   const updatePosist_baseItemId = async () => {
      const { isValid, errors } = validator.posist_baseItemId(
         posist_baseItemId.value
      )
      if (isValid) {
         const { data } = await updateProduct({
            variables: {
               id: state.id,
               _set: {
                  posist_baseItemId: posist_baseItemId.value,
               },
            },
         })
      }
      setPosist_baseItemId({
         ...posist_baseItemId,
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
         return toast.error('Product should be valid!')
      }
      return updateProduct({
         variables: {
            id: state.id,
            _set: {
               isPublished: val,
            },
         },
      })
   }
   const toggleAvailable = () => {
      const val = !state.isAvailable
      if (val && !state.isValid.status) {
         return toast.error('Product should be valid!')
      }
      return updateProduct({
         variables: {
            id: state.id,
            _set: {
               isAvailable: val,
            },
         },
      })
   }
   const togglePopup = () => {
      const val = !state.isPopupAllowed
      return updateProduct({
         variables: {
            id: state.id,
            _set: {
               isPopupAllowed: val,
            },
         },
      })
   }

   const renderOptions = () => {
      const { type } = state

      switch (type) {
         case 'simple': {
            return (
               <ProductOptions
                  productId={state.id}
                  productName={state.name}
                  options={state.productOptions || []}
                  productData={state}
               />
            )
         }
         case 'customizable': {
            return (
               <CustomizableProductComponents
                  productId={state.id}
                  options={state.customizableProductComponents || []}
               />
            )
         }
         case 'combo': {
            return (
               <ComboProductComponents
                  productId={state.id}
                  options={state.comboProductComponents || []}
               />
            )
         }
         default:
            return null
      }
   }

   const clone = () => {
      const generatedProductOptions = state.productOptions.map(op => ({
         position: op.position,
         type: op.type,
         label: op.label,
         price: op.price,
         discount: op.discount,
         quantity: op.quantity,
         simpleRecipeYieldId: op.simpleRecipeYield?.id || null,
         supplierItemId: op.supplierItem?.id || null,
         sachetItemId: op.sachetItem?.id || null,
         modifierId: op.modifier?.id || null,
         operationConfigId: op.operationConfig?.id || null,
      }))
      const object = {
         type: state.type,
         name: `${state.name}-${randomSuffix()}`,
         assets: state.assets,
         tags: state.tags,
         additionalText: state.additionalText,
         description: state.description,
         price: state.price,
         discount: state.discount,
         isPopupAllowed: state.isPopupAllowed,
         isPublished: state.isPublished,
         isAvailable: state.isAvailable,
         posist_baseItemId: state.posist_baseItemId,
         productOptions: {
            data: generatedProductOptions,
         },
      }
      createProduct({
         variables: {
            object,
         },
      })
   }

   if (loading) return <InlineLoader />
   if (!loading && error) {
      toast.error('Failed to fetch Product!')
      logger(error)
      return <ErrorState />
   }

   const searchOptions = option => {
      setSearchedOption(option)
   }
   const selectedOption = option => {
      updateProduct({
         variables: {
            id: state.id,
            _set: {
               VegNonVegType: option.title,
            },
         },
      })
   }

   const productCategorySelected = option => {
      updateProduct({
         variables: {
            id: state.id,
            _set: {
               subCategory: option.title,
            },
         },
      })
   }
   const productCategorySearch = text => {
      setSearchedCategoryOption(text)
   }
   const addProductCategory = () => {
      insertProductCategory({
         variables: {
            object: {
               name: searchedCategoryOption,
            },
         },
      })
   }
   const addDropDownOptions = () => {
      const object = {
         label: searchedOptions,
      }
      addType({
         variables: {
            object,
         },
      })
   }

   return (
      <ProductProvider>
         <ModifiersProvider>
            <InventoryBundleProvider>
               <Banner id="products-app-single-product-top" />

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
                     as="header"
                     justifyContent="space-between"
                     width="100%"
                     style={{ marginLeft: '4px' }}
                  >
                     <Form.Group>
                        <Form.Text
                           id="title"
                           name="title"
                           value={title.value}
                           variant="revamp"
                           placeholder="Enter product title"
                           onChange={e =>
                              setTitle({ ...title, value: e.target.value })
                           }
                           onBlur={updateName}
                           hasError={
                              !title.meta.isValid && title.meta.isTouched
                           }
                           style={{ width: '100%', textAlign: 'left' }}
                        />
                        {title.meta.isTouched &&
                           !title.meta.isValid &&
                           title.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Form.Group>
                     
                     <Flex container>
                     <Form.Toggle
                        name="published"
                        value={state.isPublished}
                        onChange={togglePublish}
                     >
                        <Flex
                           container
                           alignItems="center"
                           style={{ paddingRight: '0px' }}
                        >
                           Published
                           <Tooltip identifier="simple_recipe_product_publish" />
                        </Flex>
                     </Form.Toggle>
                     <Form.Toggle
                        name="available"
                        value={state.isAvailable}
                        onChange={toggleAvailable}
                     >
                        <Flex
                           container
                           alignItems="center"
                           style={{ paddingRight: '0px' }}
                        >
                           Availability
                           <Tooltip identifier="simple_recipe_product_publish" />
                        </Flex>
                     </Form.Toggle>
                     </Flex>
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
                  <Flex container alignItems="center" height="100%">
                     {state.isValid?.status ? (
                        <Flex container alignItems="center">
                           <TickIcon color="#00ff00" stroke={2} />
                           <Text as="p" style={{ marginBottom: '0' }}>
                              All good!
                           </Text>
                        </Flex>
                     ) : (
                        <Flex container alignItems="center">
                           <CloseIcon color="#ff0000" />
                           <Text as="p">{state.isValid?.error}</Text>
                        </Flex>
                     )}
                     <Spacer xAxis size="16px" />

                     <Form.Checkbox
                        name="popup"
                        value={state.isPopupAllowed}
                        onChange={togglePopup}
                     >
                        <Flex container alignItems="center">
                           Popup Allowed
                           <Tooltip identifier="simple_recipe_product_popup_checkbox" />
                        </Flex>
                     </Form.Checkbox>
                     {state.type === 'simple' && (
                        <>
                           <ComboButton
                              type="ghost"
                              size="sm"
                              onClick={clone}
                              isLoading={cloning}
                              style={{ padding: '7px 0px 7px 16px' }}
                           >
                              <CloneIcon color="#00A7E1" />
                              Clone Product
                           </ComboButton>
                        </>
                     )}
                  </Flex>
               </ResponsiveFlex>

               <Flex
                  as="main"
                  padding="8px 20px"
                  minHeight="calc(100vh - 130px)"
               >
                  <HorizontalTabs>
                     <HorizontalTabList>
                        <HorizontalTab>Basic Details</HorizontalTab>
                        <HorizontalTab>Options</HorizontalTab>
                        <HorizontalTab>Insights</HorizontalTab>
                        <HorizontalTab>SEO Tools</HorizontalTab>
                        <HorizontalTab>Product Settings</HorizontalTab>
                     </HorizontalTabList>
                     <HorizontalTabPanels>
                        <HorizontalTabPanel>
                           <StyledFlex
                              as="section"
                              container
                              alignItems="start"
                              justifyContent="space-between"
                           >
                              <Pricing state={state} />
                              <Spacer xAxis size="16px" />
                              <Assets state={state} />
                           </StyledFlex>
                           <Spacer size="32px" />
                           <Description state={state} />
                           <Form.Group>
                              <Form.Label
                                 htmlFor={`Posist_baseItemId-${state.id}`}
                                 title={`Posist_baseItemId-${state.id}`}
                              >
                                 Posist Base ItemId
                              </Form.Label>
                              <Form.Text
                                 id={`Posist_baseItemId-${state.id}`}
                                 name={`Posist_baseItemId-${state.id}`}
                                 value={posist_baseItemId.value}
                                 placeholder="Enter Product posist Base ItemId"
                                 onChange={e =>
                                    setPosist_baseItemId({
                                       ...posist_baseItemId,
                                       value: e.target.value,
                                    })
                                 }
                                 onBlur={updatePosist_baseItemId}
                                 hasError={
                                    !posist_baseItemId.meta.isValid &&
                                    posist_baseItemId.meta.isTouched
                                 }
                                 style={{ width: '50%' }}
                              />
                              {posist_baseItemId.meta.isTouched &&
                                 !posist_baseItemId.meta.isValid &&
                                 posist_baseItemId.meta.errors.map(
                                    (error, index) => (
                                       <Form.Error key={index}>
                                          {error}
                                       </Form.Error>
                                    )
                                 )}
                           </Form.Group>
                           <Spacer size="32px" yaxis />
                           <Form.Group>
                              <Form.Label>Type</Form.Label>
                              <Dropdown
                                 typeName="type"
                                 variant="revamp"
                                 defaultOption={dropDownOptions.find(
                                    eachOption =>
                                       eachOption.title === state.VegNonVegType
                                 )}
                                 options={dropDownOptions}
                                 addOption={addDropDownOptions}
                                 type="single"
                                 searchedOption={searchOptions}
                                 selectedOption={selectedOption}
                              />
                           </Form.Group>
                           <Spacer size="32px" />
                           <Form.Group>
                              <Form.Label>Sub Category</Form.Label>
                              <Dropdown
                                 typeName="type"
                                 variant="revamp"
                                 defaultOption={subCategoryOptions.find(
                                    eachOption =>
                                       eachOption.title === state.subCategory
                                 )}
                                 options={subCategoryOptions}
                                 addOption={addProductCategory}
                                 type="single"
                                 searchedOption={productCategorySearch}
                                 selectedOption={productCategorySelected}
                              />
                           </Form.Group>
                           <Spacer size="32px" yaxis />
                        </HorizontalTabPanel>
                        <HorizontalTabPanel>
                           {renderOptions()}
                           <Banner id="products-app-create-product-options-tab-bottom" />
                        </HorizontalTabPanel>
                        <HorizontalTabPanel>
                           <ProductInsight productId={productId} />
                           {/* <InsightDashboard
                              appTitle="Products App"
                              moduleTitle="Product Page"
                              variables={{
                                 productId,
                              }}
                              showInTunnel={false}
                           /> */}
                        </HorizontalTabPanel>
                        <HorizontalTabPanel>
                           <SEOSettings data={state} />
                        </HorizontalTabPanel>
                        <HorizontalTabPanel>
                           <ProductSettings />
                        </HorizontalTabPanel>
                     </HorizontalTabPanels>
                  </HorizontalTabs>
               </Flex>
               <Banner id="products-app-single-product-bottom" />
            </InventoryBundleProvider>
         </ModifiersProvider>
      </ProductProvider>
   )
}

export default Product
