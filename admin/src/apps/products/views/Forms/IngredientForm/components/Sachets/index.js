import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { Sachet } from '..'
import { AddIcon, DeleteIcon } from '../../../../../assets/icons'
import { IngredientContext } from '../../../../../context/ingredient'
import { DELETE_SACHET } from '../../../../../graphql'
import {
   Actions,
   StyledDisplay,
   StyledListing,
   StyledListingHeader,
   StyledListingTile,
   StyledSection,
} from './styled'
import {
   EditItemTunnel,
   EditModeTunnel,
   EditPackagingTunnel,
   EditSachetTunnel,
   ItemTunnel,
   ItemTypeTunnel,
   PackagingTunnel,
   SachetTunnel,
} from '../../tunnels'
import { logger } from '../../../../../../../shared/utils'
import { Tooltip, ErrorBoundary } from '../../../../../../../shared/components'
import ItemListTunnel from '../../tunnels/ItemListTunnel'

const Sachets = ({ state, openNutritionTunnel }) => {
   const { ingredientState, ingredientDispatch } = React.useContext(
      IngredientContext
   )

   const [sachetTunnels, openSachetTunnel, closeSachetTunnel] = useTunnel(5)
   const [
      editSachetTunnels,
      openEditSachetTunnel,
      closeEditSachetTunnel,
   ] = useTunnel(7)

   // Mutation
   const [deleteSachet] = useMutation(DELETE_SACHET, {
      onCompleted: () => {
         toast.success('Sachet deleted!')
         ingredientDispatch({
            type: 'SACHET_INDEX',
            payload: 0,
         })
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handler
   const remove = sachet => {
      if (
         window.confirm(
            `Do you want to delete sachet - ${sachet.quantity}  ${sachet.unit}?`
         )
      ) {
         deleteSachet({
            variables: {
               id: sachet.id,
            },
         })
      }
   }

   return (
      <>
         <Tunnels tunnels={sachetTunnels}>
            <Tunnel layer={1} size="sm">
               <SachetTunnel
                  state={state}
                  openTunnel={openSachetTunnel}
                  closeTunnel={closeSachetTunnel}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={editSachetTunnels}>
            <Tunnel layer={1} size="sm">
               <EditSachetTunnel
                  state={state}
                  closeTunnel={closeEditSachetTunnel}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <EditModeTunnel
                  state={state}
                  closeTunnel={closeEditSachetTunnel}
                  openTunnel={openEditSachetTunnel}
               />
            </Tunnel>
            <Tunnel layer={3}>
               <ItemTypeTunnel
                  closeTunnel={closeEditSachetTunnel}
                  openTunnel={openEditSachetTunnel}
               />
            </Tunnel>
            <Tunnel layer={4}>
               <ItemListTunnel
                  closeTunnel={closeEditSachetTunnel}
                  openTunnel={openEditSachetTunnel}
               />
            </Tunnel>
            <Tunnel layer={5}>
               <EditPackagingTunnel closeTunnel={closeEditSachetTunnel} />
            </Tunnel>
         </Tunnels>
         <ErrorBoundary rootRoute="/apps/products">
            {state.ingredientProcessings[ingredientState.processingIndex]
               .ingredientSachets.length ? (
               <>
                  <StyledListingHeader>
                     <Flex container>
                        <Text as="h3">
                           Sachets (
                           {
                              state.ingredientProcessings[
                                 ingredientState.processingIndex
                              ].ingredientSachets.length
                           }
                           )
                        </Text>
                        <Tooltip identifier="ingredient_form_sachets" />
                     </Flex>
                     <span
                        role="button"
                        tabIndex="0"
                        onClick={() => openSachetTunnel(1)}
                        onKeyDown={e =>
                           e.charCode === 13 && openSachetTunnel(1)
                        }
                     >
                        <AddIcon color="#555B6E" size="18" stroke="2.5" />
                     </span>
                  </StyledListingHeader>

                  <StyledSection>
                     <StyledListing>
                        {state.ingredientProcessings[
                           ingredientState.processingIndex
                        ].ingredientSachets?.map((sachet, i) => (
                           <StyledListingTile
                              key={sachet.id}
                              active={ingredientState.sachetIndex === i}
                              onClick={() =>
                                 ingredientDispatch({
                                    type: 'SACHET_INDEX',
                                    payload: i,
                                 })
                              }
                           >
                              <Actions
                                 active={ingredientState.sachetIndex === i}
                              >
                                 <span
                                    role="button"
                                    tabIndex="0"
                                    onClick={() => remove(sachet)}
                                    onKeyDown={e =>
                                       e.charCode === 13 && remove(sachet)
                                    }
                                 >
                                    <DeleteIcon />
                                 </span>
                              </Actions>
                              <h3>{`${sachet.quantity} ${sachet.unit}`}</h3>
                              <p>
                                 Active:{' '}
                                 {sachet.liveModeOfFulfillment?.type ===
                                    'realTime' && 'Real Time'}
                                 {sachet.liveModeOfFulfillment?.type ===
                                    'plannedLot' && 'Planned Lot'}
                              </p>
                              <p>Available: NA</p>
                           </StyledListingTile>
                        ))}
                        <ButtonTile
                           type="primary"
                           size="lg"
                           onClick={() => openSachetTunnel(1)}
                        />
                     </StyledListing>
                     <StyledDisplay>
                        <Sachet
                           state={state}
                           openSachetTunnel={openSachetTunnel}
                           openEditSachetTunnel={openEditSachetTunnel}
                           openNutritionTunnel={openNutritionTunnel}
                        />
                     </StyledDisplay>
                  </StyledSection>
               </>
            ) : (
               <ButtonTile
                  type="primary"
                  size="lg"
                  text="Add Sachet"
                  onClick={() => openSachetTunnel(1)}
               />
            )}
         </ErrorBoundary>
      </>
   )
}

export default Sachets
