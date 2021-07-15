import styled from 'styled-components'

export const StyledCustomerCard = styled.div`
   background: #ffffff;
   border: 1px solid #ececec;
   box-sizing: border-box;
   margin: 0 16px 16px 0;
`
export const CustomerInfo = styled.div`
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   padding: 16px;
`
export const CustomerWallet = styled.div`
   border-top: 1px solid #ececec;
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   padding: 16px;
`
export const StyledDiv = styled(CustomerWallet)``
