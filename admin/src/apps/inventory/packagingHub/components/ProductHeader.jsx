import React from 'react'
import styled from 'styled-components'

import { TruckIcon } from '../../assets/icons'
import { FlexContainer } from '../../views/Forms/styled'

import ProductPrice from './ProductPrice'

export default function ProductHeader({ product }) {
   const {
      packagingName,
      packagingCompanyBrand: { name: brandName },
      packagingPurchaseOptions,
      length,
      width,
      thickness,
      loadCapacity,
      LWHUnit,
      gusset,
   } = product

   return (
      <Wrapper>
         <h2>{packagingName}</h2>
         <Section>
            <Lead>
               by <b style={{ color: '#00A7E1' }}>{brandName}</b>
            </Lead>

            <FlexContainer style={{ alignItems: 'center' }}>
               <TruckIcon />
               <div style={{ marginLeft: '8px' }}>
                  <Lead style={{ fontSize: '10px', margin: '0 0 4px 0' }}>
                     Min Purchase Quantity
                  </Lead>
                  <Lead style={{ margin: '0' }}>
                     {packagingPurchaseOptions[0].quantity}{' '}
                     {packagingPurchaseOptions[0].unit}
                  </Lead>
               </div>
            </FlexContainer>
         </Section>
         <DimensionsGrid>
            <div>
               <Lead style={{ fontSize: '10px', margin: '0' }}>Size</Lead>
               <Lead style={{ margin: '4px 0 0 0' }}>
                  {length && width ? `${length}*${width}` : 'N/A'}{' '}
                  {LWHUnit || ''}
               </Lead>
            </div>
            <div>
               <Lead style={{ fontSize: '10px', margin: '0' }}>Thickness</Lead>
               <Lead style={{ margin: '4px 0 0 0' }}>
                  {thickness || 'N/A'} {LWHUnit || ''}
               </Lead>
            </div>
            <div>
               <Lead style={{ fontSize: '10px', margin: '0' }}>
                  Load Capacity
               </Lead>
               <Lead style={{ margin: '4px 0 0 0' }}>
                  {loadCapacity || 'N/A'} lbs
               </Lead>
            </div>
            <div>
               <Lead style={{ fontSize: '10px', margin: '0' }}>Gusset</Lead>
               <Lead style={{ margin: '4px 0 0 0' }}>
                  {gusset || 'N/A'} {LWHUnit || ''}
               </Lead>
            </div>
         </DimensionsGrid>

         <ProductPrice product={product} />
      </Wrapper>
   )
}

const Wrapper = styled.div`
   position: fixed;
   bottom: 1rem;
   top: 10rem;
   overflow-y: auto;
   width: 36vw;
   h2 {
      font-size: 40px;
      line-height: 38px;
      color: #555b6e;
   }
`

const Lead = styled.p`
   color: #555b6e;
   margin: 0 0 24px 0;
   font-size: 16px;
`

const Section = styled.div`
   width: 100%;
   border-bottom: 1px solid #ececec;
   margin-top: 12px;
   padding-bottom: 12px;
`

const DimensionsGrid = styled.div`
   display: grid;
   padding: 24px 0;
   border-bottom: 1px solid #ececec;

   grid-template-columns: repeat(4, 1fr);
   grid-template-rows: 1fr;
`
