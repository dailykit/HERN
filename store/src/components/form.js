import tw, { styled, css } from 'twin.macro'

export const Text = styled.input`
   ${tw`h-10 px-2 border`}
`

export const DisabledText = styled.span`
   ${tw`bg-gray-100 h-10 px-2 border flex items-center`}
`

export const TextArea = styled.textarea`
   ${tw`px-2 pt-2 border`}
`

export const Label = styled.label`
   ${tw`block mb-1 text-gray-700 text-sm tracking-wide`}
`
export const Field = styled.section(
   ({ w, mr, ml }) => css`
      width: ${w || '100%'};
      margin: 0 ${mr || 0} 0 ${ml || 0};
      ${tw`flex flex-col mb-4`}
   `
)

export const Form = { Text, Label, Field, TextArea, DisabledText }
