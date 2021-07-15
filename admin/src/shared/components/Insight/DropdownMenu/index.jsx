import { Flex, useOnClickOutside } from '@dailykit/ui'
import React, { useRef } from 'react'
import styled from 'styled-components'

import { ChevronDown } from '../../../assets/icons'

/**
 *
 * @param {{title: string, withIcon: boolean, show: boolean, shiftLeft: boolean}} param0
 */
export const Dropdown = ({
   title,
   children,
   withIcon,
   show,
   setShow,
   fromRight,
}) => {
   const ref = useRef()
   useOnClickOutside(ref, () => setShow(false))

   return (
      <div style={{ position: 'relative' }} ref={ref}>
         <DropdownButton onClick={() => setShow(!show)}>
            <p>{title}</p>

            {withIcon && <ChevronDown color="#888d9d" />}
         </DropdownButton>

         {show && <Box fromRight={fromRight}>{children}</Box>}
      </div>
   )
}

export const DropdownItem = ({
   leftIcon,
   rightIcon,
   onClick,
   children,
   width,
}) => {
   return (
      <StyledItem onClick={onClick} style={{ width }}>
         {leftIcon}
         <Flex margin="0 8px" width="100%">
            {children}
         </Flex>
         {rightIcon}
      </StyledItem>
   )
}

const DropdownButton = styled.button`
   padding: 8px 16px;
   color: #00a7e1;
   background-color: #fff;
   border: 1px solid #f3f3f3;
   border-radius: 2px;
   font-size: 18px;
   font-weight: 500;

   display: flex;
   justify-content: space-between;
   align-items: center;
   cursor: pointer;

   svg {
      margin-left: 4px;
   }
`
const Box = styled.div`
   background-color: #fff;
   padding: 8px;
   border-radius: 2px;
   box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
   border: 1px solid #f3f3f3;
   min-width: 18vw;

   position: absolute;
   top: 90%;
   right: ${({ fromRight }) => (fromRight ? '0%' : null)};
   z-index: 12;
`

const StyledItem = styled.div`
   display: flex;
   align-items: center;
   border-radius: 2px;

   color: #888d9d;
   padding: 12px;
   min-width: 10vw;
   cursor: pointer;

   &:hover {
      background-color: #f3f3f3;
   }
`
