import styled from 'styled-components'

export const CompanyList = styled.div`
   display: grid;
   grid-template-columns: auto auto;
   grid-gap: 32px;
   justify-items: center;
   justify-content: center;
`
export const CompanyCard = styled.div`
   background: #ffffff;
   border: ${props =>
      props.active ? `2px solid #367BF5` : `1px solid #f3f3f3 `};
   box-sizing: border-box;
   box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.08);
   border-radius: 4px;
   height: 130px;
   width: 220px;
   display: flex;
   align-items: center;
   justify-content: center;
   flex-direction: column;
   gap: 12px;

   > img {
      width: 40px;
      height: 40px;
      border: 2px solid #f3f3f3;
      box-sizing: border-box;
      border-radius: 30px;
   }
   > div {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 500;
      font-size: 18px;
      line-height: 18px;

      color: #555b6e;
   }
`
export const OptionList = styled.div`
   display: flex;
   font-family: 'Roboto';
   font-style: normal;
   font-weight: 500;
   font-size: 16px;
   line-height: 18px;
   flex-direction: column;
   color: #555b6e;
`
export const StyledText = styled.div`
   height: 44px;
   display: flex;
   align-items: center;
   padding: 0 16px;
   background: ${props => (props.active ? `#f3f3f3` : `#ffffff `)};
   :hover {
      background: #f3f3f3;
   }
`
