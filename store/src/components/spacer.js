import tw, { styled, css } from 'twin.macro'

const sizeSelector = size => {
   switch (size) {
      case 'xxs':
         return tw`h-1`
      case 'xm':
         return tw`h-2`
      case 'sm':
         return tw`h-3`
      case 'base':
         return tw`h-4`
      case 'md':
         return tw`h-5`
      case 'lg':
         return tw`h-6`
      case 'xl':
         return tw`h-8`
      case '2xl':
         return tw`h-10`
      case '3xl':
         return tw`h-12`
      case '4xl':
         return tw`h-16`
      default:
         return tw`h-4`
   }
}

export const Spacer = styled.div(
   ({ size }) => css`
      ${sizeSelector(size)}
   `
)
