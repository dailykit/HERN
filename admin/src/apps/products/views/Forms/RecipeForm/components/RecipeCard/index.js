import React from 'react'
import { Text, Checkbox, ComboButton } from '@dailykit/ui'
import { Container, Flex } from '../styled'
import { StyledTable, Preview, Pill } from './styled'
import { EyeIcon } from '../../../../../assets/icons'
import { RecipeContext } from '../../../../../context/recipe'

const RecipeCard = ({ state, openTunnel }) => {
   const { recipeDispatch } = React.useContext(RecipeContext)

   // Handlers
   const preview = () => {
      recipeDispatch({
         type: 'PREVIEW',
         payload: {
            title: 'Moonlight',
            img: 'https://source.unsplash.com/1600x900/?paper',
         },
      })
      openTunnel(9)
   }

   return (
      <Container top="32" bottom="32">
         <Text as="title">Select Recipe Card Template</Text>
         <Container top="16">
            <StyledTable>
               <thead>
                  <tr>
                     <th></th>
                     <th>Template name</th>
                     <th>Template type</th>
                     <th>Paper size</th>
                     <th>Print type</th>
                     <th></th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td>
                        <Checkbox
                           checked={true}
                           onChange={val => console.log(val)}
                        />
                     </td>
                     <td>
                        <Flex direction="column">
                           <Text as="p">Moonlight</Text>
                           <Preview>
                              <img src="https://source.unsplash.com/200x150/?paper" />
                           </Preview>
                        </Flex>
                     </td>
                     <td>
                        <Flex justify="flex-start">
                           <Pill active>Colored</Pill>
                           <Pill>Non-colored</Pill>
                        </Flex>
                     </td>
                     <td>
                        <Flex justify="flex-start">
                           <Pill active>A4</Pill>
                           <Pill>A3</Pill>
                           <Pill>Letter</Pill>
                        </Flex>
                     </td>
                     <td>
                        <Flex justify="flex-start">
                           <Pill active>Image</Pill>
                           <Pill>PDF</Pill>
                        </Flex>
                     </td>
                     <td>
                        <ComboButton type="ghost" onClick={() => preview()}>
                           <EyeIcon />
                           Preview
                        </ComboButton>
                     </td>
                  </tr>
               </tbody>
            </StyledTable>
         </Container>
      </Container>
   )
}

export default RecipeCard
