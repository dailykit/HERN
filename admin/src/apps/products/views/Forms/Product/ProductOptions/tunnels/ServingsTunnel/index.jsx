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
} from '../../../../../../../../shared/components'
import { logger } from '../../../../../../../../shared/utils'
import { ProductContext } from '../../../../../../context/product'
import {
   PRODUCT_OPTION,
   S_SIMPLE_RECIPE_YIELDS,
} from '../../../../../../graphql'
import { TunnelBody } from '../../../tunnels/styled'

const ServingsTunnel = ({ closeTunnel }) => {
   const { productState } = React.useContext(ProductContext)

   const [search, setSearch] = React.useState('')
   const [items, setItems] = React.useState([])
   const [list, current, selectOption] = useSingleList(items)

   const { loading: servingsLoading } = useSubscription(
      S_SIMPLE_RECIPE_YIELDS,
      {
         variables: {
            where: { isArchived: { _eq: false } },
         },
         onSubscriptionData: data => {
            const { simpleRecipeYields } = data.subscriptionData.data
            const updatedItems = simpleRecipeYields.map(y => {
               return {
                  id: y.id,
                  title: `${y.yield.serving} serving - ${y.simpleRecipe.name}`,
               }
            })
            setItems([...updatedItems])
         },
      }
   )

   const [updateProductOption] = useMutation(PRODUCT_OPTION.UPDATE, {
      onCompleted: () => {
         toast.success('Item linked.')
         closeTunnel(1)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   React.useEffect(() => {
      if (current.id) {
         updateProductOption({
            variables: {
               id: productState.optionId,
               _set: {
                  inventoryProductBundleId: null,
                  simpleRecipeYieldId: current.id,
               },
            },
         })
      }
   }, [current])

   return (
      <>
         <TunnelHeader
            title="Select a Serving"
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="product_option_servings_tunnel" />}
         />
         <TunnelBody>
            {servingsLoading ? (
               <InlineLoader />
            ) : (
               <List>
                  {Object.keys(current).length > 0 ? (
                     <ListItem type="SSL1" title={current.title} />
                  ) : (
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder="Type what you're looking for"
                     />
                  )}
                  <ListHeader type="SSL1" label="Servings" />
                  <ListOptions search={search}>
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
         </TunnelBody>
      </>
   )
}

export default ServingsTunnel
