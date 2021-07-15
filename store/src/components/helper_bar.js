import tw, { styled, css } from 'twin.macro'

export const HelperBar = styled.div(
   ({ type }) => css`
      ${tw`py-2 h-auto w-full flex flex-col items-center px-3 rounded mb-3`}
      ${typePicker(type)}
   `
)

const Button = styled.button(
   () => css`
      ${tw`mt-1 border py-1 px-2 rounded text-sm`}
   `
)

const Title = styled.h4`
   ${tw`text-center text-lg`}
`

const SubTitle = styled.h5`
   ${tw`text-center`}
`

HelperBar.Button = Button
HelperBar.Title = Title
HelperBar.SubTitle = SubTitle

const typePicker = type => {
   switch (type) {
      case 'info':
         return css`
            ${tw`bg-indigo-200 text-indigo-800`}
            button {
               ${tw`border-indigo-800 hover:bg-indigo-300`}
            }
         `
      case 'success':
         return css`
            ${tw`bg-green-200 text-green-800`}
            button {
               ${tw`border-green-800 hover:bg-green-300`}
            }
         `
      case 'danger':
         return css`
            ${tw`bg-red-200 text-red-800`}
            button {
               ${tw`border-red-800 hover:bg-red-300`}
            }
         `
      case 'warning':
         return css`
            ${tw`bg-orange-200 text-orange-800`}
            button {
               ${tw`border-orange-800 hover:bg-orange-300`}
            }
         `
      default:
         return css`
            ${tw`bg-indigo-200 text-indigo-800`}
            button {
               ${tw`border-indigo-800 hover:bg-indigo-300`}
            }
         `
   }
}
