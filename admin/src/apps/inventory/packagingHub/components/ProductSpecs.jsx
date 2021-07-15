import React from 'react'
import styled from 'styled-components'

import { FlexContainer } from '../../views/Forms/styled'

export default function ProductSpecs({ product }) {
   const { packagingSpecification } = product

   const { materials } = packagingSpecification.packagingMaterial
   const packagingMaterial = Object.values(materials).join(', ')

   const RenderIcon = ({ check }) => {
      return check ? (
         <svg
            width="13"
            height="11"
            viewBox="0 0 13 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path
               d="M1 6L4 9L12 1"
               stroke="#28C1F7"
               strokeWidth="2"
               strokeLinecap="round"
            />
         </svg>
      ) : (
         <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
         >
            <path
               d="M1 1L9 9"
               stroke="#FF5A52"
               strokeWidth="2"
               strokeLinecap="round"
            />
            <path
               d="M9 1L1 9"
               stroke="#FF5A52"
               strokeWidth="2"
               strokeLinecap="round"
            />
         </svg>
      )
   }

   return (
      <Wrapper>
         <h3>Product Specifications</h3>

         <Container style={{ paddingBottom: '28px' }}>
            <div>
               <FlexContainer
                  style={{ marginTop: '28px', alignItems: 'center' }}
               >
                  <RenderIcon check={packagingSpecification?.fdaCompliant} />
                  <StatusText>FDA compliant</StatusText>
               </FlexContainer>
               <FlexContainer
                  style={{ marginTop: '28px', alignItems: 'center' }}
               >
                  <RenderIcon check={packagingSpecification?.recyclable} />
                  <StatusText>Recyclable</StatusText>
               </FlexContainer>
            </div>
            <div>
               <FlexContainer
                  style={{ marginTop: '28px', alignItems: 'center' }}
               >
                  <RenderIcon check={packagingSpecification?.microwaveable} />
                  <StatusText>Microwavable</StatusText>
               </FlexContainer>
               <FlexContainer
                  style={{ marginTop: '28px', alignItems: 'center' }}
               >
                  <RenderIcon check={packagingSpecification?.compostable} />
                  <StatusText>Compostable</StatusText>
               </FlexContainer>
            </div>
         </Container>
         {/* packaging spec */}
         <Container
            style={{ paddingTop: '28px', borderTop: '1px solid #ececec' }}
         >
            <div>
               <div>
                  <Lead>Packaging material</Lead>
                  <StatusText style={{ margin: '4px 0 0 0' }}>
                     {packagingMaterial}
                  </StatusText>
               </div>
               <div style={{ margin: '28px 0' }}>
                  <Lead>Opacity</Lead>
                  <StatusText style={{ margin: '4px 0 0 0' }}>
                     {packagingSpecification.opacity || 'N/A'}
                  </StatusText>
               </div>
            </div>
            <div>
               <FlexContainer style={{ alignItems: 'center' }}>
                  <RenderIcon check={packagingSpecification?.compressibility} />
                  <StatusText>Compressable</StatusText>
               </FlexContainer>
            </div>
         </Container>
         {/* resistant spec */}
         <Container
            style={{ paddingTop: '28px', borderTop: '1px solid #ececec' }}
         >
            <div>
               <Lead>Water resistance</Lead>
               <FlexContainer
                  style={{ marginTop: '28px', alignItems: 'center' }}
               >
                  <RenderIcon
                     check={packagingSpecification?.innerWaterResistant}
                  />
                  <StatusText>Inner Water Resistantt</StatusText>
               </FlexContainer>
               <FlexContainer
                  style={{ marginTop: '28px', alignItems: 'center' }}
               >
                  <RenderIcon
                     check={packagingSpecification?.outerWaterResistant}
                  />
                  <StatusText>Outer Water Resistant</StatusText>
               </FlexContainer>
            </div>
            <div>
               <Lead>Grease resistance</Lead>
               <FlexContainer
                  style={{ marginTop: '28px', alignItems: 'center' }}
               >
                  <RenderIcon
                     check={packagingSpecification?.innerGreaseResistant}
                  />
                  <StatusText>Inner Grease Resistant</StatusText>
               </FlexContainer>
               <FlexContainer
                  style={{ marginTop: '28px', alignItems: 'center' }}
               >
                  <RenderIcon
                     check={packagingSpecification?.outerGreaseResistant}
                  />
                  <StatusText>Outer Grease Resistant</StatusText>
               </FlexContainer>
            </div>
         </Container>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   width: 90%;
   padding-bottom: 28px;
   margin-bottom: 4rem;

   border-bottom: 1px solid #ececec;

   h3 {
      font-size: 28px;
      color: #555b6e;
   }
`
const Container = styled(FlexContainer)`
   width: 70%;
   justify-content: space-between;
`
const StatusText = styled.p`
   font-weight: bold;
   width: 90%;
   font-size: 14px;
   margin-left: 12px;

   color: #555b6e;
`

const Lead = styled.p`
   font-size: 10px;
   font-weight: bold;
   color: #555b6e;
`
