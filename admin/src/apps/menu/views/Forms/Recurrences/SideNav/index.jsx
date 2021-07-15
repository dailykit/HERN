import React from 'react'
import { Text } from '@dailykit/ui'
import { Link, animateScroll as scroll } from 'react-scroll'
import { rrulestr } from 'rrule'

import { Container } from '../styled'
import { StyledContainer, List } from './styled'

const SideNav = ({ recurrences }) => {
   return (
      <StyledContainer>
         <Container paddingY="32" paddingX="8">
            <List>
               {recurrences?.map((recurrence, index) => (
                  <Link
                     // to={`recurrence-${recurrence.id}`}
                     to="recurrence-2"
                     activeClass="active"
                     spy={true}
                     smooth={true}
                     offset={-70}
                     duration={500}
                     key={recurrence.id}
                  >
                     <Text as="title">Recurrence {index + 1}</Text>
                     <Text as="subtitle">
                        {rrulestr(recurrence.rrule).toText()}
                     </Text>
                  </Link>
               ))}
            </List>
         </Container>
      </StyledContainer>
   )
}

export default SideNav
