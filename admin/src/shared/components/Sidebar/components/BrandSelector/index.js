import { useSubscription } from '@apollo/react-hooks'
import { Flex, Spacer } from '@dailykit/ui'
import { Avatar, Space } from 'antd'
import React, { useContext, useState } from 'react'
import { BrandContext } from '../../../../../App'
import { UnionIcon } from '../../../../assets/icons'
import { ArrowDown, ArrowUp } from '../../../../assets/navBarIcons'
import { BRAND_LIST } from '../../graphql/subscription'
import {
   StyledBrandName,
   StyledBrandSelector,
   StyledBrandSelectorList,
} from './styled'

const BrandSelector = ({ mouseOver }) => {
   const [arrowClicked, setArrowClicked] = useState(false)
   const [brandList, setBrandList] = React.useState([])
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const [viewingFor, setViewingFor] = useState({
      brandId: null,
      brandName: '',
      logo: '',
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
                  brandId: brand.id,
                  brandName: brand.title,
               })
            }
         })
      },
   })
   console.log('Brand list', brandList)

   return (
      <div style={{ padding: '7px', textAlign: 'center' }}>
         {mouseOver ? (
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
                     <span onClick={() => setArrowClicked(!arrowClicked)}>
                        {arrowClicked ? <ArrowUp /> : <ArrowDown />}
                     </span>
                  </div>
               </StyledBrandSelector>
               {arrowClicked && (
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
                                 setArrowClicked(false)
                              }}
                           >
                              <span>
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
                              </span>
                              <span>{brand.title}</span>
                           </div>
                        )
                     })}
                  </StyledBrandSelectorList>
               )}
            </div>
         ) : (
            <UnionIcon />
         )}
      </div>
   )
}

export default BrandSelector
