import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabs,
   Text,
   Spacer,
} from '@dailykit/ui'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
   Banner,
   ErrorState,
   InlineLoader,
   Tooltip,
   InsightDashboard,
} from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { useTabs } from '../../../../../shared/providers'
import {
   CollectionContext,
   reducer,
   state as initialState,
} from '../../../context/collection'
import { S_COLLECTION, UPDATE_COLLECTION } from '../../../graphql'
import validator from '../validators'
import { Availability, Products } from './components'
import { useDnd } from '../../../../../shared/components/DragNDrop/useDnd'

const address = 'apps.menu.views.forms.collection.'

const CollectionForm = () => {
   const { initiatePriority } = useDnd()
   const { t } = useTranslation()

   const { setTabTitle, tab, addTab } = useTabs()
   const { id: collectionId } = useParams()

   const [collectionState, collectionDispatch] = React.useReducer(
      reducer,
      initialState
   )

   const [title, setTitle] = React.useState({
      value: '',
      meta: {
         isTouched: false,
         isValid: true,
         errors: [],
      },
   })
   const [state, setState] = React.useState(undefined)

   // Subscription
   const { loading, error } = useSubscription(S_COLLECTION, {
      variables: {
         id: collectionId,
      },
      onSubscriptionData: data => {
         setState(data.subscriptionData.data.collection)
         setTitle({
            ...title,
            value: data.subscriptionData.data.collection.name,
         })
         const categories =
            data.subscriptionData.data.collection.productCategories
         if (categories.length) {
            initiatePriority({
               tablename: 'collection_productCategory',
               schemaname: 'onDemand',
               data: categories,
            })
            categories.forEach(category => {
               if (category.products.length) {
                  initiatePriority({
                     tablename: 'collection_productCategory_product',
                     schemaname: 'onDemand',
                     data: category.products,
                  })
               }
            })
         }
      },
   })

   // Mutations
   const [updateCollection] = useMutation(UPDATE_COLLECTION, {
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
         addTab(title.value, `/menu/collections/${collectionId}`)
      }
   }, [tab, addTab, loading, title.value])

   const updateName = async () => {
      const { isValid, errors } = validator.name(title.value)
      if (isValid) {
         const { data } = await updateCollection({
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

   if (!loading && error) {
      toast.error('Failed to fetch Collection!')
      logger(error)
      return <ErrorState />
   }

   return (
      <>
         {loading || !state ? (
            <InlineLoader />
         ) : (
            <CollectionContext.Provider
               value={{ collectionState, collectionDispatch }}
            >
               <Banner id="menu-app-collections-collection-details-top" />
               <Flex
                  as="header"
                  container
                  padding="16px 32px"
                  alignItems="start"
                  justifyContent="space-between"
               >
                  <Form.Group>
                     <Form.Label htmlFor="title" title="title">
                        Collection Name*
                     </Form.Label>
                     <Form.Text
                        id="title"
                        name="title"
                        value={title.value}
                        placeholder="Enter product name"
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
                  <Flex container alignItems="flex-end">
                     <Text as="h2">{state.productCategories.length}</Text>
                     <Spacer xAxis size="8px" />
                     <Text as="subtitle">Categories</Text>
                     <Spacer xAxis size="16px" />
                     <Text as="h2">
                        {state.productCategories.reduce(
                           (acc, cat) => cat.products.length + acc,
                           0
                        )}
                     </Text>
                     <Spacer xAxis size="8px" />
                     <Text as="subtitle">Products</Text>
                  </Flex>
               </Flex>
               <Flex padding="16px 32px">
                  <HorizontalTabs>
                     <HorizontalTabList>
                        <HorizontalTab>
                           <Flex container alignItems="center">
                              Products
                              <Tooltip identifier="collection_products" />
                           </Flex>
                        </HorizontalTab>
                        <HorizontalTab>
                           <Flex container alignItems="center">
                              Availability
                              <Tooltip identifier="collection_availability" />
                           </Flex>
                        </HorizontalTab>
                        <HorizontalTab>
                           <Flex container alignItems="center">
                              Insights
                              <Tooltip identifier="collection_insights" />
                           </Flex>
                        </HorizontalTab>
                     </HorizontalTabList>
                     <HorizontalTabPanels>
                        <HorizontalTabPanel>
                           <Products state={state} />
                        </HorizontalTabPanel>
                        <HorizontalTabPanel>
                           <Availability state={state} />
                        </HorizontalTabPanel>
                        <HorizontalTabPanel>
                           <InsightDashboard
                              appTitle="Menu App"
                              moduleTitle="Collection Page"
                              variables={{
                                 collectionId,
                              }}
                              showInTunnel={false}
                           />
                        </HorizontalTabPanel>
                     </HorizontalTabPanels>
                  </HorizontalTabs>
               </Flex>
               <Banner id="menu-app-collections-collection-details-bottom" />
            </CollectionContext.Provider>
         )}
      </>
   )
}

export default CollectionForm
