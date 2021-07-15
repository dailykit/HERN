import React, { useContext, useState } from 'react'
import { Loader, TextButton } from '@dailykit/ui'
import { useQuery } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import styled from 'styled-components'

import { useFilters } from '../../../context/filters'
import { FlexContainer } from '../../../../views/Forms/styled'

import {
   PACKAGE_LENGTH_FILTER_OPTIONS,
   PACKAGE_WIDTH_FILTER_OPTIONS,
} from '../../../graphql'

import { Section, SectionHeader } from './styled'
import { useParams } from 'react-router-dom'

const style = {
   marginTop: '1rem',
}

export default function Sizes() {
   const { dispatch } = useFilters()

   const [selectedOption, setSelectedOption] = useState({
      length: null,
      width: null,
   })

   const handleLengthSelect = e => {
      const selectedOption = e.target.value

      setSelectedOption(option => ({ ...option, length: selectedOption }))
   }

   const handleWidthSelect = e => {
      const selectedOption = e.target.value

      setSelectedOption(option => ({ ...option, width: selectedOption }))
   }

   const applyFilters = () => {
      dispatch({
         type: 'SELECT_OPTION',
         payload: {
            value: selectedOption,
         },
      })
   }

   const clearFilters = () => {
      dispatch({
         type: 'CLEAR_OPTIONS',
      })
   }

   return (
      <Section>
         <SectionHeader>
            <p>Sizes</p>
         </SectionHeader>

         <LengthOptions handleLengthSelect={handleLengthSelect} />
         <WidthOptions handleWidthSelect={handleWidthSelect} />

         {selectedOption.height || selectedOption.width ? (
            <FlexContainer>
               <TextButton style={style} onClick={applyFilters} type="outline">
                  Apply
               </TextButton>

               <TextButton style={style} onClick={clearFilters} type="ghost">
                  Clear
               </TextButton>
            </FlexContainer>
         ) : null}
      </Section>
   )
}

function LengthOptions({ handleLengthSelect }) {
   const { id: categoryId } = useParams()

   const {
      loading: heightsLoading,
      data: {
         packagingHub_packaging_aggregate: { nodes: lengthOptions = [] } = {},
      } = {},
   } = useQuery(PACKAGE_LENGTH_FILTER_OPTIONS, {
      onError: error => {
         toast.error(error.message)
      },
      variables: { categoryId },
   })

   if (heightsLoading) return <Loader />

   return (
      <>
         <h5 style={style}>Length</h5>
         <StyledSelect onChange={handleLengthSelect}>
            <option value="">Choose length...</option>

            {lengthOptions.map(option => (
               <option key={option.id} value={option.length}>
                  {option.length} {option.LWHUnit}
               </option>
            ))}
         </StyledSelect>
      </>
   )
}

function WidthOptions({ handleWidthSelect }) {
   const { id: categoryId } = useParams()
   const {
      loading: widthOptionsLoading,
      data: {
         packagingHub_packaging_aggregate: { nodes: widthOptions = [] } = {},
      } = {},
   } = useQuery(PACKAGE_WIDTH_FILTER_OPTIONS, {
      onError: error => {
         toast.error(error.message)
      },
      variables: { categoryId },
   })

   if (widthOptionsLoading) return <Loader />

   return (
      <>
         <h5 style={style}>Width</h5>
         <StyledSelect onChange={handleWidthSelect}>
            <option value="">Choose width...</option>
            {widthOptions.map(option => (
               <option key={option.id} value={option.width}>
                  {option.width} {option.LWHUnit}
               </option>
            ))}
         </StyledSelect>
      </>
   )
}

const StyledSelect = styled.select`
   border: none;
   font-weight: 500;
   font-size: 14px;
   line-height: 16px;
   color: #555b6e;
   outline: none;

   width: 100%;
   padding: 10px;
   background-color: #fff;
   margin-top: 12px;
`
