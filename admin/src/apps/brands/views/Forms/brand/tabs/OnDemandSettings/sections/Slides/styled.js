import styled from 'styled-components'

export const ImageGrid = styled.ul`
   display: grid;
   grid-gap: 4px;
   grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
   li {
      list-style: none;
   }
`
