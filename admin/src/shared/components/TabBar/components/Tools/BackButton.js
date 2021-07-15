import React from 'react'
import { IconButton, RoundedCloseIcon } from '@dailykit/ui'
import styled from 'styled-components'
import { ChevronLeft } from '../../../../assets/icons'

const BackButton = ({ setOpen, setIsMenuOpen }) => {
   return (
      <Wrapper
         container
         alignItems="center"
         justifyContent="space-between"
         padding="8px 16px"
      >
         <p onClick={() => setOpen(null)}>
            <ChevronLeft size={12} color="#367bf5" />
            <span>Go back</span>
         </p>
         <IconButton
            type="ghost"
            onClick={() => {
               setIsMenuOpen(false)
               setOpen(null)
            }}
         >
            <RoundedCloseIcon />
         </IconButton>
      </Wrapper>
   )
}

export default BackButton

const Wrapper = styled.section`
   display: none;
   align-items: center;
   justify-content: space-between;
   padding: 0px 12px;
   > p {
      display: block;
      margin-right: auto;
      > span {
         color: #367bf5;
         font-style: normal;
         font-weight: 500;
         font-size: 14px;
         text-transform: uppercase;
         margin-left: 4px;
      }
   }

   @media only screen and (max-width: 767px) {
      display: flex;
   }
`
