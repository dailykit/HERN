import React from 'react'
import {
   Flex,
   List,
   ListHeader,
   ListItem,
   ListOptions,
   ListSearch,
   Loader,
   Tag,
   TagGroup,
   TextButton,
   TunnelHeader,
   useMultiList,
} from '@dailykit/ui'
import { useSubscription } from '@apollo/react-hooks'
import { UNIT_CONVERSIONS } from '../../graphql'
import { InlineLoader } from '../../../InlineLoader'
import { toast } from 'react-toastify'
import Banner from '../../../Banner'

const UnitConversionsListing = ({
   preselected,
   closeTunnel,
   openTunnel,
   onSave,
}) => {
   const [search, setSearch] = React.useState('')
   const [options, setOptions] = React.useState([])

   const [list, selected, selectOption] = useMultiList(options)

   const { loading, error } = useSubscription(UNIT_CONVERSIONS.LIST, {
      onSubscriptionData: data => {
         const { unitConversions } = data.subscriptionData.data
         const updatedUnitConversions = unitConversions.map(conv => ({
            ...conv,
            title: `1 ${conv.inputUnitName} = ${conv.conversionFactor} ${conv.outputUnitName}`,
         }))
         setOptions(updatedUnitConversions)
      },
   })
   if (error) console.error(error)

   const selectOptionFilter = option => {
      const alreadySelected = selected.find(
         op => op.inputUnitName === option.inputUnitName
      )
      if (alreadySelected) {
         selectOption('id', alreadySelected.id)
      }
      selectOption('id', option.id)
   }

   return (
      <>
         <TunnelHeader
            title="Unit Conversions"
            close={() => closeTunnel(1)}
            right={{
               title: 'Save',
               action: () => {
                  onSave(selected)
               },
            }}
         />
         <Banner id="unit-conversion-tunnel-top" />

         <Flex padding="16px">
            <Flex container alignItems="center" justifyContent="flex-end">
               <TextButton type="ghost" onClick={() => openTunnel(2)}>
                  Add New Conversion
               </TextButton>
            </Flex>
            {loading ? (
               <InlineLoader />
            ) : (
               <>
                  <List>
                     <ListSearch
                        onChange={value => setSearch(value)}
                        placeholder="type what you’re looking for..."
                     />
                     {selected.length > 0 && (
                        <TagGroup style={{ margin: '8px 0' }}>
                           {selected.map(option => (
                              <Tag
                                 key={option.id}
                                 title={option.title}
                                 onClick={() => selectOption('id', option.id)}
                              >
                                 {option.title}
                              </Tag>
                           ))}
                        </TagGroup>
                     )}
                     <ListHeader type="MSL2" label="Unit Conversions" />
                     <ListOptions>
                        {list
                           .filter(option =>
                              option.title.toLowerCase().includes(search)
                           )
                           .map(option => (
                              <ListItem
                                 type="MSL2"
                                 key={option.id}
                                 content={{
                                    title: option.title,
                                    description: option.description,
                                 }}
                                 onClick={() => selectOptionFilter(option)}
                                 isActive={selected.find(
                                    item => item.id === option.id
                                 )}
                              />
                           ))}
                     </ListOptions>
                  </List>
               </>
            )}
         </Flex>
         <Banner id="unit-conversion-tunnel-bottom" />
      </>
   )
}

export default UnitConversionsListing
