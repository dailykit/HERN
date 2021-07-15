import styled from 'styled-components'

export const Container = styled.div`
   color: #555b6e;
   min-width: 400px;
   max-width: 600px;

   * {
      font-size: 14px;
      margin: 0;
   }
`

export const Grid = styled.div`
   display: grid;
   grid-template-columns: repeat(${props => (props.vertical ? 1 : 2)}, 1fr);
   grid-gap: ${props => (props.vertical ? '0px' : '16px')};
`

export const Header = styled.div`
   display: ${props => (props.vertical ? 'none' : 'flex')};
   justify-content: space-between;

   h6 {
      font-size: 12px;
   }
`

export const Rule = styled.hr`
   display: ${props => (props.vertical ? 'none' : 'block')};
   height: 3px;
   background: #555b6e;
`

export const Wrapper = styled.div``

export const Row = styled.div`
   display: ${props => (props.hidden ? 'none' : 'flex')};
   justify-content: space-between;
   padding-left: ${props => (props.inset ? '32px' : '0px')};

   :not(:last-child) {
      border-bottom: 1px solid #555b6e;
   }
   span {
      font-weight: normal;
   }
`

export const Major = styled.div`
   margin-bottom: 8px;
   display: flex;
   align-items: center;
   h3 {
      margin-left: 8px;
      font-size: 16px;
   }
`
