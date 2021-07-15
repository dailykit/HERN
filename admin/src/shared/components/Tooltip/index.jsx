import React from 'react'
import { Spacer } from '@dailykit/ui'
import styled from 'styled-components'
import ReactTooltip from 'react-tooltip'

import { useTooltip } from '../../providers'
import { TooltipIcon } from '../../assets/icons'

export const Tooltip = ({
   type = null,
   effect = null,
   position = null,
   identifier = null,
}) => {
   const { state, tooltip } = useTooltip()

   if (!identifier) {
      console.error('Identifier is required!')
   }
   if (!state.showTooltip || !tooltip(identifier)?.isActive) return null
   return (
      <Styles.Tooltip>
         <a data-tip data-for={identifier}>
            <TooltipIcon
               {...(!tooltip(identifier)?.description && { color: '#d9bcbc' })}
            />
         </a>
         <ReactTooltip
            id={identifier}
            clickable={true}
            type={type || 'info'}
            place={position || 'top'}
            effect={effect || 'solid'}
            overridePosition={({ left, top }, _e, _t, node) => {
               return {
                  top,
                  left: typeof node === 'string' ? left : Math.max(left, 0),
               }
            }}
         >
            <p>{tooltip(identifier)?.description}</p>
            <Spacer size="12px" />
            {tooltip(identifier)?.link && (
               <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={tooltip(identifier)?.link}
               >
                  View Docs
               </a>
            )}
            {!tooltip(identifier)?.description && (
               <p style={{ wordWrap: 'anywhere' }}>{identifier}</p>
            )}
         </ReactTooltip>
      </Styles.Tooltip>
   )
}

const Styles = {
   Tooltip: styled.span`
      width: 24px;
      height: 24px;
      margin-left: 4px;
      > a {
         width: 24px;
         height: 24px;
         cursor: pointer;
         display: flex;
         align-items: center;
         justify-content: center;
      }
      > div {
         max-width: 250px;
         &.__react_component_tooltip {
            padding: 8px 16px;
         }
         a {
            color: white;
            float: right;
         }
      }
   `,
}
