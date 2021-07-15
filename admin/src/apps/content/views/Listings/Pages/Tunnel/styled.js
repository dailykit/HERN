import styled from 'styled-components'

export const TunnelBody = styled.div`
   padding: 32px;
   height: calc(100% - 106px);
   overflow: auto;
`

export const StyledRow = styled.div`
   margin-bottom: 32px;
`

export const SolidTile = styled.button`
   width: 70%;
   display: block;
   margin: 0 auto 16px auto;
   border: 1px solid #cecece;
   padding: 10px 20px;
   border-radius: 2px;
   background-color: #fff;

   &:hover {
      background-color: #f3f3f3;
      cursor: pointer;
   }
`

// export const StyledInputWrapper = styled.div`
//    width: ${props => props.width}px;
//    display: flex;
//    align-items: center;
// `

// export const Grid = styled.div`
//    display: grid;
//    grid-gap: 16px;
//    grid-template-columns: repeat(${props => props.cols || 2}, 1fr);
// `

// export const Flex = styled.div`
//    display: flex;
//    justify-content: space-between;
//    align-items: center;
// `
// export const StyledDiv = styled.div`
//    padding: 16px 0;
//    p .addFact {
//       color: #00a7e1;
//    }
// `

// export const ImageContainer = styled.div`
//    width: 464px;
//    height: 128px;
//    position: relative;
//    margin-bottom: 16px;
//    img {
//       width: 464px;
//       height: 128px;
//       object-fit: cover;
//    }
//    div {
//       position: absolute;
//       padding: 12px;
//       right: 0;
//       left: 0;
//       text-align: right;
//       background: linear-gradient(to bottom, #111, transparent);
//       span {
//          margin-right: 16px;
//          cursor: pointer;
//       }
//    }
// `
// // Made by Deepak Negi
