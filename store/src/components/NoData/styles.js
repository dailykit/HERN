import styled from 'styled-components'

export const Wrapper = styled.div`
   width: 300px;
   height: 350px;
   border: 4px dashed #dfdfdf;
   box-sizing: border-box;
   border-radius: 16px;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   .title {
      font-family: 'Barlow Condensed';
      font-style: normal;
      font-weight: bold;
      font-size: 27px;
      line-height: 62px;
      letter-spacing: 0.08em;
      color: #dfdfdf;
      text-transform: uppercase;
   }
`
