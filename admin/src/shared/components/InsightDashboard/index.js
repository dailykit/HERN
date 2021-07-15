import React from 'react'
import { useTunnel, TextButton } from '@dailykit/ui'
import { INSIGHT } from './query'
import { useQuery } from '@apollo/react-hooks'
import Insight from '../Insight'
import { toast } from 'react-toastify'
import { logger } from '../../utils'
import InsightTunnel from './tunnel'

export default function InsightDashboard({
   appTitle,
   moduleTitle,
   showInTunnel = true,
   buttonType = 'outline',
   variables,
   includeChart = true,
   includeTable,
   where,
   limit,
   order,
}) {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const { data: { insights_insights: insights = [] } = {} } = useQuery(
      INSIGHT,
      {
         variables: {
            options: {
               isActive: { _eq: true },
               apps_modules: {
                  appTitle: { _eq: appTitle },
                  moduleTitle: { _eq: moduleTitle },
               },
            },
         },
         onError: error => {
            toast.error('Something went wrong with insight dashboard query')
            logger(error)
         },
      }
   )
   return (
      <>
         {showInTunnel ? (
            <TextButton
               type={buttonType}
               size="sm"
               onClick={() => openTunnel(1)}
            >
               View Insight
            </TextButton>
         ) : (
            <div>
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
            </div>
         )}
         <InsightTunnel
            tunnels={tunnels}
            closeTunnel={closeTunnel}
            insights={insights}
            variables={variables}
            includeChart={includeChart}
            includeTable={includeTable}
            where={where}
            limit={limit}
            order={order}
         />
      </>
   )
}
