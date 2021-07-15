import React from 'react'
import { Spacer, Text } from '@dailykit/ui'
import { useLocation } from 'react-router-dom'

import { Wrapper, Sidebar, Content } from './styled'
import { isEmpty } from 'lodash'

export const ScrollSection = ({ height, width, children }) => {
   return (
      <Wrapper height={height} width={width}>
         {children}
      </Wrapper>
   )
}

const Aside = ({ links = [] }) => {
   return (
      <Sidebar>
         <Navbar links={links} />
      </Sidebar>
   )
}

const Main = ({ children }) => {
   return (
      <Content>
         <div>{children}</div>
      </Content>
   )
}

const Section = ({ hash, title, children }) => {
   return (
      <section id={hash}>
         <Text as="h2">{title}</Text>
         <Spacer size="16px" />
         <main>{children}</main>
      </section>
   )
}

const Navbar = ({ links = {} }) => {
   const location = useLocation()
   const [active, setActive] = React.useState('')

   React.useEffect(() => {
      setActive(location.hash)
   }, [location.hash])

   return (
      <ul>
         {Object.keys(links).map((key, index) => (
            <li key={key + index}>
               <a
                  href={`#${key}`}
                  className={active === `#${key}` ? 'active' : ''}
               >
                  {key}
               </a>
               {!isEmpty(links[key]) && (
                  <ul>
                     {links[key].map((node, index) => (
                        <li key={node + index} title={node}>
                           <a
                              href={`#${node}`}
                              className={active === `#${node}` ? 'active' : ''}
                           >
                              {node}
                           </a>
                        </li>
                     ))}
                  </ul>
               )}
            </li>
         ))}
      </ul>
   )
}

ScrollSection.Aside = Aside
ScrollSection.Main = Main
ScrollSection.Section = Section
