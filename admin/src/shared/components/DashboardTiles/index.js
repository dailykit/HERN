import React from 'react'
import * as styles from './styled'
import { Context, ContextualMenu } from '@dailykit/ui'
import { Children } from 'react'
const Tiles = ({ children }) => {
   return (
      <>
         <styles.Tiles>{children}</styles.Tiles>
      </>
   )
}
//tile
const Tile = ({ children, columns, hasChart = false }) => {
   return (
      <>
         <styles.Tile columns={columns} hasChart={hasChart}>
            {children}
         </styles.Tile>
      </>
   )
}

//tile head (title and full screen)
const Head = ({ children, title, svg: Svg }) => {
   return (
      <>
         <styles.Head>
            <div style={{ display: 'flex', alignItems: 'center' }}>
               {Svg && (
                  <div style={{ marginRight: '5px' }}>
                     <Svg />
                  </div>
               )}
               <span
                  style={{
                     fontWeight: 400,
                     fontSize: '16px',
                     color: '#000',
                     lineHeight: '19px',
                     fontStyle: 'Roboto',
                  }}
               >
                  {title}
               </span>
            </div>
            {children}
         </styles.Head>
      </>
   )
}

//heading action
const Actions = ({ children }) => {
   const count = Children.count(children)
   const childArray = Children.toArray(children)
   // count => number of child
   // childArray all child in an array
   return (
      <styles.Actions>
         {count < 3 ? (
            children
         ) : (
            <ContextualMenu title="More options">
               {children.map((action, index) => {
                  return (
                     <Context
                        key={index}
                        title={action.props.title}
                        handleClick={() => action.props.onClick()}
                     />
                  )
               })}
            </ContextualMenu>
         )}
      </styles.Actions>
   )
}

//tile head action
const Action = ({ children, onClick, title }) => {
   console.log('this is action children', children)
   return (
      <styles.Action onClick={onClick} title={title}>
         {children}
      </styles.Action>
   )
}

//tile body (count chart)
const Body = ({ children }) => {
   return (
      <>
         <styles.Body>{children}</styles.Body>
      </>
   )
}

//title counts
const Counts = ({ children }) => {
   console.log('this is counts', children)
   return <styles.Counts>{children}</styles.Counts>
}

// count beacome part of body
const Count = ({ currency, append, children, subCount, subCountColor }) => {
   const number = children

   const nFormatter = num => {
      if (num >= 1000000) {
         return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M'
      }
      if (num >= 1000) {
         return (num / 1000).toFixed(2).replace(/\.00$/, '') + 'K'
      }
      return num
   }
   const newChildren = currency
      ? append
         ? nFormatter(number) + ' ' + currency
         : currency + nFormatter(number)
      : nFormatter(number)
   return (
      <>
         <styles.Count title={children}>
            {newChildren}{' '}
            {subCount && (
               <SubCount subCountColor={subCountColor}>{subCount}</SubCount>
            )}
         </styles.Count>
      </>
   )
}

// use to show charts
const Chart = ({ children, title }) => {
   return (
      <>
         <styles.Chart title={title}>{children}</styles.Chart>
      </>
   )
}
const SubCount = ({ children, subCountColor }) => {
   return (
      <styles.SubCount subCountColor={subCountColor}>
         {children}
      </styles.SubCount>
   )
}
Tile.Chart = Chart
Tile.Head = Head
Tile.Head.Actions = Actions
Tile.Head.Action = Action
Tile.Body = Body
Tile.Counts = Counts
Tile.Count = Count
export { Tiles, Tile }
