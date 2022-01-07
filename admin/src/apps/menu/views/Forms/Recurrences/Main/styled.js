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
`
export const StyledSectionTab = {
   background: '#F9F9F9',
   border: '1px solid #F3F3F3',
   boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
   borderRadius: '4px',
}
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
   font-size: 18px;
   line-height: 17px;

   color: #202020;
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
