import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
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
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { IngredientContext } from '../../../../../context/ingredient'
import { FETCH_PACKAGINGS } from '../../../../../graphql'
import { TunnelBody } from '../styled'

const EditPackagingTunnel = ({ closeTunnel }) => {
   const { ingredientState, ingredientDispatch } =
      React.useContext(IngredientContext)

   // Subscription
   const {
      data: { packagings = [] } = {},
      loading,
      error,
   } = useSubscription(FETCH_PACKAGINGS)

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   const [search, setSearch] = React.useState('')
   const [list, current, selectOption] = useSingleList(packagings)

   React.useEffect(() => {
      if (Object.keys(current).length) {
         ingredientDispatch({
            type: 'EDIT_MODE',
            payload: {
               ...ingredientState.editMode,
               packaging: current,
            },
         })
         closeTunnel(5)
      }
   }, [current])

   return (
      <>
         <TunnelHeader
            title="Select Packaging"
            close={() => closeTunnel(5)}
            tooltip={<Tooltip identifier="packaging_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-ingredients-edit-packaging-tunnel-top" />
            {loading ? (
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
                        <ListHeader type="SSL1" label="Packaging Names" />
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
                                    onClick={() =>
                                       selectOption('id', option.id)
                                    }
                                 />
                              ))}
                        </ListOptions>
                     </List>
                  ) : (
                     <Filler height="500px" message="No packagings found!" />
                  )}
               </>
            )}
            <Banner id="products-app-ingredients-edit-packaging-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default EditPackagingTunnel
