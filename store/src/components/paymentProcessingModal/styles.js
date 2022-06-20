import styled from 'styled-components'
export const Wrapper = styled.div`
   .action_url {
      display: block;
      text-decoration: underline;
   }
   .ant-result {
      padding: 2.5rem 2rem;
   }
   .ant-result-icon {
      margin: 0;
   }
   .ant-result-success .ant-result-icon > .anticon {
      color: linear-gradient(228.17deg, #7ab6d3 0.03%, #294460 95.55%);
   }
   .ant-spin .ant-spin-dot {
      width: 1em;
      height: 1em;
      .ant-spin-dot-item {
         background-color: rgb(109 40 217);
         width: 1rem;
         height: 1rem;
      }
   }
   .payment_status_loader {
      max-width: 300px;
      max-height: 300px;
      margin: 0 auto;
   }
   .qr_code_card {
      display: flex;
      flex-direction: column;
      border-radius: 20px;
      position: relative;
   }
   .qr_code_card .msg {
      font-weight: 700;
      font-size: 32px;
      line-height: 42px;
      letter-spacing: 0.04em;
      text-transform: capitalize;
      margin: 40px auto 30px;
   }
   .qr_code_card .qr_code {
      border-radius: 10px;
   }
   .qr_code_card .total_amount {
      font-weight: 400;
      font-size: 40px;
      line-height: 40px;
      letter-spacing: 0.04em;
      text-transform: capitalize;
      margin: 35px auto 40px;
   }
   .authenticateBtn {
      background: #38a169;
      border: none;
   }
   .tryOtherPayment {
      background: #38a169;
      border: none;
   }
`
