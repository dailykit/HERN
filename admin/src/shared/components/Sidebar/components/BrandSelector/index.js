import { useSubscription } from '@apollo/react-hooks'
import { Spacer } from '@dailykit/ui'
import { Avatar } from 'antd'
import React, { useContext, useState } from 'react'
import { BrandContext } from '../../../../../App'
import { UnionIcon } from '../../../../assets/icons'
import { ArrowDown, ArrowUp } from '../../../../assets/navBarIcons'
import { BRAND_LIST, BRAND_LOCATIONS } from '../../graphql/subscription'
import {
   StyledBrandLocations,
   StyledBrandName,
   StyledBrandSelector,
   StyledBrandSelectorList,
} from './styled'

const BrandSelector = ({ mouseOver }) => {
   const [brandArrowClicked, setBrandArrowClicked] = useState(false)
   const [locationArrowClicked, setLocationArrowClicked] = useState(false)
   const [brandList, setBrandList] = React.useState([])
   const [brandLocationsList, setBrandLocationsList] = React.useState([])
   const [brandContext, setBrandContext] = useContext(BrandContext)

   const [viewingFor, setViewingFor] = useState({
      brandId: null,
      brandName: '',
      logo: '',
      locationId: null,
      locationLabel: '',
   })

   const { loading: loadingList, error } = useSubscription(BRAND_LIST, {
      variables: {
         identifier: 'Brand Info',
      },
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.brandsAggregate.nodes.map(
            eachBrand => {
               return {
                  id: eachBrand.id,
                  title: eachBrand.title,
                  isDefault: eachBrand.isDefault,
                  domain: [eachBrand.domain],
                  logo: eachBrand.brand_brandSettings.length
                     ? eachBrand.brand_brandSettings[0]?.value.brandLogo.value
                        ? eachBrand.brand_brandSettings[0]?.value.brandLogo
                             .value
                        : eachBrand.brand_brandSettings[0]?.value.brandLogo
                             .default.url
                     : '',
               }
            }
         )
         setBrandList(result)
         result.map(brand => {
            if (brand.isDefault) {
               setViewingFor({
                  ...viewingFor,
                  brandId: brand.id,
                  brandName: brand.title,
                  logo: brand.logo,
               })
               setBrandContext({
                  ...brandContext,
                  brandId: brand.id,
                  brandName: brand.title,
               })
            }
         })
      },
   })

   const { loading: brandLocationsLoading, error: brandLocationsError } =
      useSubscription(BRAND_LOCATIONS, {
         variables: {
            id: viewingFor.brandId,
         },
         onSubscriptionData: data => {
            console.log(data.subscriptionData.data.brands[0].brand_locations)
            const result =
               data.subscriptionData.data.brands[0].brand_locations.map(
                  brandLocation => {
                     return {
                        id: brandLocation.locationId,
                        label: brandLocation.location.label,
                     }
                  }
               )
            setBrandLocationsList(result)

            setViewingFor({
               ...viewingFor,
               locationId: result[0]?.id || null,
               locationLabel: result[0]?.label || '',
            })
            setBrandContext({
               ...brandContext,
               locationId: result[0]?.id || null,
               locationLabel: result[0]?.label || '',
            })
         },
      })
   // console.log('brandContext', brandContext)

   return (
      <div style={{ padding: '7px', textAlign: 'center' }}>
         {mouseOver ? (
            <>
               <div>
                  <StyledBrandSelector>
                     <div>
                        {viewingFor.logo ? (
                           <Avatar src={viewingFor.logo} size={52} />
                        ) : (
                           <Avatar
                              style={{
                                 backgroundColor: '#87d068',
                              }}
                              size={52}
                           >
                              {viewingFor.brandName.charAt(0).toUpperCase()}
                           </Avatar>
                        )}
                     </div>
                     <div>
                        <StyledBrandName>
                           <p>Brand</p>
                           <Spacer size="2px" />
                           <p>{viewingFor.brandName}</p>
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
                        {brandList.map(brand => {
                           return (
                              <div
                                 key={brand.id}
                                 onClick={() => {
                                    setViewingFor({
                                       ...viewingFor,
                                       brandId: brand.id,
                                       brandName: brand.title,
                                       logo: brand.logo,
                                    })
                                    setBrandContext({
                                       ...brandContext,
                                       brandId: brand.id,
                                       brandName: brand.title,
                                    })
                                    setBrandArrowClicked(false)
                                 }}
                                 active={brand.id === viewingFor.brandId}
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
                           )
                        })}
                     </StyledBrandSelectorList>
                  )}
               </div>
               <Spacer size="10px" />

               <div>
                  {viewingFor.locationId ? (
                     <div>
                        <StyledBrandLocations>
                           <div>
                              <span>Location</span>
                              <span>{viewingFor.locationLabel}</span>
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
                              {brandLocationsList.map(location => {
                                 return (
                                    <div
                                       key={location.id}
                                       onClick={() => {
                                          setViewingFor({
                                             ...viewingFor,
                                             locationId: location.id,
                                             locationLabel: location.label,
                                          })
                                          setBrandContext({
                                             ...brandContext,
                                             locationId: location.id,
                                             locationLabel: location.label,
                                          })
                                          setLocationArrowClicked(false)
                                       }}
                                       active={
                                          location.id === viewingFor.locationId
                                       }
                                    >
                                       {location.label}
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
