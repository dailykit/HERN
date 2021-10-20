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
   return <Styles.Card>{children}</Styles.Card>
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
