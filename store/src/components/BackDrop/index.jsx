import React, { useCallback } from 'react'
import { BackDropDiv } from './styles'

export default function BackDrop({ show, close, children, ...props }) {
   const handleClickBackdrop = useCallback(
      e => {
         const { id } = e.target
         if (id === 'backdrop-div') close()
      },
      [close]
   )
   return (
      <BackDropDiv
         id="backdrop-div"
         show={show}
         onClick={handleClickBackdrop}
         {...props}
      >
         {children}
      </BackDropDiv>
   )
}
