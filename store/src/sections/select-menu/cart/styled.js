import tw, { styled, css } from 'twin.macro'

export const CartProducts = styled.ul`
   ${tw`space-y-2`}
   overflow-y: auto;
   max-height: 257px;
`

export const SaveButton = styled.button(
   ({ disabled, bg }) => css`
      ${tw`
      h-10
      w-full
      rounded
      text-white
      text-center
      bg-green-500
   `}
      ${bg && `background-color: ${bg};`}
      ${disabled &&
      tw`
         h-10
         w-full
         rounded
         text-gray-600
         text-center
         bg-gray-200
         cursor-not-allowed 
      `}
   `
)

export const SaveGhostButton = styled.button(
   ({ disabled }) => css`
      ${tw`
      h-10
      w-full
      rounded
      text-center
      text-green-600
      hover:bg-gray-100
   `}
      ${disabled &&
      tw`
         h-10
         w-full
         rounded
         text-center
         text-gray-600
         cursor-not-allowed 
      `}
      transition: all 0.3s ease-in-out;
      ${!disabled &&
      css`
         :hover {
            transform: translateY(-4px);
         }
      `}
   `
)
