import React from 'react'
import styled from 'styled-components'
import { Loader } from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'

import { CATEGORIES } from '../graphql'

import Card from './Card'

export default function Categories() {
   const { data, error, loading } = useQuery(CATEGORIES)

   if (error)
      return (
         <Wrapper>
            <p>{error.message}</p>
         </Wrapper>
      )

   if (loading) return <Loader />

   const { packagingHub_packagingType: categories } = data

   return (
      <Wrapper>
         <h2>Categories</h2>

         <Cards>
            {categories.map(category => {
               return <Card key={category.id} category={category} />
            })}
         </Cards>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   margin-top: 40px;

   position: relative;

   h2 {
      font-weight: 500;
      font-size: 40px;
      line-height: 38px;
      color: #555b6e;
      margin-left: 3rem;
      margin-bottom: 32px;
   }
`

const Cards = styled.div`
   display: grid;
   grid-template-columns: repeat(3, 1fr);
   grid-template-rows: auto;

   grid-gap: 4px;
`
