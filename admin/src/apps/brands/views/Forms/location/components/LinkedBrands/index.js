import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonGroup,
   ButtonTile,
   ComboButton,
   Flex,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { Switch } from 'antd'
import React from 'react'
import { toast } from 'react-toastify'
import { PlusIcon } from '../../../../../../../shared/assets/icons'
import { InlineLoader } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import {
   BottomBrandLocationCard,
   DeliveryIcon,
   DineInIcon,
   PickUpIcon,
   TopBrandLocationCard,
} from '../../../../../assets/illustration'
import { BRAND_LOCATION } from '../../../../../graphql'
import { LinkedBrandsTunnel } from '../../tunnels'
import {
   StyledCard,
   StyledContent,
   StyledHeader,
   StyledServiceToggle,
   StyledServiceType,
} from './styled'

export const LinkedBrands = ({ state, locationId }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [LinkedBrands, setLinkedBrands] = React.useState({})

   //subscription
   const { loading, error } = useSubscription(BRAND_LOCATION.VIEW, {
      variables: {
         locationId: locationId,
      },
      onSubscriptionData: data => {
         console.log(
            'linkedBrands',
            data.subscriptionData.data.brands_brand_location
         )
         setLinkedBrands(data.subscriptionData.data.brands_brand_location)
      },
   })

   //mutation
   const [updateBrandLocation] = useMutation(BRAND_LOCATION.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         // console.log('error', error)
         logger(error)
      },
   })

   //handler
   const handleToggleUpdate = ({ field, brandId, value }) =>
      updateBrandLocation({
         variables: {
            brandId: { _eq: brandId },
            locationId: { _eq: locationId },
            _set: {
               [field]: !value,
            },
         },
      })

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <LinkedBrandsTunnel
                  close={closeTunnel}
                  locationId={locationId}
               />
            </Tunnel>
         </Tunnels>
         {loading ? (
            <InlineLoader />
         ) : LinkedBrands?.length > 0 ? (
            <>
               <Flex>
                  <StyledHeader>
                     <Text as="h3">Linked Brands ({LinkedBrands.length})</Text>
                     <ButtonGroup>
                        <ComboButton
                           type="ghost"
                           size="sm"
                           onClick={() => openTunnel(1)}
                           title="Click to add new brand"
                        >
                           <PlusIcon color="#367BF5" /> Add More
                        </ComboButton>
                     </ButtonGroup>
                  </StyledHeader>
                  {LinkedBrands.map(eachBrand => (
                     <>
                        <StyledCard
                           key={`${eachBrand.brandId}-${eachBrand.locationId}`}
                        >
                           <TopBrandLocationCard />
                           <StyledContent>
                              <Flex>
                                 <Text as="h3">{eachBrand.brand.title}</Text>
                              </Flex>
                              <StyledServiceType>
                                 <StyledServiceToggle>
                                    <DeliveryIcon />
                                    <Switch
                                       name={`brand-${eachBrand.brandId}`}
                                       value={eachBrand.doesDeliver}
                                       checked={eachBrand.doesDeliver}
                                       checkedChildren="Deliver"
                                       unCheckedChildren="Deliver"
                                       title="Press to change Delivery Service"
                                       onChange={() =>
                                          updateBrandLocation({
                                             variables: {
                                                brandId: eachBrand.brandId,

                                                locationId:
                                                   eachBrand.locationId,
                                                _set: {
                                                   doesDeliver:
                                                      !eachBrand.doesDeliver,
                                                },
                                             },
                                          })
                                       }
                                    />
                                 </StyledServiceToggle>
                                 <StyledServiceToggle>
                                    <PickUpIcon />
                                    <Switch
                                       name={`brand-${eachBrand.brandId}`}
                                       value={eachBrand.doesPickup}
                                       checked={eachBrand.doesPickup}
                                       checkedChildren="Pickup"
                                       unCheckedChildren="Pickup"
                                       title="Press to change Pickup Service"
                                       onChange={() =>
                                          updateBrandLocation({
                                             variables: {
                                                brandId: eachBrand.brandId,

                                                locationId:
                                                   eachBrand.locationId,
                                                _set: {
                                                   doesPickup:
                                                      !eachBrand.doesPickup,
                                                },
                                             },
                                          })
                                       }
                                    />
                                 </StyledServiceToggle>
                                 <StyledServiceToggle>
                                    <DineInIcon />
                                    <Switch
                                       name={`brand-${eachBrand.brandId}`}
                                       value={eachBrand.doesDinein}
                                       checked={eachBrand.doesDinein}
                                       checkedChildren="Dinein"
                                       unCheckedChildren="Dinein"
                                       title="Press to change Dinein Service"
                                       onChange={() =>
                                          updateBrandLocation({
                                             variables: {
                                                brandId: eachBrand.brandId,

                                                locationId:
                                                   eachBrand.locationId,
                                                _set: {
                                                   doesDinein:
                                                      !eachBrand.doesDinein,
                                                },
                                             },
                                          })
                                       }
                                    />
                                 </StyledServiceToggle>
                              </StyledServiceType>
                              <Flex></Flex>
                           </StyledContent>
                           <BottomBrandLocationCard />
                        </StyledCard>
                     </>
                  ))}
               </Flex>
            </>
         ) : (
            <ButtonTile
               type="secondary"
               size="lg"
               text="Link Brands"
               onClick={() => openTunnel(1)}
            />
         )}
      </>
   )
}
