import styled from 'styled-components'

export const TableHeader = styled.div`
   display: grid;
   grid-template-columns: 200px repeat(8, 160px);
   font-weight: 500;
   font-size: 14px;
   line-height: 19px;
   color: #555b6e;
   margin-bottom: 8px;
`

export const TableRecord = styled.div`
   display: grid;
   grid-template-columns: 200px 160px 1fr;
   font-weight: 500;
   font-size: 16px;
   line-height: 19px;
   color: #555b6e;
   border: 1px solid #ececec;
   padding: 2px;
   padding-left: 0px;
   align-items: start;
   margin-bottom: 16px;

   .action {
      cursor: pointer;

      svg {
         margin-right: 8px;
      }
   }
`
export const StyledInsideSectionTab = styled.div`
   display: flex;
   position: relative;
   flex-direction: column;
   width: 100%;
   height: 111%;
   justify-content: space-between;
   padding: 12px 12px;
`
export const StyledTabListHeading = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding-bottom: 8px;
   div {
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 26px;
      line-height: 16px;
      letter-spacing: 0.32px;
      color: #919699;
   }
`
export const StyledSectionTop = styled.div`
   display: flex;
   position: relative;
   justify-content: space-between;
`
export const SectionTabDay = styled.div`
   position: relative;
   display: flex;
   font-family: Roboto;
   font-style: normal;
   font-weight: 500;
   font-size: 17px;
   line-height: 18px;
   text-align: left;
   color: #202020;
   flex-basis: 90%;
`
export const SectionTabDelete = {
   display: 'flex',
   alignItems: 'flex-start',
   width: 'auto',
}

export const StyledSectionBottom = styled.div`
   display: flex;
   position: relative;
   justify-content: space-between;
   align-items: center;
`
export const SectionTabLink = {
   padding: '0px',
   fontFamily: 'Roboto',
   fontStyle: 'normal',
   fontWeight: ' bold',
   fontSize: ' 15px',
   lineHeight: ' 8px',

   color: '#367BF5',
}
