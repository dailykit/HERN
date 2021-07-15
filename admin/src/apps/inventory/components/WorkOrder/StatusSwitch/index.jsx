import React, { useState } from 'react'
import styled from 'styled-components'

export default function StatusSwitch({ currentStatus, onSave }) {
   const [showSwitch, setShowSwitch] = useState(false)
   const [status, setStatus] = useState(currentStatus)

   const showIcon = () => {
      if (status === 'PENDING') return <PendingIcon />
      if (status === 'COMPLETED') return <CompletedIcon />
      if (status === 'CANCELLED') return <CancelIcon />
   }

   return (
      <StyledStatusSwitch
         onClick={() => setShowSwitch(!showSwitch)}
         currentStatus={status}
      >
         {showIcon()} <span style={{ marginLeft: '5px' }}>{status}</span>
         {showSwitch && (
            <>
               <Options>
                  {status !== 'COMPLETED' && (
                     <Option
                        onClick={() => {
                           setStatus('COMPLETED')
                           onSave('COMPLETED')
                           setShowSwitch(false)
                        }}
                        color="#53C22B"
                     >
                        <CompletedIcon />
                        <span style={{ marginLeft: '5px' }}>COMPLETED</span>
                     </Option>
                  )}
                  {status !== 'CANCELLED' && (
                     <Option
                        onClick={() => {
                           setStatus('CANCELLED')
                           onSave('CANCELLED')
                           setShowSwitch(false)
                        }}
                        color="#f52d2d"
                     >
                        <CancelIcon />
                        <span style={{ marginLeft: '5px' }}>CANCELLED</span>
                     </Option>
                  )}

                  {status !== 'PENDING' && (
                     <Option
                        onClick={() => {
                           setStatus('PENDING')
                           onSave('PENDING')
                           setShowSwitch(false)
                        }}
                        color="#e6c02a"
                     >
                        <PendingIcon />{' '}
                        <span style={{ marginLeft: '5px' }}>PENDING</span>
                     </Option>
                  )}
               </Options>
            </>
         )}
      </StyledStatusSwitch>
   )
}

const StyledStatusSwitch = styled.div`
   padding: 20px;
   position: relative;
   user-select: none;
   width: 12vw;
   margin-left: auto;
   border-radius: 5px;
   background-color: ${({ currentStatus }) => {
      if (currentStatus === 'PENDING') return '#e6c02a'
      if (currentStatus === 'COMPLETED') return '#53C22B'
      if (currentStatus === 'CANCELLED') return '#f52d2d'

      return 'grey'
   }};

   color: #fff;

   &:hover {
      cursor: pointer;
   }

   display: flex;
   align-items: center;
`

const Options = styled.div`
   width: 12vw;
   display: flex;
   margin-left: auto;
   flex-direction: column;
   align-items: center;
   justify-content: space-between;
   position: absolute;
   left: 0;
   top: 110%;
   z-index: 2;

   animation: fadeIn 0.2s ease-in;

   @keyframes fadeIn {
      from {
         margin-top: -10px;
         opacity: 0;
      }
      to {
         margin-top: 0;
         opacity: 1;
      }
   }
`

const Option = styled.div`
   user-select: none;
   width: 100%;
   background-color: ${({ color }) => color};
   padding: 20px;
   border-radius: 5px;
   margin: 7px 0;
   color: #fff;
   &:hover {
      cursor: pointer;
   }

   display: flex;
   align-items: center;
`

const PendingIcon = () => (
   <svg
      width="20"
      height="19"
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
   >
      <path
         d="M7.83234 18.9557C6.45637 18.7111 5.09525 18.1406 3.95066 17.3286L3.71362 17.1604L4.53676 16.3373L5.3599 15.5142L5.55446 15.6393C6.27108 16.1004 7.00072 16.4123 7.8115 16.6041C7.96046 16.6394 8.10343 16.6727 8.12921 16.6782L8.17609 16.6883V17.8441V19L8.11879 18.9982C8.08728 18.9972 7.95838 18.9781 7.83234 18.9557Z"
         fill="white"
      />
      <path
         d="M10.8428 17.8443V16.6885L10.8896 16.6784C11.1176 16.6296 11.5163 16.5286 11.6865 16.4765C12.1835 16.3244 12.8077 16.042 13.2699 15.7601C13.3959 15.6832 13.5247 15.605 13.556 15.5863L13.613 15.5522L14.4258 16.3646C14.8729 16.8115 15.2386 17.1837 15.2386 17.1918C15.2386 17.2143 14.8634 17.4772 14.5824 17.6515C13.887 18.083 13.085 18.4486 12.3324 18.6773C11.8825 18.8139 11.0458 19.0002 10.8817 19.0002C10.8441 19.0002 10.8428 18.9596 10.8428 17.8443Z"
         fill="white"
      />
      <path
         d="M16.3227 14.4905L15.5029 13.6706L15.6281 13.4761C16.0891 12.7595 16.4011 12.0298 16.5929 11.2191C16.6281 11.0701 16.6614 10.9271 16.667 10.9014L16.677 10.8545H17.8433C18.8171 10.8545 19.0095 10.8592 19.0095 10.883C19.0095 10.958 18.9159 11.4413 18.8434 11.7399C18.5942 12.7676 18.2091 13.6903 17.6612 14.5726C17.5082 14.8189 17.1881 15.2822 17.1579 15.3008C17.1494 15.3061 16.7735 14.9415 16.3227 14.4905Z"
         fill="white"
      />
      <path
         d="M1.6517 15.0167C0.949361 14.0129 0.467399 12.943 0.17562 11.7399C0.103207 11.4413 0.00952148 10.958 0.00952148 10.883C0.00952148 10.8592 0.201986 10.8545 1.17579 10.8545H2.34206L2.3521 10.9014C2.40553 11.1509 2.50353 11.5332 2.56314 11.7247C2.72674 12.2503 3.02755 12.9006 3.3282 13.3786C3.40501 13.5008 3.46786 13.6086 3.46786 13.6183C3.46786 13.628 3.09952 14.0042 2.64932 14.4543L1.83078 15.2726L1.6517 15.0167Z"
         fill="white"
      />
      <path
         d="M0.000482425 8.1512C0.00484909 8.13115 0.0278222 7.99756 0.0515322 7.85433C0.243266 6.69608 0.710207 5.47131 1.3581 4.42725C1.53247 4.14625 1.79534 3.771 1.81781 3.771C1.82594 3.771 2.20286 4.14144 2.65541 4.5942L3.47822 5.4174L3.4442 5.47441C3.42549 5.50576 3.34727 5.63454 3.27039 5.76058C2.9885 6.22273 2.70608 6.8469 2.55399 7.34391C2.5019 7.51413 2.40086 7.91283 2.35205 8.14079L2.34201 8.18766H1.16728C0.0593456 8.18766 -0.00700757 8.18559 0.000482425 8.1512Z"
         fill="white"
      />
      <path
         d="M16.6668 8.14052C16.4503 7.1294 16.1414 6.36382 15.6279 5.56577L15.5027 5.37122L16.3362 4.53766L17.1698 3.7041L17.338 3.94114C18.1587 5.09813 18.7436 6.50272 18.9673 7.85406C18.991 7.99729 19.014 8.13089 19.0183 8.15094C19.0258 8.18532 18.9595 8.1874 17.8515 8.1874H16.6768L16.6668 8.14052Z"
         fill="white"
      />
      <path
         d="M4.52258 2.69023L3.69189 1.85926L3.80383 1.77705C4.85551 1.00456 5.99348 0.475667 7.26993 0.166097C7.58631 0.0893686 8.05296 0 8.13722 0C8.17482 0 8.17618 0.0410479 8.17618 1.17668V2.35337L8.12931 2.36341C7.90135 2.41223 7.50265 2.51326 7.33243 2.56535C6.75042 2.74345 6.01007 3.09384 5.52556 3.4205C5.4599 3.46477 5.39428 3.50553 5.37972 3.51109C5.36475 3.51681 4.99285 3.16066 4.52258 2.69023Z"
         fill="white"
      />
      <path
         d="M13.3532 3.33239C12.8879 3.038 12.2069 2.72459 11.6865 2.56535C11.5163 2.51326 11.1176 2.41223 10.8896 2.36341L10.8428 2.35337V1.17668C10.8428 0.0410479 10.8441 0 10.8817 0C10.966 0 11.4326 0.0893687 11.749 0.166097C12.9521 0.457875 14.022 0.939838 15.0258 1.64218L15.2817 1.82126L14.453 2.65022C13.9972 3.10614 13.6148 3.47877 13.6033 3.47828C13.5918 3.47779 13.4792 3.41214 13.3532 3.33239Z"
         fill="white"
      />
   </svg>
)

const CancelIcon = () => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
   </svg>
)

const CompletedIcon = () => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <polyline points="20 6 9 17 4 12" />
   </svg>
)
