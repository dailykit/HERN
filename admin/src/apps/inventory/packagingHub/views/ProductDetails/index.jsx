import React, { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Loader } from '@dailykit/ui'
import styled from 'styled-components'

import {
   Badge,
   ImageCarousel,
   ProductDescription,
   ProductHeader,
   ProductSpecs,
   CartButton,
} from '../../components'

import { PACKAGING } from '../../graphql'
import { useParams } from 'react-router-dom'

export default function ProductDetailsPage() {
   const { id } = useParams()

   const { data, loading, error } = useQuery(PACKAGING, { variables: { id } })

   if (error)
      return (
         <Wrapper>
            <Header>
               <div />
               <Badge />
            </Header>

            <p>{error.message}</p>
         </Wrapper>
      )

   if (loading) return <Loader />

   const { packagingHub_packaging_by_pk: packaging = {} } = data

   return (
      <>
         <CartButton />
         <Wrapper>
            <h1>HELLO </h1>
            <Header>
               <div />
               <Badge />
            </Header>

            <Main>
               {/* carousel and description */}
               <div style={{ width: '100%' }}>
                  {packaging.assets &&
                  packaging.assets.images &&
                  packaging.assets.images.length ? (
                     <ImageCarousel images={packaging.assets.images} />
                  ) : null}

                  <ProductDescription
                     description={packaging.packagingDescription}
                  />

                  <ProductSpecs product={packaging} />
               </div>

               {/* specs and cta button */}
               <div style={{ width: '100%' }}>
                  <ProductHeader product={packaging} />
               </div>
            </Main>
         </Wrapper>
      </>
   )
}

const Header = styled.div`
   padding-bottom: 2rem;
   display: flex;
   justify-content: space-between;
   align-items: center;

   margin: 0 24px;
`

const Wrapper = styled.div`
   height: 100%;
   width: 100%;
   padding: 2rem;
`

const Main = styled.div`
   margin: 24px;

   display: grid;
   grid-gap: 2rem;
   grid-template-columns: 0.6fr 0.4fr;
   grid-template-rows: 1fr;
`
