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
   ErrorBoundary,
   InlineLoader,
   Tooltip,
} from '../../../../../../../../../shared/components'
import { logger } from '../../../../../../../../../shared/utils'
import { ModifiersContext } from '../../../../context/modifier'
import { MODIFIERS, PRODUCT_OPTION } from '../../../../../../../graphql'
import { TunnelBody } from '../../../styled'

const ModifierTemplatesTunnel = ({ close }) => {
   const { modifiersDispatch } = React.useContext(ModifiersContext)

   // Subscription
   const { data: { modifiers = [] } = {}, loading, error } = useSubscription(
      MODIFIERS
   )

   const [search, setSearch] = React.useState('')
   const [list, current, selectOption] = useSingleList(modifiers)

   // Mutation
   // const [updateProductOptions, { loading: inFlight }] = useMutation(
   //    PRODUCT_OPTION.UPDATE,
   //    {
   //       onCompleted: () => {
   //          toast.success('Modifier added to option!')
   //          close(6)
   //          close(1)
   //       },
   //       onError: error => {
   //          toast.error('Something went wrong!')
   //          logger(error)
   //       },
   //    }
   // )

   const save = () => {
      modifiersDispatch({
         type: 'MODIFIER_ID',
         payload: current.id,
      })
      modifiersDispatch({
         type: 'MODIFIER_NAME',
         payload: current.title,
      })
      close(6)
      close(1)
   }

   React.useEffect(() => {
      if (current.id) {
         save()
      }
   }, [current.id])

   if (loading) return <InlineLoader />
   if (!loading && error) return <ErrorBoundary rootRoute="/apps/products" />

   return (
      <>
         <TunnelHeader
            title="Choose Modifier Template"
            close={() => close(6)}
            tooltip={<Tooltip identifier="modifier_templates_tunnel" />}
         />
         <TunnelBody>
            {!modifiers.length ? (
               <Filler
                  message="No modifiers found! To start, please add some."
                  height="500px"
               />
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
                  <ListHeader type="SSL1" label="Modifier Templates" />
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

export default ModifierTemplatesTunnel
