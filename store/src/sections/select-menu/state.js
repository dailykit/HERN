import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { isEmpty, indexOf } from 'lodash'
import { useRouter } from 'next/router'
import { useToasts } from 'react-toast-notifications'
import {
   useMutation,
   useQuery,
   useSubscription,
   useApolloClient,
} from '@apollo/react-hooks'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { PageLoader } from '../../components'
import {
   ZIPCODE,
   MUTATIONS,
   CART_BY_WEEK,
   INSERT_CART_ITEM,
   DELETE_CART_ITEM,
   OCCURENCES_BY_SUBSCRIPTION,
   CART_BY_WEEK_SUBSCRIPTION,
   GET_BRAND_LOCATION,
} from '../../graphql'
import { getRoute, isClient } from '../../utils'

const ReactPixel = isClient ? require('react-facebook-pixel').default : null

export const MenuContext = React.createContext()

const initialState = {
   week: {},
   isOccurencesLoading: true,
   occurences: [],
   isCartFull: false,
   cartState: 'IDLE',
   totalProductsInCart: 0,
   productsAddedInCart: [],
}

const reducers = (state, { type, payload }) => {
   switch (type) {
      case 'SET_WEEK': {
         return {
            ...state,
            week: payload,
            cartState: 'IDLE',
         }
      }
      case 'SET_IS_OCCURENCES_LOADING':
         return { ...state, isOccurencesLoading: payload }
      case 'IS_CART_FULL':
         return { ...state, isCartFull: payload }
      case 'CART_STATE':
         return {
            ...state,
            cartState: payload,
         }
      case 'SET_OCCURENCES':
         return {
            ...state,
            occurences: payload,
         }
      case 'PRODUCT_ADDED':
         return { ...state, totalProductsInCart: payload }

      case 'PRODUCT_DELETED':
         return { ...state, totalProductsInCart: payload }
      case 'PRODUCT_CART_LENGTH':
         return { ...state, totalProductsInCart: payload }
      case 'OCCURENCE_CUSTOMER':
         return { ...state, productsAddedInCart: payload }
      default:
         return state
   }
}

const evalTime = (date, time) => {
   const [hour, minute] = time.split(':')
   return moment(date).hour(hour).minute(minute).second(0).toISOString()
}

const insertCartId = (node, cartId) => {
   if (node.childs.data.length > 0) {
      node.childs.data = node.childs.data.map(item => {
         if (item.childs.data.length > 0) {
            item.childs.data = item.childs.data.map(item => ({
               ...item,
               cartId,
            }))
         }
         return { ...item, cartId }
      })
   }
   node.cartId = cartId

   return node
}

export const MenuProvider = ({ isCheckout = false, children }) => {
   const router = useRouter()
   const { user } = useUser()
   const { addToast } = useToasts()
   const { t } = useTranslation()
   const { brand, configOf } = useConfig()
   const [cart, setCart] = React.useState({})
   const [fulfillment, setFulfillment] = React.useState({})
   const [isCustomerLoading, setIsCustomerLoading] = React.useState(true)
   const [
      isCartValidByProductAvailability,
      setIsCartValidByProductAvailability,
   ] = React.useState(false)
   const [state, dispatch] = React.useReducer(reducers, initialState)
   const apolloClient = useApolloClient()
   const [locationId, setLocationId] = useState(null)
   const [brandLocation, setBrandLocation] = useState(null)
   const [productsAddedInCart, setProductsAddedInCart] = useState([])

   const { loading: loadingZipcode, data: { zipcode = {} } = {} } =
      useSubscription(ZIPCODE, {
         skip:
            !user?.subscriptionId ||
            !user?.defaultAddress?.zipcode ||
            !state.week?.id,
         variables: {
            subscriptionId: user?.subscriptionId,
            zipcode: user?.defaultAddress?.zipcode,
         },
      })

   useEffect(() => {
      if (zipcode?.locationId) {
         apolloClient
            .query({
               query: GET_BRAND_LOCATION,
               variables: {
                  where: {
                     brandId: {
                        _eq: brand?.id,
                     },
                     locationId: {
                        _eq: zipcode.locationId,
                     },
                  },
               },
            })
            .then(data => {
               data = data.data
               if (data && data.brandLocations.length > 0) {
                  setLocationId(zipcode.locationId)
                  setBrandLocation(data.brandLocations[0])
               }
            })
      }
   }, [zipcode, loadingZipcode, brand?.id])

   const argsForByLocation = React.useMemo(
      () => ({
         brandId: brand?.id,
         locationId: locationId,
         brand_locationId: brandLocation?.id,
      }),
      [brand, locationId, brandLocation?.id]
   )
   const {
      error: occurenceCustomerError,
      loading: occurenceCustomerLoading,
      data: { subscriptionOccurenceCustomer: occurenceCustomer = {} } = {},
      subscribeToMore,
   } = useQuery(CART_BY_WEEK, {
      skip:
         !state.week.id ||
         !user.keycloakId ||
         !user.brandCustomerId ||
         !brand?.id ||
         !locationId ||
         !brandLocation?.id,
      variables: {
         weekId: state.week.id,
         keycloakId: user?.keycloakId,
         brand_customerId: user?.brandCustomerId,
         params: argsForByLocation,
      },
      onCompleted: data => {
         dispatch({
            type: 'IS_CART_FULL',
            payload: false,
         })
         setIsCustomerLoading(false)
      },
      onError: error => {
         console.error('error in query cart_by_week', error)
      },
   })
   // check availability of product in cart
   React.useEffect(() => {
      if (occurenceCustomer?.cart?.products) {
         for (let node of occurenceCustomer.cart.products) {
            let isCartValid = true
            const selectedProductOption = node.product.productOptions.find(
               option => option.id === node.childs[0]?.productOption?.id
            )
            if (!isEmpty(selectedProductOption)) {
               isCartValid =
                  node.product.isAvailable &&
                  node.product.isPublished &&
                  !node.product.isArchived &&
                  selectedProductOption.isAvailable &&
                  selectedProductOption.isPublished &&
                  !selectedProductOption.isArchived
            } else {
               isCartValid =
                  node.product.isAvailable &&
                  node.product.isPublished &&
                  !node.product.isArchived
            }

            if (!isCartValid) {
               setIsCartValidByProductAvailability(false)
               return
            }
            if (
               indexOf(occurenceCustomer.cart.products, node) ===
               occurenceCustomer.cart.products.length - 1
            ) {
               if (isCartValid) {
                  setIsCartValidByProductAvailability(true)
               }
            }
         }
      }
   }, [occurenceCustomer?.cart?.products])

   React.useEffect(() => {
      if (
         !isCustomerLoading &&
         user?.brandCustomerId &&
         state.week.id &&
         user?.brandCustomerId
      ) {
         subscribeToMore({
            document: CART_BY_WEEK_SUBSCRIPTION,
            variables: {
               weekId: state.week.id,
               keycloakId: user?.keycloakId,
               brand_customerId: user?.brandCustomerId,
               params: argsForByLocation,
            },
            onError: error => {
               console.error('Error in subscribeToMore: ', error)
            },
            updateQuery: (prev, { subscriptionData }) => {
               if (!subscriptionData.data) {
                  return prev
               }
               return JSON.parse(JSON.stringify(subscriptionData.data))
            },
         })
      }
   }, [
      isCustomerLoading,
      state.week.id,
      user?.keycloakId,
      user?.brandCustomerId,
      brand?.id,
      locationId,
      brandLocation?.id,
   ])
   React.useEffect(() => {
      const productsWithoutAddon = occurenceCustomer?.cart?.products.filter(
         product => product.isAddOn === false
      )
      dispatch({
         type: 'PRODUCT_CART_LENGTH',
         payload: productsWithoutAddon?.length || 0,
      })
      dispatch({
         type: 'OCCURENCE_CUSTOMER',
         payload: occurenceCustomer?.cart?.products,
      })

      setProductsAddedInCart(occurenceCustomer?.cart?.products)
   }, [occurenceCustomer?.cart?.products])

   useEffect(() => {
      dispatch({
         type: 'OCCURENCE_CUSTOMER',
         payload: productsAddedInCart,
      })
   }, [productsAddedInCart])

   if (!occurenceCustomerLoading && occurenceCustomerError) {
      setIsCustomerLoading(false)
      addToast(t('Failed to fetch week details'), {
         appearance: 'error',
      })
   }

   const [updateOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.UPDATE,
      {
         onError: error =>
            console.error('updateOccurenceCustomer => error =>', error),
      }
   )

   const [createCart] = useMutation(MUTATIONS.CART.CREATE, {
      onError: error => console.error('createCart => error =>', error),
   })
   const [insertCartItem] = useMutation(INSERT_CART_ITEM, {
      onCompleted: () => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
         dispatch({
            type: 'PRODUCT_ADDED',
            payload: state.totalProductsInCart + 1,
         })
      },
      onError: error => console.error('insertCartItem => error =>', error),
   })
   const [deleteCartItem] = useMutation(DELETE_CART_ITEM, {
      onCompleted: () => {
         dispatch({ type: 'CART_STATE', payload: 'SAVED' })
         dispatch({
            type: 'PRODUCT_DELETED',
            payload: state.totalProductsInCart - 1,
         })
      },
      onError: error => console.error('deleteCartItem => error =>', error),
   })

   //query

   React.useEffect(() => {
      if (!loadingZipcode && !isEmpty(zipcode) && state.week?.fulfillmentDate) {
         if (
            zipcode.isDeliveryActive &&
            zipcode?.deliveryTime?.from &&
            zipcode?.deliveryTime?.to
         ) {
            setFulfillment({
               type: 'PREORDER_DELIVERY',
               slot: {
                  from: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.deliveryTime?.from
                  ),
                  to: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.deliveryTime?.to
                  ),
               },
            })
         } else if (
            zipcode.isPickupActive &&
            zipcode.pickupOptionId &&
            zipcode?.pickupOption?.time?.from &&
            zipcode?.pickupOption?.time?.to
         ) {
            setFulfillment({
               type: 'PREORDER_PICKUP',
               slot: {
                  from: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.pickupOption?.time?.from
                  ),
                  to: evalTime(
                     state.week.fulfillmentDate,
                     zipcode?.pickupOption?.time?.to
                  ),
               },
               address: zipcode?.pickupOption?.address,
            })
         }
      }
   }, [loadingZipcode, zipcode, state.week])

   const [insertOccurenceCustomer] = useMutation(
      MUTATIONS.OCCURENCE.CUSTOMER.CREATE.ONE,
      {
         skip:
            state.isOccurencesLoading ||
            occurenceCustomerLoading ||
            !state?.week?.id,
         onError: error => console.error(error),
      }
   )
   useQuery(OCCURENCES_BY_SUBSCRIPTION, {
      skip: !user?.subscriptionId,
      variables: {
         id: user?.subscriptionId,
         where: {
            isValid: { _eq: true },
            isVisible: { _eq: true },
            // subscriptionOccurenceView: {
            // },
            ...(Boolean(router.query.date) && {
               fulfillmentDate: {
                  _eq: router.query.date,
               },
            }),
         },
         where1: { keycloakId: { _eq: user?.keycloakId } },
      },
      onCompleted: ({ subscription = {} } = {}) => {
         if (subscription?.occurences?.length > 0) {
            const d = router.query.d
            const date = router.query.date
            let validWeekIndex = 0
            if (d !== undefined && d !== null) {
               validWeekIndex = subscription?.occurences.findIndex(
                  node => node.fulfillmentDate === d
               )
            } else if (isCheckout && date !== undefined && date !== null) {
               validWeekIndex = subscription?.occurences.findIndex(
                  node => node.fulfillmentDate === date
               )
            } else {
               validWeekIndex = subscription?.occurences.findIndex(node => {
                  const { customers = [] } = node
                  if (customers.length === 0) return false
                  return customers.every(
                     ({ itemCountValid }) => !itemCountValid
                  )
               })
            }

            if (validWeekIndex === -1) {
               dispatch({
                  type: 'SET_WEEK',
                  payload: subscription?.occurences[0],
               })
               if (!isCheckout) {
                  const queryDate =
                     d || new URL(location.href).searchParams.get('d')
                  if (!queryDate) {
                     router.push(
                        getRoute(
                           '/menu?d=' +
                              subscription?.occurences[0].fulfillmentDate
                        )
                     )
                  }
               }
            } else {
               dispatch({
                  type: 'SET_WEEK',
                  payload: subscription?.occurences[validWeekIndex],
               })
               if (!isCheckout) {
                  const queryDate = new URL(location.href).searchParams.get('d')
                  if (!queryDate) {
                     router.push(
                        getRoute(
                           '/menu?d=' +
                              subscription?.occurences[validWeekIndex]
                                 .fulfillmentDate
                        )
                     )
                  }
               }
            }
            dispatch({ type: 'SET_IS_OCCURENCES_LOADING', payload: false })
            dispatch({
               type: 'SET_OCCURENCES',
               payload: subscription?.occurences,
            })
         } else if (
            subscription?.occurences?.length === 0 &&
            user?.subscriptionId
         ) {
            addToast(t('No weeks are available for menu selection.'), {
               appearance: 'error',
            })
         }
      },
      onError: error => {
         addToast(error.message, {
            appearance: 'error',
         })
      },
   })

   React.useEffect(() => {
      if (
         !isCustomerLoading &&
         !state.isOccurencesLoading &&
         !occurenceCustomerLoading &&
         state.week?.id
      ) {
         if (!locationId || !brandLocation?.id) return
         if (isEmpty(occurenceCustomer)) {
            insertOccurenceCustomer({
               variables: {
                  object: {
                     isAuto: false,
                     keycloakId: user.keycloakId,
                     isSkipped: !state.week.isValid,
                     subscriptionOccurenceId: state.week.id,
                     brand_customerId: user.brandCustomerId,
                  },
               },
            })
         } else {
            setCart(occurenceCustomer)
         }
      }
   }, [
      isCustomerLoading,
      state.isOccurencesLoading,
      occurenceCustomerLoading,
      state.week,
      occurenceCustomer,
   ])

   const removeProduct = item => {
      dispatch({ type: 'CART_STATE', payload: 'SAVING' })
      deleteCartItem({
         variables: { id: item.id },
      }).then(() => {
         addToast(`You've removed the product - ${item.name}.`, {
            appearance: 'info',
         })
         setProductsAddedInCart(
            productsAddedInCart.filter(product => product.id != item.id)
         )
         // fb pixel custom event for removing product from cart
         ReactPixel.trackCustom('removeFromCart', item)
      })
   }

   const store = configOf(
      'Store Availability',
      'availability'
   )?.storeAvailability
   const addProduct = (item, product) => {
      dispatch({ type: 'CART_STATE', payload: 'SAVING' })

      const isSkipped = occurenceCustomer?.isSkipped
      if (occurenceCustomer?.validStatus?.hasCart) {
         const cart = insertCartId(item, occurenceCustomer?.cart?.id)
         insertCartItem({
            variables: { object: cart },
            optimisticResponse: {
               __typename: 'Mutation',
               createCartItem: {
                  __typename: 'order_cartItem',
                  id: moment(),
                  name: product.name || 'Adding product...',
                  image: product.assets?.images?.length
                     ? product.assets.images[0]
                     : '',
                  isAddOn: false,
                  unitPrice: item.unitPrice,
                  addOnLabel: item.addOnLabel,
                  addOnPrice: item.addOnPrice,
                  isAutoAdded: false,
                  subscriptionOccurenceProductId:
                     item.subscriptionOccurenceProductId,
                  subscriptionOccurenceAddOnProductId:
                     item.subscriptionOccurenceAddOnProductId || null,
               },
            },
            update: (cache, { data: { createCartItem } }) => {
               if (createCartItem.cartId) {
                  setProductsAddedInCart(prevArray => [
                     ...prevArray,
                     createCartItem,
                  ])
               }
               const data = cache.readQuery({
                  query: CART_BY_WEEK,
                  variables: {
                     weekId: state.week.id,
                     keycloakId: user?.keycloakId,
                     brand_customerId: user?.brandCustomerId,
                  },
               })

               const cloneData = JSON.parse(JSON.stringify(data))

               const updatedData = {
                  ...cloneData,
                  subscriptionOccurenceCustomer: {
                     ...cloneData.subscriptionOccurenceCustomer,
                     validStatus: {
                        addedProductsCount:
                           cloneData.subscriptionOccurenceCustomer.validStatus
                              .addedProductsCount + 1,
                        hasCart: true,
                        itemCountValid:
                           cloneData.subscriptionOccurenceCustomer.validStatus
                              .pendingProductsCount === 1,
                        itemCountValidComment: 'Loading...',
                        pendingProductsCount:
                           cloneData.subscriptionOccurenceCustomer.validStatus
                              .pendingProductsCount - 1,
                     },
                     cart: {
                        ...cloneData.subscriptionOccurenceCustomer.cart,
                        products: [
                           ...cloneData.subscriptionOccurenceCustomer.cart
                              .products,
                           JSON.parse(JSON.stringify(createCartItem)),
                        ],
                     },
                  },
               }

               cache.writeQuery({
                  query: CART_BY_WEEK,
                  variables: {
                     weekId: state.week.id,
                     keycloakId: user?.keycloakId,
                     brand_customerId: user?.brandCustomerId,
                  },
                  data: updatedData,
                  broadcast: true,
               })
            },
         })
            .then(({ data: { createCartItem = {} } = {} } = {}) => {
               addToast(t(`Successfully added the product.`), {
                  appearance: 'info',
               })

               updateOccurenceCustomer({
                  variables: {
                     pk_columns: {
                        keycloakId: user.keycloakId,
                        subscriptionOccurenceId: state.week.id,
                        brand_customerId: user.brandCustomerId,
                     },
                     _set: {
                        isSkipped: false,
                        cartId: createCartItem?.cartId,
                     },
                  },
               }).then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
                  if (!item?.isAddOn) {
                     dispatch({
                        type: 'IS_CART_FULL',
                        payload:
                           updateOccurenceCustomer?.validStatus?.itemCountValid,
                     })
                  }
                  if (updateOccurenceCustomer?.isSkipped !== isSkipped) {
                     if (!updateOccurenceCustomer?.isSkipped) {
                        addToast(t('This week has been unskipped.'), {
                           appearance: 'info',
                        })
                     }
                  }
               })
            })
            .catch(error =>
               console.error('addProduct -> insertCartItem ->', error)
            )
      } else {
         const customerInfo = {
            customerEmail: user?.platform_customer?.email || '',
            customerPhone: user?.platform_customer?.phoneNumber || '',
            customerLastName: user?.platform_customer?.lastName || '',
            customerFirstName: user?.platform_customer?.firstName || '',
         }
         createCart({
            variables: {
               object: {
                  customerInfo,
                  brandId: brand.id,
                  status: 'CART_PENDING',
                  customerId: user.id,
                  source: 'subscription',
                  paymentStatus: 'PENDING',
                  address: user.defaultAddress,
                  locationId: zipcode?.locationId,
                  fulfillmentInfo: fulfillment,
                  customerKeycloakId: user.keycloakId,
                  subscriptionOccurenceId: state.week.id,
                  isTest: user?.isTest || !store?.isStoreLive?.value,
                  ...(user?.subscriptionPaymentMethodId && {
                     paymentMethodId: user?.subscriptionPaymentMethodId,
                  }),
                  paymentCustomerId: user?.platform_customer?.paymentCustomerId,
               },
            },
            optimisticResponse: {
               __typename: 'Mutation',
               createCartItem: {
                  __typename: 'order_cartItem',
                  id: moment(),
                  name: product.name || 'Adding product...',
                  image: product.assets?.images?.length
                     ? product.assets.images[0]
                     : '',
                  isAddOn: false,
                  unitPrice: item.unitPrice,
                  addOnLabel: item.addOnLabel,
                  addOnPrice: item.addOnPrice,
                  isAutoAdded: false,
                  subscriptionOccurenceProductId:
                     item.subscriptionOccurenceProductId,
                  subscriptionOccurenceAddOnProductId:
                     item.subscriptionOccurenceAddOnProductId || null,
               },
            },
            update: (cache, { data: { createCartItem } }) => {
               if (createCartItem.cartId) {
                  setProductsAddedInCart(prevArray => [
                     ...prevArray,
                     createCartItem,
                  ])
               }
               const data = cache.readQuery({
                  query: CART_BY_WEEK,
                  variables: {
                     weekId: state.week.id,
                     keycloakId: user?.keycloakId,
                     brand_customerId: user?.brandCustomerId,
                  },
               })

               const cloneData = JSON.parse(JSON.stringify(data))

               const updatedData = {
                  ...cloneData,
                  subscriptionOccurenceCustomer: {
                     ...cloneData.subscriptionOccurenceCustomer,
                     validStatus: {
                        addedProductsCount:
                           cloneData.subscriptionOccurenceCustomer.validStatus
                              .addedProductsCount + 1,
                        hasCart: true,
                        itemCountValid:
                           cloneData.subscriptionOccurenceCustomer.validStatus
                              .pendingProductsCount === 1,
                        itemCountValidComment: 'Loading...',
                        pendingProductsCount:
                           cloneData.subscriptionOccurenceCustomer.validStatus
                              .pendingProductsCount - 1,
                     },
                     cart: {
                        ...cloneData.subscriptionOccurenceCustomer.cart,
                        products: [
                           ...cloneData.subscriptionOccurenceCustomer.cart
                              .products,
                           JSON.parse(JSON.stringify(createCartItem)),
                        ],
                     },
                  },
               }

               cache.writeQuery({
                  query: CART_BY_WEEK,
                  variables: {
                     weekId: state.week.id,
                     keycloakId: user?.keycloakId,
                     brand_customerId: user?.brandCustomerId,
                  },
                  data: updatedData,
                  broadcast: true,
               })
            },
         })
            .then(({ data: { createCart = {} } = {} }) => {
               const cart = insertCartId(item, createCart?.id)
               insertCartItem({
                  variables: { object: cart },
               }).then(({ data: { createCartItem = {} } = {} } = {}) => {
                  addToast(t(`Successfully added the product.`), {
                     appearance: 'info',
                  })
                  updateOccurenceCustomer({
                     variables: {
                        pk_columns: {
                           keycloakId: user.keycloakId,
                           subscriptionOccurenceId: state.week.id,
                           brand_customerId: user.brandCustomerId,
                        },
                        _set: {
                           isSkipped: false,
                           cartId: createCartItem?.cartId,
                        },
                     },
                  }).then(({ data: { updateOccurenceCustomer = {} } = {} }) => {
                     if (!item?.isAddOn) {
                        dispatch({
                           type: 'IS_CART_FULL',
                           payload:
                              updateOccurenceCustomer?.validStatus
                                 ?.itemCountValid,
                        })
                     }
                     if (updateOccurenceCustomer?.isSkipped !== isSkipped) {
                        if (!updateOccurenceCustomer?.isSkipped) {
                           addToast(t('This week has been unskipped.'), {
                              appearance: 'info',
                           })
                        }
                     }
                  })
               })
            })
            .catch(error => console.error('addProduct -> createCart ->', error))
      }
   }
   if (
      [
         state.isOccurencesLoading,
         loadingZipcode,
         isCustomerLoading,
         occurenceCustomerLoading,
         !Boolean(state.week?.id),
      ].every(node => node)
   )
      return <PageLoader />

   return (
      <MenuContext.Provider
         value={{
            state: {
               ...state,
               occurenceCustomer: cart,
               fulfillment,
               isCartValidByProductAvailability,
            },
            methods: {
               products: {
                  add: addProduct,
                  delete: removeProduct,
               },
            },
            locationId,
            brandLocation,
            brand,
            dispatch,
         }}
      >
         {children}
      </MenuContext.Provider>
   )
}

export const useMenu = () => React.useContext(MenuContext)
