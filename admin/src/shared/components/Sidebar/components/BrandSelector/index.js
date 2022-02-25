import { useSubscription } from '@apollo/react-hooks'
import { Flex } from '@dailykit/ui'
import React, { useContext, useState } from 'react'
import { BrandContext } from '../../../../../App'
import { UnionIcon } from '../../../../assets/icons'
import { ArrowDown, ArrowUp } from '../../../../assets/navBarIcons'
import { BRAND_LIST } from '../../graphql/subscription'

const BrandSelector = ({ mouseOver }) => {
   return (
      <div style={{ padding: '7px', textAlign: 'center' }}>
         {mouseOver ? <BrandSelect /> : <UnionIcon />}
      </div>
   )
}
const BrandSelect = () => {
   const [arrowClicked, setArrowClicked] = useState(false)
   const [brandList, setBrandList] = React.useState([])
   const [viewingFor, setViewingFor] = useState({
      brandId: null,
      brandName: '',
   })
   const [brandContext, setBrandContext] = useContext(BrandContext)

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
               })
               setBrandContext({
                  brandId: brand.id,
                  brandName: brand.title,
               })
            }
         })
      },
   })
   console.log('Brand list', brandContext)
   return (
      <div>
         <Flex
            container
            style={{ justifyContent: 'space-between', padding: '7px' }}
         >
            <p>{viewingFor.brandName}</p>
            <span onClick={() => setArrowClicked(!arrowClicked)}>
               {arrowClicked ? <ArrowUp /> : <ArrowDown />}
            </span>
         </Flex>
         {arrowClicked && (
            <div style={{ position: 'absolute' }}>
               {brandList.map(brand => {
                  return (
                     <div
                        key={brand.id}
                        onClick={() => {
                           setViewingFor({
                              ...viewingFor,
                              brandId: brand.id,
                              brandName: brand.title,
                           })
                           setBrandContext({
                              ...brandContext,
                              brandId: brand.id,
                              brandName: brand.title,
                           })
                        }}
                     >
                        {brand.title}
                     </div>
                  )
               })}
            </div>
         )}
      </div>
   )
}
export default BrandSelector
