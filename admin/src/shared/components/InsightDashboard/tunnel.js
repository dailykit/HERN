import React from 'react'
import styled from 'styled-components'
import { Tunnel, TunnelHeader, Tunnels } from '@dailykit/ui'
import Insight from '../Insight'

export default function InsightTunnel({
   closeTunnel,
   tunnels,
   insights,
   variables,
   includeChart = true,
   includeTable,
   where,
   limit,
   order,
}) {
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="full">
            <TunnelHeader title="Insight" close={() => closeTunnel(1)} />
            <TunnelBody>
               {insights.map(insight => {
                  return (
                     <Insight
                        key={insight.identifier}
                        identifier={insight.identifier}
                        variables={variables}
                        includeChart={includeChart}
                        includeTable={includeTable}
                        where={where}
                        limit={limit}
                        order={order}
                     />
                  )
               })}
            </TunnelBody>
         </Tunnel>
      </Tunnels>
   )
}

export const TunnelBody = styled.div`
   padding: 32px;
   height: calc(100% - 200px);
   overflow: auto;
`
