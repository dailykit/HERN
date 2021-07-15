import React from 'react'
import styled from 'styled-components'
import { useTabs } from '../../../../shared/providers'

export default function Card({ category }) {
   const { addTab } = useTabs()

   const openProductsView = () => {
      addTab(category.name, `/inventory/packaging-hub/products/${category.id}`)
   }

   return (
      <StyledCard assets={category.assets} onClick={openProductsView}>
         <h4>{category.name}</h4>
         <button onClick={openProductsView} type="button">
            {'>>'}
         </button>

         <OverLay />
      </StyledCard>
   )
}

const OverLay = styled.div`
   width: 100%;
   height: 100%;
   position: absolute;
   background-color: rgba(0, 0, 0, 0.7);
   top: 0;
   left: 0;

   &:hover {
      background-color: rgba(0, 0, 0, 0.5);
   }

   z-index: 2;
`

const StyledCard = styled.div`
   flex: 1;
   height: 250px;
   padding: 40px;

   display: flex;
   flex-direction: column;
   justify-content: flex-end;

   cursor: pointer;

   position: relative;

   background: ${({ assets: { images = [] } }) => {
      const img = images.find(img => img.isFeatured)
      if (img.url) return `url(${img.url})`
   }};

   background-repeat: no-repeat;
   background-size: contain;
   background-position: center;

   h4 {
      font-weight: 500;
      font-size: 28px;
      line-height: 27px;

      color: #ffffff;
      z-index: 4;
   }

   button {
      position: absolute;
      color: #fff;
      background-color: transparent;
      border: 0;

      bottom: 2rem;
      right: 2rem;
      z-index: 4;
   }
`
