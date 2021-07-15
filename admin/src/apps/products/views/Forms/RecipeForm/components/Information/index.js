import React from 'react'
import {
   ButtonTile,
   IconButton,
   Tag,
   Text,
   Tunnels,
   Tunnel,
   useTunnel,
   Flex,
} from '@dailykit/ui'
import { EditIcon } from '../../../../../assets/icons'
import { Container, ContainerAction } from '../styled'
import { InformationTunnel } from '../../tunnels'
import { Tooltip } from '../../../../../../../shared/components'

const Information = ({ state }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <InformationTunnel state={state} closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <>
            {state.type ||
            state.cuisine ||
            state.author ||
            state.cookingTime ||
            state.utensils?.length ||
            state.description ? (
               <Container width="100%">
                  <ContainerAction>
                     <IconButton type="ghost" onClick={() => openTunnel(1)}>
                        <EditIcon color="#00A7E1" />
                     </IconButton>
                  </ContainerAction>
                  <Container>
                     <Flex container justifyContent="space-between">
                        <Flex>
                           <Flex container alignItems="center">
                              <Text as="subtitle">Type</Text>
                              <Tooltip identifier="recipe_type" />
                           </Flex>
                           <Text as="p">{state.type}</Text>
                        </Flex>
                        <Flex>
                           <Flex container alignItems="center">
                              <Text as="subtitle">Cuisine</Text>
                              <Tooltip identifier="recipe_cuisine" />
                           </Flex>
                           <Text as="p">{state.cuisine || 'NA'}</Text>
                        </Flex>
                        <Flex>
                           <Flex container alignItems="center">
                              <Text as="subtitle">Author</Text>
                              <Tooltip identifier="recipe_author" />
                           </Flex>
                           <Text as="p">{state.author || 'NA'}</Text>
                        </Flex>
                        <Flex>
                           <Flex container alignItems="center">
                              <Text as="subtitle">Cooking Time</Text>
                              <Tooltip identifier="recipe_cooking_time" />
                           </Flex>
                           <Text as="p">
                              {state.cookingTime
                                 ? `${state.cookingTime} mins.`
                                 : 'NA'}
                           </Text>
                        </Flex>
                     </Flex>
                  </Container>
                  <Container top="16">
                     <Flex container alignItems="center">
                        <Text as="subtitle">Utensils</Text>
                        <Tooltip identifier="recipe_utensils" />
                     </Flex>
                     {state.utensils?.length ? (
                        state.utensils.map(utensil => (
                           <Tag key={utensil}>{utensil}</Tag>
                        ))
                     ) : (
                        <Text as="p"> NA </Text>
                     )}
                  </Container>
                  <Container top="16">
                     <Flex container alignItems="center">
                        <Text as="subtitle">What you'll need</Text>
                        <Tooltip identifier="recipe_not_included" />
                     </Flex>
                     {state.notIncluded?.length ? (
                        state.notIncluded.map(item => (
                           <Tag key={item}>{item}</Tag>
                        ))
                     ) : (
                        <Text as="p"> NA </Text>
                     )}
                  </Container>
                  <Container top="16">
                     <Flex container alignItems="center">
                        <Text as="subtitle">Description</Text>
                        <Tooltip identifier="recipe_description" />
                     </Flex>
                     <Text as="p">{state.description || 'NA'}</Text>
                  </Container>
               </Container>
            ) : (
               <ButtonTile
                  type="primary"
                  size="sm"
                  text="Add Basic Information"
                  onClick={() => openTunnel(1)}
               />
            )}
         </>
      </>
   )
}

export default Information
