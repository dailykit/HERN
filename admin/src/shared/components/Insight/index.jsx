import { ReactTabulator } from '@dailykit/react-tabulator'
import { Flex, Form } from '@dailykit/ui'
import React, { useState } from 'react'
import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import styled from 'styled-components'
import { useInsights } from '../../hooks/useInsights'
import '../../styled/tableStyles.css'
import { ErrorState } from '../ErrorState'
import { InlineLoader } from '../InlineLoader'
import Chart from './Chart'
import { Counter } from './Counter'
import Option from './Option'
import { tableConfig } from './tableConfig'

/**
 *
 * @param {{includeTable: boolean, includeChart: boolean, identifier: string, where: {}, limit: number, order: {}, variables: {}}} props
 */
export default function Insight({
   includeTable = true,
   includeChart = false,
   identifier = '',
   where = {},
   limit,
   order,
   variables = {},
}) {
   const [isDiff, setIsDiff] = useState(false)

   const {
      newTableData,
      oldTableData,
      options,
      optionVariables,
      updateOptions,
      allowedCharts,
      filters,
      switches,
      updateSwitches,
      oldData,
      newData,
      oldAggregates,
      newAggregates,
      config,
      loading,
      error,
      empty,
   } = useInsights(identifier, {
      includeTableData: includeTable,
      includeChartData: includeChart,
      where,
      limit,
      order,
      variables,
   })

   if (loading) return <InlineLoader />
   if (error) return <ErrorState />

   return (
      <>
         <StyledContainer>
            <div
               style={{
                  display: 'grid',
                  gridTemplateColumns: '8rem 1fr',
                  marginBottom: '1rem',
               }}
            >
               <Form.Toggle
                  value={isDiff}
                  onChange={() => setIsDiff(v => !v)}
                  name={`compare-${identifier}`}
               >
                  Compare
               </Form.Toggle>

               <Option
                  options={options}
                  state={optionVariables}
                  updateOptions={updateOptions}
                  filters={filters}
                  switches={switches}
                  updateSwitches={updateSwitches}
                  showColumnToggle
                  isDiff={isDiff}
               />
            </div>
            <div
               style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  columnGap: '2rem',
               }}
            >
               {isDiff ? <CounterBar aggregates={newAggregates} /> : null}
               <CounterBar aggregates={oldAggregates} />
            </div>
            {(config && config.includeChart) || includeChart ? (
               <HeroCharts
                  allowedCharts={allowedCharts}
                  oldData={oldData}
                  newData={newData}
                  isDiff={isDiff}
               />
            ) : null}

            <StyledGrid isDiff={isDiff}>
               {(config && config.includeChart) || includeChart ? (
                  <FlexCharts
                     allowedCharts={allowedCharts}
                     oldData={oldData}
                     newData={newData}
                     isDiff={isDiff}
                  />
               ) : null}
            </StyledGrid>
            {(config && config.includeTable) || includeTable ? (
               <Flex container>
                  {isDiff ? (
                     <ReactTabulator
                        columns={[]}
                        options={tableConfig}
                        data={newTableData.length ? newTableData : oldTableData}
                     />
                  ) : null}

                  <ReactTabulator
                     columns={[]}
                     options={tableConfig}
                     data={oldTableData}
                  />
               </Flex>
            ) : null}
         </StyledContainer>
      </>
   )
}

function HeroCharts({ allowedCharts, oldData, newData, isDiff }) {
   if (!allowedCharts?.length) return null

   return allowedCharts
      ?.filter(chart => chart.layoutType === 'HERO')
      .map(chart => (
         <Chart
            key={chart.id}
            oldData={oldData}
            newData={newData}
            chart={chart}
            isDiff={isDiff}
         />
      ))
}

function FlexCharts({ allowedCharts, oldData, newData, isDiff }) {
   if (!allowedCharts?.length) return null

   return allowedCharts
      ?.filter(chart => chart.layoutType === 'FLEX')
      .map(chart => {
         return (
            <Chart
               oldData={oldData}
               newData={newData}
               chart={chart}
               isDiff={isDiff}
               key={chart.id}
            />
         )
      })
}

function CounterBar({ aggregates }) {
   const keys = (aggregates && Object.keys(aggregates)) || []

   if (keys.length) return <Counter aggregates={aggregates} keys={keys} />
   return null
}

const StyledContainer = styled.div`
   position: relative;
   width: 100%;
   background: #ffffff;
   border-radius: 10px;
   padding: 16px;
`
const StyledGrid = styled.div`
   display: grid;
   grid-template-columns: ${({ isDiff }) => (isDiff ? '1fr' : '1fr 1fr')};
   gap: 1rem;
`

export { CounterBar }
