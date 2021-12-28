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
   .authenticateBtn {
      background: #38a169;
      border: none;
   }
   .tryOtherPayment {
      background: #38a169;
      border: none;
   }
`
