import React from 'react'
import { useLazyQuery, useMutation, useSubscription } from '@apollo/react-hooks'
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
} from '../../../../../../../../../shared/components'
import { logger } from '../../../../../../../../../shared/utils'
import { ModifiersContext } from '../../../../context/modifier'
import {
   S_SACHETS,
   S_SACHET_ITEMS,
   MODIFIER_OPTION,
   S_SIMPLE_RECIPE_YIELDS,
} from '../../../../../../../graphql'
import { TunnelBody } from '../../../styled'

const ModifierOptionsTunnel = ({ close }) => {
   const {
      modifiersState: { optionType, categoryId },
   } = React.useContext(ModifiersContext)
   const [search, setSearch] = React.useState('')
   const [options, setOptions] = React.useState([])
   const [list, current, selectOption] = useSingleList(options)

   // Subscription
   const { loading: sachetItemsLoading } = useSubscription(S_SACHET_ITEMS, {
      skip: optionType !== 'sachetItem',
      onSubscriptionData: data => {
         const updatedOptions = data.subscriptionData.data.sachetItems.map(
            item => ({
               ...item,
               title: `${item.bulkItem.supplierItem.name} - ${item.bulkItem.processingName}`,
               unit: `${item.unitSize} ${item.unit}`,
            })
         )
         setOptions([...updatedOptions])
      },
   })
   const { loading: sachetsLoading } = useSubscription(S_SACHETS, {
      skip: optionType !== 'ingredientSachet',
      variables: {
         where: {
            isArchived: { _eq: false },
         },
      },
      onSubscriptionData: data => {
         const updatedOptions = data.subscriptionData.data.ingredientSachets.map(
            item => ({
               ...item,
               title: `${item.quantity + item.unit} - ${item.ingredient.name}`,
            })
         )
         setOptions([...updatedOptions])
      },
   })
   const { loading: yieldsLoading } = useSubscription(S_SIMPLE_RECIPE_YIELDS, {
      skip: optionType !== 'simpleRecipeYield',
      variables: {
         where: { isArchived: { _eq: false } },
      },
      onSubscriptionData: data => {
         const updatedOptions = data.subscriptionData.data.simpleRecipeYields.map(
            item => ({
               ...item,
               title: `${item.simpleRecipe.name} - ${item.yield.serving} servings`,
            })
         )
         setOptions([...updatedOptions])
      },
   })

   const [createOption] = useMutation(MODIFIER_OPTION.CREATE, {
      onCompleted: () => toast.success('Option created!'),
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const select = option => {
      selectOption('id', option.id)
      const object = {
         modifierCategoryId: categoryId,
         name: option.title,
         originalName: option.title,
         sachetItemId: optionType === 'sachetItem' ? option.id : null,
         ingredientSachetId:
            optionType === 'ingredientSachet' ? option.id : null,
         simpleRecipeYieldId:
            optionType === 'simpleRecipeYield' ? option.id : null,
      }
      createOption({
         variables: {
            object,
         },
      })
      close(4)
      close(3)
   }

   return (
      <>
         <TunnelHeader
            title="Choose Option"
            close={() => close(4)}
            tooltip={<Tooltip identifier="modifiers_options_tunnel" />}
         />
         <TunnelBody>
            {[sachetItemsLoading, sachetsLoading, yieldsLoading].some(
               loading => loading
            ) ? (
               <InlineLoader />
            ) : (
               <>
                  {list.length ? (
                     <List>
                        {Object.keys(current).length > 0 ? (
                           <ListItem type="SSL1" title={current.title} />
                        ) : (
                           <ListSearch
                              onChange={value => setSearch(value)}
                              placeholder="type what you’re looking for..."
                           />
                        )}
                        <ListHeader
                           type="SSL1"
                           label="Products Options/Items"
                        />
                        <ListOptions>
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
                                    onClick={() => select(option)}
                                 />
                              ))}
                        </ListOptions>
                     </List>
                  ) : (
                     <Filler
                        message="No products/items found! To start, please add some."
                        height="500px"
                     />
                  )}
               </>
            )}
         </TunnelBody>
      </>
   )
}

export default ModifierOptionsTunnel
