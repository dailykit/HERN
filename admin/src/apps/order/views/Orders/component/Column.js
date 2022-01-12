import React from 'react'

export function Column(props) {
   return (
      <div className="Column">
         <div className="Column__title">{props.title}</div>
         {props.children}
      </div>
   )
}
