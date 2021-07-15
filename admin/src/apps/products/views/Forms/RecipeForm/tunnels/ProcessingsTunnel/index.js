import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   TunnelHeader,
   useSingleList,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import {
   InlineLoader,
   Tooltip,
   Banner,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { RecipeContext } from '../../../../../context/recipe'
import {
   CREATE_PROCESSINGS,
   CREATE_SIMPLE_RECIPE_INGREDIENT_PROCESSING,
   S_PROCESSINGS,
   UPSERT_MASTER_PROCESSING,
} from '../../../../../graphql'
import { TunnelBody } from '../styled'

const ProcessingsTunnel = ({ state, closeTunnel }) => {
   const { recipeState } = React.useContext(RecipeContext)

   const [ingredientProcessings, setIngredientProcessings] = React.useState([])

   // Query
   const { loading } = useSubscription(S_PROCESSINGS, {
      variables: {
         where: {
            _and: [
               { ingredientId: { _eq: recipeState.newIngredient?.id } },
               { isArchived: { _eq: false } },
            ],
         },
      },
      onSubscriptionData: data => {
         const processings = data.subscriptionData.data.ingredientProcessings
         setIngredientProcessings(processings)
      },
   })

   // State for search input
   const [search, setSearch] = React.useState('')
   const [list, current, selectOption] = useSingleList(ingredientProcessings)

   // Mutation
   const [createSimpleRecipeIngredientProcessing] = useMutation(
      CREATE_SIMPLE_RECIPE_INGREDIENT_PROCESSING,
      {
         onCompleted: () => {
            toast.success('Ingredient added!')
            closeTunnel(2)
            closeTunnel(1)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const [upsertMasterProcessing] = useMutation(UPSERT_MASTER_PROCESSING, {
      onCompleted: data => {
         createProcessing({
            variables: {
               procs: [
                  {
                     ingredientId: recipeState.newIngredient.id,
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
         console.log(data)
         const processing = {
            id: data.createIngredientProcessing.returning[0].id,
            title: data.createIngredientProcessing.returning[0].processingName,
         }
         // add(processing)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const add = processing => {
      createSimpleRecipeIngredientProcessing({
         variables: {
            object: {
               ingredientId: recipeState.newIngredient.id,
               processingId: processing.id,
               simpleRecipeId: state.id,
            },
         },
      })
   }

   const quickCreateProcessing = () => {
      const processingName = search.slice(0, 1).toUpperCase() + search.slice(1)
      upsertMasterProcessing({
         variables: {
            name: processingName,
         },
      })
   }

   React.useEffect(() => {
      if (current.id) {
         add(current)
      }
   }, [current])

   return (
      <>
         <TunnelHeader
            title="Select Processing"
            close={() => closeTunnel(2)}
            tooltip={<Tooltip identifier="processings_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-recipes-processing-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  <List>
                     {Object.keys(current).length > 0 ? (
                        <ListItem type="SSL1" title={current.title} />
                     ) : (
                        <ListSearch
                           onChange={value => setSearch(value)}
                           placeholder="type what you’re looking for..."
                        />
                     )}
                     <ListHeader type="SSL1" label="Processings" />
                     <ListOptions
                        search={search}
                        handleOnCreate={quickCreateProcessing}
                     >
                        {list
                           .filter(option =>
                              option.title.toLowerCase().includes(search)
                           )
                           .map(option => (
                              <ListItem
                                 type="SSL1"
                                 key={option.id}
                                 title={option.title}
                                 isActive={option.id === current.id}
                                 onClick={() => selectOption('id', option.id)}
                              />
                           ))}
                     </ListOptions>
                  </List>
               </>
            )}
            <Banner id="products-app-recipes-processing-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default ProcessingsTunnel
