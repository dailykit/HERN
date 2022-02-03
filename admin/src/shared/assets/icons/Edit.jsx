import React from 'react'
import styled from 'styled-components'

const EditIcon = ({ color = '#919699', className }) => (
   <StyleButton
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      stroke={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
   >
      <path
         d="M8.08515 1.12455C7.69775 0.729316 7.06965 0.729317 6.68225 1.12455L1.30892 6.60652C1.12288 6.79631 1.01837 7.05373 1.01837 7.32215V9.2644H2.92213C3.18523 9.2644 3.43755 9.15778 3.62358 8.96798L8.99692 3.48601C9.38432 3.09078 9.38432 2.44998 8.99692 2.05475L8.08515 1.12455Z"
         fill={color || '#919699'}
      />
      <path
         d="M1.01837 11.204C0.470501 11.204 0.0263672 11.6571 0.0263672 12.2161C0.0263672 12.775 0.470501 13.2281 1.01837 13.2281H11.4344C11.9822 13.2281 12.4264 12.775 12.4264 12.2161C12.4264 11.6571 11.9822 11.204 11.4344 11.204H1.01837Z"
         fill={color || '#919699'}
      />
   </StyleButton>
)

export default EditIcon

const StyleButton = styled.svg`
   &:active {
      stroke: #367bf5;
      > path {
         fill: #367bf5;
      }
   }
`
