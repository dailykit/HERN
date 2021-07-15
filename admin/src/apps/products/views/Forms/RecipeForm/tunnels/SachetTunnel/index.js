import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Filler,
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
   CREATE_SACHET,
   UPSERT_SIMPLE_RECIPE_YIELD_SACHET,
   SACHETS,
   UPDATE_SIMPLE_RECIPE_YIELD_SACHET,
   UPSERT_MASTER_UNIT,
   S_SACHETS,
} from '../../../../../graphql'
import { TunnelBody } from '../styled'

const SachetTunnel = ({ closeTunnel }) => {
   const { recipeState } = React.useContext(RecipeContext)

   const [sachets, setSachets] = React.useState([])

   // Query
   const { loading } = useSubscription(S_SACHETS, {
      variables: {
         where: {
            _and: [
               {
                  ingredientId: { _eq: recipeState.sachetAddMeta.ingredientId },
               },
               {
                  ingredientProcessingId: {
                     _eq: recipeState.sachetAddMeta.processingId,
                  },
               },
               {
                  isArchived: { _eq: false },
               },
            ],
         },
      },
      onSubscriptionData: data => {
         const updatedSachets = data.subscriptionData.data.ingredientSachets.map(
            sachet => ({
               ...sachet,
               title: `${sachet.quantity}  ${sachet.unit}`,
            })
         )
         console.log(updatedSachets)
         setSachets([...updatedSachets])
      },
   })

   // State for search input
   const [search, setSearch] = React.useState('')
   const [list, current, selectOption] = useSingleList(sachets)

   // Mutation
   const [upsertRecipeYieldSachet] = useMutation(
      UPSERT_SIMPLE_RECIPE_YIELD_SACHET,
      {
         onCompleted: () => {
            toast.success('Sachet added!')
            closeTunnel(3)
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

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

   const save = curr => {
      upsertRecipeYieldSachet({
         variables: {
            yieldId: recipeState.sachetAddMeta.yieldId,
            ingredientProcessingRecordId:
               recipeState.sachetAddMeta.ingredientProcessingRecordId,
            ingredientSachetId: curr.id,
            slipName: curr.ingredient.name,
         },
      })
   }

   const quickCreateSachet = async () => {
      if (!search.includes(' '))
         return toast.error('Quantity and Unit should be space separated!')
      const [quantity, unit] = search.trim().split(' ')
      if (quantity && unit) {
         await upsertMasterUnit({
            variables: {
               name: unit,
            },
         })
         createSachet({
            variables: {
               objects: [
                  {
                     ingredientId: recipeState.sachetAddMeta?.ingredientId,
                     ingredientProcessingId:
                        recipeState.sachetAddMeta?.processingId,
                     quantity: +quantity,
                     unit,
                     tracking: false,
                  },
               ],
            },
         })
      } else {
         toast.error('Enter a valid quantity and unit!')
      }
   }

   React.useEffect(() => {
      if (current.id) {
         save(current)
      }
   }, [current])

   return (
      <>
         <TunnelHeader
            title="Select Sachet"
            close={() => closeTunnel(3)}
            tooltip={<Tooltip identifier="sachets_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-recipes-sachets-tunnel-top" />
            {loading ? (
               <InlineLoader />
            ) : (
               <List>
                  {Object.keys(current).length > 0 ? (
                     <ListItem type="SSL1" title={current.title} />
                  ) : (
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder="type what you’re looking for..."
                     />
                  )}
                  <ListHeader type="SSL1" label="Sachets" />
                  <ListOptions
                     search={search}
                     handleOnCreate={quickCreateSachet}
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
            )}
            <Banner id="products-app-recipes-sachets-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default SachetTunnel
