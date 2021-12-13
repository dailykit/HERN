import React from 'react'
import {
   ListHeader,
   ListItem,
   List,
   ListOptions,
   ListSearch,
   TextButton,
   TagGroup,
   Tag,
   useSingleList,
} from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import { BRAND_ID } from '../../../Query'
const ListFunction = () => {
   const [search, setSearch] = React.useState('')
   const [brandId, setBrandId] = React.useState([])

   const { loading } = useSubscription(BRAND_ID, {
      onSubscriptionData: data => {
         setBrandId(data.subscriptionData.data.brandsAggregate.nodes)
      },
   })
   console.log('brand ID:::', brandId)
   const [list, current, selectOption] = useSingleList(brandId)

   return (
      <List>
         {Object.keys(current).length > 0 ? (
            <ListItem type="SSL1" title={current.title} />
         ) : (
            <ListSearch
               onChange={value => setSearch(value)}
               placeholder="type what you’re looking for..."
            />
         )}
         <ListHeader type="SSL1" label="Brand Name" />
         <ListOptions search={search}>
            {list
               .filter(option => option.title.toLowerCase().includes(search))
               .map(option => (
                  <Link to={`/operationMode/${option.id}`}>
                     <ListItem
                        type="SSL1"
                        key={option.id}
                        title={option.title}
                        isActive={option.id === current.id}
                        onClick={() => selectOption('id', option.id)}
                     />
                  </Link>
               ))}
         </ListOptions>
      </List>
   )
}

export default ListFunction
