import styled from 'styled-components'
import { FlexContainer } from '../../../../views/Forms/styled'

export const Section = styled.div`
   padding: 16px;
   background-color: #f3f3f3;
   width: 90%;

   border: 1px solid #fff;

   position: relative;

   h5 {
      font-size: 14px;
      font-weight: 500;
      color: #555b6e;
   }

   p {
      font-size: 12px;
      color: #888d9d;
   }
`

export const SectionHeader = styled(FlexContainer)`
   align-items: center;
   justify-content: space-between;
   margin-bottom: 4px;
`
