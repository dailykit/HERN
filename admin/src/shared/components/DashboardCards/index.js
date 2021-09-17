import React, { useState } from 'react'
import * as Styles from './styled'

export const CardContainer = ({ children, bgColor, borderColor }) => {
   return (
      <Styles.CardContainer bgColor={bgColor} borderColor={borderColor}>
         {children}
      </Styles.CardContainer>
   )
}

export const Card = ({ children, onClick }) => {
   const [fill, setFill] = useState("#ffffff")
   return (
      <Styles.Card 
         onClick={onClick} 
         title={onClick && 'Click to view details'} 
         onMouseEnter={() => { setFill("#f9f9f9")}}
         onMouseLeave={() => { setFill("#ffffff")}}> 
         <div>
            <svg
               width="220"
               height="150"
               viewBox="0 0 220 150"
               fill="none"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path
                  d="M44.7598 3H202.042C210.231 3 216.907 9.5677 217.04 17.7556L217.24 30"
                  stroke='#367BF5'
                  stroke-width="5"
               />
               <path
                  d="M0.75 15C0.75 7.12995 7.12994 0.75 15 0.75H45.2693C48.3513 0.75 51.2308 2.285 52.9488 4.84373L57.8916 12.2052C58.9595 13.7958 60.7495 14.75 62.6653 14.75H205C212.87 14.75 219.25 21.1299 219.25 29V135C219.25 142.87 212.87 149.25 205 149.25H15C7.12994 149.25 0.75 142.87 0.75 135V15Z"
                  fill={fill}
                  stroke="#367BF5"
                  stroke-width="1.5"
               />
            </svg>
         </div>
         <div
            style={{
               position: 'absolute',
               top: '0px',
               left: '0px',
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'flex-end',
               width: '100%',
               height: '100%',
            }}
         >
            {children}
         </div>
      </Styles.Card>
   )
}

//wrapper for number of card
export const Cards = ({ children }) => {
   return <Styles.Cards>{children}</Styles.Cards>
}
//card container title
CardContainer.Title = ({ children }) => {
   return (
      <Styles.Title>
         <span>{children}</span>
      </Styles.Title>
   )
}

//card text (title of card)
Card.Text = ({ children }) => {
   return (
      <Styles.Text>
         <span>{children}</span>
      </Styles.Text>
   )
}
//card value
Card.Value = ({ children, currency, append, string }) => {
   let newChildren = children
   const nFormatter = num => {
      if (num >= 1000000) {
         return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M'
      }
      if (num >= 1000) {
         return (num / 1000).toFixed(2).replace(/\.00$/, '') + 'K'
      }
      return num
   }

   if (/^([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(children)) {
      newChildren = currency
         ? append
            ? nFormatter(newChildren) + ' ' + currency
            : currency + nFormatter(newChildren)
         : nFormatter(newChildren)
   }
   return (
      <Styles.Value title={children} string={string}>
         <p>{newChildren}</p>
      </Styles.Value>
   )
}
//additional box
Card.AdditionalBox = ({ children, justifyContent }) => {
   return (
      <Styles.AdditionalBox justifyContent={justifyContent}>
         {children}
      </Styles.AdditionalBox>
   )
}
