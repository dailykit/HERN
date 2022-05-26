import { useSubscription } from '@apollo/react-hooks'
import { Spacer } from '@dailykit/ui'
import { Avatar } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { BrandContext } from '../../../../../App'
import { UnionIcon } from '../../../../assets/icons'
import { ArrowDown, ArrowUp } from '../../../../assets/navBarIcons'
import { InlineLoader } from '../../../InlineLoader'
import { LOCATION_SELECTOR_LIST } from '../../graphql/subscription'
import {
   StyledBrandLocations,
   StyledBrandName,
   StyledBrandSelector,
   StyledBrandSelectorList,
} from './styled'

const BrandSelector = ({ mouseOver }) => {
   const [brandArrowClicked, setBrandArrowClicked] = useState(false)
   const [displayBrand, setDisplayBrand] = useState(true)
   const [locationArrowClicked, setLocationArrowClicked] = useState(false)
   const [brandList, setBrandList] = React.useState([])
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const { loading } = useSubscription(LOCATION_SELECTOR_LIST, {
      skip: brandContext.isLoading,
      variables: {
         identifier: 'Brand Info',
      },
      onSubscriptionData: ({ subscriptionData }) => {
         const result = subscriptionData.data.brandsAggregate.nodes.map(
            eachBrand => {
               return {
                  id: eachBrand.id,
                  title: eachBrand.title,
                  isDefault: eachBrand.isDefault,
                  domain: eachBrand.domain,
                  logo: eachBrand.brand_brandSettings.length
                     ? eachBrand.brand_brandSettings[0]?.value.brandLogo.value
                        ? eachBrand.brand_brandSettings[0]?.value.brandLogo
                             .value
                        : eachBrand.brand_brandSettings[0]?.value.brandLogo
                             .default.url
                     : '',
                  location: eachBrand.brand_locations,
               }
            }
         )
         // setBrandList(result)
         // console.log('result', result)

         if (
            //organization scope
            brandContext.brandId === null &&
            brandContext.locationId === null
         ) {
            setBrandContext({
               ...brandContext,
               brandName: 'All',
               locationLabel: 'All locations are selected',
            })

            setBrandList(result)
         } else if (
            //brand scope
            brandContext.brandId !== null &&
            brandContext.locationId === null
         ) {
            const index = result.findIndex(
               obj => obj.id === brandContext.brandId
            )
            setBrandContext({
               ...brandContext,
               logo: result[index].logo,
               domain: result[index].domain,
               locationLabel: 'All',
            })
            return setBrandList([result[index]])
         } else if (
            //brand_location scope
            brandContext.brandId !== null &&
            brandContext.locationId !== null
         ) {
            const index = result.findIndex(
               obj => obj.id === brandContext.brandId
            )
            const locationIndex = result[index].location.findIndex(
               obj => obj.location.id === brandContext.locationId
            )
            setBrandContext({
               ...brandContext,
               logo: result[index].logo,
               domain: result[index].domain,
            })
            setBrandList([
               {
                  domain: result[index].domain,
                  id: result[index].id,
                  logo: result[index].logo,
                  title: result[index].title,
                  location: [result[index].location[locationIndex]],
               },
            ])
         } else if (
            //location scope
            brandContext.brandId === null &&
            brandContext.locationId !== null
         ) {
            setDisplayBrand(false)
            return setBrandList([
               {
                  id: brandContext.brandId,
                  title: brandContext.brandName,
                  location: [
                     {
                        location: {
                           id: brandContext.locationId,
                           label: brandContext.locationLabel,
                        },
                     },
                  ],
               },
            ])
         }
      },
   })

   // set brand list in brand context
   useEffect(() => {
      if (brandList.length)
         setBrandContext(prevState => ({ ...prevState, brandList }))
   }, [brandList])
   
   console.log('brandContext', brandContext)
   // console.log('brandList', brandList)

   if (loading) return <InlineLoader />
   return (
      <div style={{ padding: '7px', textAlign: 'center' }}>
         {mouseOver ? (
            <>
               {displayBrand && (
                  <div>
                     <StyledBrandSelector>
                        <div>
                           {brandContext?.logo ? (
                              <Avatar src={brandContext.logo} size={52} />
                           ) : (
                              <Avatar
                                 style={{
                                    backgroundColor: '#87d068',
                                 }}
                                 size={52}
                              >
                                 {brandContext.brandName
                                    .charAt(0)
                                    .toUpperCase()}
                              </Avatar>
                           )}
                        </div>
                        <div>
                           <StyledBrandName>
                              <p>Brand</p>
                              <Spacer size="2px" />
                              <p>{brandContext.brandName}</p>
                           </StyledBrandName>
                           <span
                              onClick={() => {
                                 setBrandArrowClicked(!brandArrowClicked)
                                 setLocationArrowClicked(false)
                              }}
                           >
                              {brandArrowClicked ? <ArrowUp /> : <ArrowDown />}
                           </span>
                        </div>
                     </StyledBrandSelector>
                     {brandArrowClicked && (
                        <StyledBrandSelectorList>
                           <div
                              key={`${brandContext.brandId}-brand`}
                              onClick={() => {
                                 setBrandContext({
                                    ...brandContext,
                                    brandId: null,
                                    brandName: 'All',
                                    locationId: null,
                                    locationLabel: 'All',
                                    logo: '',
                                 })
                                 setBrandArrowClicked(false)
                              }}
                              style={{ position: 'relative', left: '31px' }}
                           >
                              {'Select all Brands'}
                           </div>
                           {brandList.map(brand => (
                              <div
                                 key={brand.id}
                                 onClick={() => {
                                    setBrandContext({
                                       ...brandContext,
                                       brandId: brand.id,
                                       brandName: brand.title,
                                       brandDomain: brand.domain,
                                       logo: brand.logo,
                                       locationId: null,
                                       locationLabel: 'All',
                                    })
                                    setBrandArrowClicked(false)
                                 }}
                                 active={
                                    brand.id == brandContext.brandId
                                       ? 'true'
                                       : 'false'
                                 }
                              >
                                 {brand.logo ? (
                                    <Avatar src={brand.logo} size="small" />
                                 ) : (
                                    <Avatar
                                       style={{
                                          backgroundColor: '#87d068',
                                       }}
                                       size="small"
                                    >
                                       {brand.title.charAt(0).toUpperCase()}
                                    </Avatar>
                                 )}
                                 {brand.title}
                              </div>
                           ))}
                        </StyledBrandSelectorList>
                     )}
                  </div>
               )}
               <Spacer size="10px" />

               <div>
                  {brandList[
                     brandList.findIndex(obj => obj.id === brandContext.brandId)
                  ]?.location.length > 0 ? (
                     <div>
                        <StyledBrandLocations>
                           <div>
                              <span>Location</span>
                              <span>{brandContext.locationLabel}</span>
                           </div>
                           <div
                              onClick={() => {
                                 setLocationArrowClicked(!locationArrowClicked)
                                 setBrandArrowClicked(false)
                              }}
                           >
                              {locationArrowClicked ? (
                                 <ArrowUp />
                              ) : (
                                 <ArrowDown />
                              )}
                           </div>
                        </StyledBrandLocations>
                        {locationArrowClicked && (
                           <StyledBrandSelectorList>
                              <div
                                 key={`${brandContext.locationId}-${brandContext.brandId}-location`}
                                 onClick={() => {
                                    setBrandContext({
                                       ...brandContext,
                                       locationId: null,
                                       locationLabel: 'All',
                                    })
                                    setLocationArrowClicked(false)
                                 }}
                              >
                                 {'Select all Locations'}
                              </div>
                              {brandList[
                                 brandList.findIndex(
                                    obj => obj.id === brandContext.brandId
                                 )
                              ]?.location.map(eachLocation => {
                                 return (
                                    <div
                                       key={`${eachLocation.location.id}-${brandContext.brandId}`}
                                       onClick={() => {
                                          setBrandContext({
                                             ...brandContext,
                                             brandLocationId: eachLocation.id,
                                             locationId:
                                                eachLocation.location.id,
                                             locationLabel:
                                                eachLocation.location.label,
                                          })
                                          setLocationArrowClicked(false)
                                       }}
                                       active={
                                          eachLocation.location.id ==
                                          brandContext.id
                                             ? 'true'
                                             : 'false'
                                       }
                                    >
                                       {eachLocation.location.label}
                                    </div>
                                 )
                              })}
                           </StyledBrandSelectorList>
                        )}
                     </div>
                  ) : (
                     <StyledBrandLocations>
                        Locations not Available !
                     </StyledBrandLocations>
                  )}
               </div>
            </>
         ) : (
            <UnionIcon />
         )}
      </div>
   )
}

export default BrandSelector
