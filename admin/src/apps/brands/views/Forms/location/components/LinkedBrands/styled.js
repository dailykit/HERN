import styled from 'styled-components'

export const StyledContainerHead = styled.div`
   display: flex;
   flex-direction: column;
   gap: 1rem;
`
export const StyledContainer = styled.div`
   display: grid;
   grid-gap: 2rem;
   grid-template-columns: auto auto auto auto;
   @media (max-width: 1250px) {
      grid-template-columns: auto auto auto;
   }
   @media (max-width: 900px) {
      grid-template-columns: auto auto;
   }
   @media (max-width: 567px) {
      grid-template-columns: auto;
   }
`
export const StyledHeader = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
`
export const StyledCard = styled.div`
   display: flex;
   flex-direction: column;
`
export const StyledContent = styled.div`
   display: flex;
   width: 17rem;
   gap: 0.5rem;
   height: auto;
   flex-direction: column;
   padding: 0.5rem;
`
export const StyledServiceType = styled.div`
   display: grid;
   grid-template-columns: auto auto auto;
   justify-items: center;
`
export const StyledServiceToggle = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: 0.5em;
`
export const StyledDeliveryService = styled.div`
   display: flex;
   padding: 0.1rem 0.5rem;
   justify-content: space-between;
   align-items: center;
   div {
      font-family: Roboto;
      font-style: normal;
      font-weight: 500;
      font-size: 12px;
      line-height: 11px;
      align-items: center;
      letter-spacing: 0.44px;

      color: #919699;
   }
`
