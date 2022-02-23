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
import { Avatar, Switch, Tooltip } from 'antd'
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
   StyledBrandHeader,
   StyledCard,
   StyledContainer,
   StyledContainerHead,
   StyledContent,
   StyledDeliveryService,
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
         identifier: 'Brand Info',
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
                  state={state}
               />
            </Tunnel>
         </Tunnels>
         {loading ? (
            <InlineLoader />
         ) : LinkedBrands?.length > 0 ? (
            <>
               <StyledContainerHead>
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
                  <StyledContainer>
                     {LinkedBrands.map(eachBrand => (
                        <StyledCard
                           key={`${eachBrand.brandId}-${eachBrand.locationId}`}
                        >
                           <TopBrandLocationCard />
                           <StyledContent>
                              <StyledBrandHeader>
                                 <Tooltip
                                    title={eachBrand.brand.title}
                                    placement="top"
                                    key={eachBrand.brandId}
                                 >
                                    {eachBrand.brand.brand_brandSettings
                                       .length > 0 ? (
                                       <Avatar
                                          src={
                                             eachBrand.brand
                                                .brand_brandSettings[0]?.value
                                                .brandLogo.value
                                                ? eachBrand.brand
                                                     .brand_brandSettings[0]
                                                     ?.value.brandLogo.value
                                                : eachBrand.brand
                                                     .brand_brandSettings[0]
                                                     ?.value.brandLogo.default
                                                     .url
                                          }
                                       />
                                    ) : (
                                       <Avatar
                                          style={{
                                             backgroundColor: '#87d068',
                                          }}
                                       >
                                          {eachBrand.brand.title
                                             .charAt(0)
                                             .toUpperCase()}
                                       </Avatar>
                                    )}
                                 </Tooltip>
                                 <Text as="h3">{eachBrand.brand.title}</Text>
                              </StyledBrandHeader>
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
                              {eachBrand.doesDeliver && (
                                 <Flex>
                                    <StyledDeliveryService>
                                       <div>Does Deliver outside city?</div>
                                       <Switch
                                          defaultChecked
                                          size="small"
                                          onChange={() =>
                                             updateBrandLocation({
                                                variables: {
                                                   brandId: eachBrand.brandId,
                                                   locationId:
                                                      eachBrand.locationId,
                                                   _set: {
                                                      doesDeliverOutsideCity:
                                                         !eachBrand.doesDeliverOutsideCity,
                                                   },
                                                },
                                             })
                                          }
                                       />
                                    </StyledDeliveryService>
                                    <StyledDeliveryService>
                                       <div>Does Deliver outside state?</div>
                                       <Switch
                                          defaultChecked
                                          size="small"
                                          onChange={() =>
                                             updateBrandLocation({
                                                variables: {
                                                   brandId: eachBrand.brandId,
                                                   locationId:
                                                      eachBrand.locationId,
                                                   _set: {
                                                      doesDeliverOutsideState:
                                                         !eachBrand.doesDeliverOutsideState,
                                                   },
                                                },
                                             })
                                          }
                                       />
                                    </StyledDeliveryService>
                                 </Flex>
                              )}
                           </StyledContent>
                           <BottomBrandLocationCard />
                        </StyledCard>
                     ))}
                  </StyledContainer>
               </StyledContainerHead>
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
