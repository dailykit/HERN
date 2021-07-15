import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { merge } from 'lodash'
import { useState } from 'react'
import {
   buildOptions,
   buildOptionVariables,
   transformer,
} from '../utils/insight_utils'
import { isObject } from '../utils/isObject'

// prettier-ignore
const buildQuery = query => gql`${query}`

let gqlQuery = {
   kind: 'Document',
   definitions: [
      {
         kind: 'OperationDefinition',
         operation: 'query',
         name: null,
         variableDefinitions: null,
         directives: [],
         selectionSet: {
            kind: 'SelectionSet',
            selections: [
               {
                  kind: 'Field',
                  alias: null,
                  name: {
                     kind: 'Name',
                     value: 'user',
                  },
               },
            ],
         },
      },
   ],
}

/**
 *
 * @param {string} title
 * @param {{includeTableData: boolean, includeChartData: boolean}} [options]
 *
 * @returns {{loading: boolean, tableData: any[] | null, switches: any, optionVariables: any, options: any, updateSwitches: () => {}, updateOptions: () => {}, aggregates: {}} insight
 */
export const useInsights = (
   identifier,
   options = {
      includeTableData: true,
   }
) => {
   const [variableSwitches, setVariableSwitches] = useState({})
   const [variableOptions, setVariableOptions] = useState({})
   const [isNewOption, setIsNewOption] = useState(false)
   const [newData, setNewData] = useState([])
   const [oldData, setOldData] = useState([])
   const [oldAggregates, setOldAggregates] = useState({})
   const [newAggregates, setNewAggregates] = useState({})
   const [oldTableData, setOldTableData] = useState([])
   const [newTableData, setNewTableData] = useState([])
   const [empty, setEmpty] = useState(false)

   const {
      data: {
         insight = {
            query: null,
            availableOptions: null,
            switches: null,
            id: null,
            filters: null,
            defaultOptions: {},
            schemaVariables: null,
            config: {},
         },
      } = {},
      loading: insightLoading,
      error: insightLoadError,
   } = useQuery(GET_INSIGHT, {
      variables: {
         identifier,
      },
      onCompleted: data => {
         setVariableOptions(data.insight.defaultOptions || {})
         setVariableSwitches(data.insight.switches || {})
      },
      fetchPolicy: 'cache-and-network',
   })

   if (insight && insight.query) {
      gqlQuery = buildQuery(insight.query)
   }

   let tempFillers = null

   // flatten schema variable till keys starting with _
   if (insight.schemaVariables)
      tempFillers = buildOptions(insight.schemaVariables)

   // loop through the tempFillers and replace values starting with $ with the corresponding values in the options.variables object
   if (tempFillers && isObject(tempFillers))
      for (const key in tempFillers) {
         for (const subKey in tempFillers[key]) {
            if (`${tempFillers[key][subKey] || ''}`.startsWith('$')) {
               const tempKey = tempFillers[key][subKey].slice(1)
               tempFillers[key][subKey] = options.variables[tempKey]
            }
         }
      }

   //  unflatten the tempFillers to pass in the query
   const schemaVariables = buildOptionVariables(tempFillers || {})

   const { error: insightError } = useQuery(gqlQuery, {
      variables: {
         ...variableSwitches,
         // merge variableOptions and schemaVariables, schemaVariables will overwrite any filter values in variableOptions
         ...merge(variableOptions, schemaVariables, options.where),
         limit: options.limit,
         orderBy: options.order,
      },
      onCompleted: data => {
         const nodeKey = Object.keys(data)[0]
         if (isNewOption) {
            setNewData(transformer(data, nodeKey))
            setNewAggregates(data[nodeKey].aggregate)
         } else {
            setOldData(transformer(data, nodeKey))
            setOldAggregates(data[nodeKey].aggregate)
         }
         if (options.includeTableData || options.includeChartData) {
            const tableData = transformer(data, nodeKey)
            if (!tableData.length) return setEmpty(true)

            if (isNewOption) {
               setNewTableData(tableData)
            } else {
               setOldTableData(tableData)
            }
         }
      },
   })

   const whereObject = buildOptions(insight.availableOptions || {})
   const filters = buildOptions(insight.filters || {})

   const updateOptions = isNewOption => {
      setIsNewOption(isNewOption)
      return setVariableOptions
   }

   const result = {
      loading: insightLoading,
      error: insightError || insightLoadError,
      empty,
      newTableData,
      oldTableData,
      switches: variableSwitches,
      optionVariables: variableOptions,
      options: whereObject,
      config: insight.config,
      updateSwitches: setVariableSwitches,
      updateOptions,
      oldAggregates,
      newAggregates,
      allowedCharts: insight.charts,
      filters,
      newData,
      oldData,
   }

   return result
}

export const GET_INSIGHT = gql`
   query GetInsight($identifier: String!) {
      insight(identifier: $identifier) {
         identifier
         availableOptions
         filters
         config
         defaultOptions
         schemaVariables
         query
         switches
         charts {
            id
            config
            layoutType
         }
      }
   }
`
