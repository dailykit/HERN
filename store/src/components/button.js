import tw, { styled, css } from 'twin.macro'

export const Button = styled.button(
   ({ disabled, bg }) => css`
      ${tw`h-10 rounded px-8 text-white bg-green-600`}
      ${bg && `background-color: ${bg};`}
      ${disabled && tw`cursor-not-allowed bg-gray-300`}
      transition: all 0.3s ease-in-out;
      :hover {
         ${Boolean(!disabled) &&
         css`
            ${tw`shadow-lg`};
            transform: translateY(-4px);
         `}
      }
   `
)
