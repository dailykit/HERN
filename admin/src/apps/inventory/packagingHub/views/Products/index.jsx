import { useQuery } from '@apollo/react-hooks'
import { Loader } from '@dailykit/ui'
import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Banner } from '../../../../../shared/components'
import { FlexContainer } from '../../../views/Forms/styled'
import { Badge, CartButton, Packagings } from '../../components'
import FiltersProvider from '../../context/filters'
import { Category } from '../../graphql'
import Filters from './Filters'

export default function PackagingHubProducts() {
   const { id } = useParams()

   const { data, loading, error } = useQuery(Category, {
      variables: { id },
   })

   if (error) return <p>{error.message}</p>
   if (loading) return <Loader />

   const { packagingHub_packagingType_by_pk: category = {} } = data

   return (
      <>
         <Banner id="inventory-app-packaging-hub-products-top" />
         <CartButton />
         <Wrapper>
            <Header>
               <h2>{category.name}</h2>
               <Badge />
            </Header>
            <FlexContainer>
               <FiltersProvider>
                  <Filters />
                  <Packagings />
               </FiltersProvider>
            </FlexContainer>
         </Wrapper>
         <Banner id="inventory-app-packaging-hub-products-bottom" />
      </>
   )
}

const Wrapper = styled.div`
   height: 100%;
   width: 100%;
   padding: 2rem;
   padding-left: 0;
`

const Header = styled.div`
   padding-bottom: 2rem;
   padding-left: 2rem;
   display: flex;
   justify-content: space-between;
   align-items: center;

   h2 {
      font-weight: 500;
      font-size: 28px;
      line-height: 27px;

      color: #555b6e;
   }
`
