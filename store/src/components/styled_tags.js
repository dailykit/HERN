import tw, { styled } from 'twin.macro'

export const StyledArticle = styled.div`
   h2,
   h3 {
      ${tw`text-3xl text-gray-700 py-2 my-3 border-b-2 border-gray-200 `}
   }
   p {
      ${tw`mb-4`}
   }
   ul {
      ${tw`pl-6 py-3 list-disc`}
   }
`
