import styled from 'styled-components'

export const Wrapper = styled.div`
   padding-top: 16px;
   [data-reach-tab-list] {
      padding: 0 16px;
   }
   [data-reach-tab-panel] {
      padding: 0;
      height: calc(100vh - 154px);
   }
`

export const StyledHeader = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
`

export const Label = styled.label`
   color: #6f6565;
   font-size: 13px;
   font-weight: 500;
   letter-spacing: 0.6px;
   text-transform: uppercase;
`
// export const CouponCard = styled.div`
//    display: flex;
//    align-items: center;
//    width: 100%;
// `

export const CouponCard = styled.div`
   background: #ffffff;
   box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.08);
   height: 66px;
   margin-bottom: 16px;
   grid-template-columns: 8% auto 12% 8%;
   display: grid;
   clip-path: polygon(
      10% 20%,
      12% 0,
      100% 0,
      100% 100%,
      12% 100%,
      10% 80%,
      8% 100%,
      0 100%,
      0 0,
      8% 0
   );
   background: #f9f9f9;
   border-radius: 10px;
   align-items: center;
`
export const StyledIcon = styled.div`
   display: flex;
   justify-content: center;
`
export const StyledText = styled.div`
   left: 7%;
   position: relative;
   font-family: 'Roboto';
   font-style: normal;
   font-weight: 500;
   font-size: 18px;
   line-height: 20px;

   display: flex;
   align-items: center;
   letter-spacing: 0.44px;

   color: #202020;
`
export const StyledDelete = styled.div`
   display: flex;
   cursor: pointer;
   align-items: center;
   justify-content: center;
`

// export const CardContext = styled.div`
//    display: grid;
//    position: absolute;
//    align-items: center;
//    width: 95%;
//    grid-template-columns: 80px auto 1rem 10px;
// `
// export const Card1 = styled.div`
//    left: 3.5%;
//    position: relative;
// `
// export const Card2 = styled.div`
//    left: 9.5%;
//    position: relative;
//    font-family: 'Roboto';
//    font-style: normal;
//    font-weight: 500;
//    font-size: 20px;
//    line-height: 24px;

//    display: flex;
//    align-items: center;
//    letter-spacing: 0.44px;

//    color: #202020;
// `
// export const Card3 = styled.div`
//    left: 30%;
//    position: relative;
// `
// export const Card4 = styled.div`
//    left: 50%;
//    position: relative;
// `
