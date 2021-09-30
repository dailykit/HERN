import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { Flex, Spacer, Text } from '@dailykit/ui'
import moment from 'moment'
import React from 'react'
import styled from 'styled-components'
import { useTabs } from '../../../../providers'
import { get_env } from '../../../../utils'
import TableOptions from '../../tableOptions'
//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}

const OrderRefTable = ({ graphTunnelData, groupBy }) => {
   const { addTab, tab } = useTabs()
   const CreatedAtFormatter = ({ cell }) => {
      return (
         <Text as="text2">
            {moment(cell._cell.value.split('.')[0]).format(
               `ll${groupBy[groupBy.length - 1] == 'hour' ? 'l' : ''}`
            )}
         </Text>
      )
   }
   const columns = [
      {
         title: 'Order ID',
         field: 'id',
         headerSort: true,
         headerFilter: true,
         cellClick: (e, cell) => {
            const { id } = cell._cell.row.data
            addTab(`ORD${id}`, `/order/orders/${id}`)
         },
         cssClass: 'colHover',
         width: 150,
      },
      {
         title: `Amount Paid (${currency[get_env('REACT_APP_CURRENCY')]})`,
         field: 'amount paid',
         headerSort: true,
         headerFilter: true,
      },
      {
         title: 'Created At',
         field: 'created_at',
         headerSort: true,
         headerFilter: true,
         formatter: reactFormatter(<CreatedAtFormatter />),
      },
   ]
   console.log(
      'This is one',
      `(${moment(graphTunnelData.presentTime).format(
         `ll${groupBy[groupBy.length - 1] == 'hour' ? 'l' : ''}`
      )}-${moment(graphTunnelData.presentTime)
         .add(1, groupBy[groupBy.length - 1])
         .format(`ll${groupBy[groupBy.length - 1] == 'hour' ? 'l' : ''}`)})`
   )
   return (
      <>
         <TunnelBody>
            <Flex container padding="2rem" flexDirection="column">
               {graphTunnelData.orderRefData[0] && (
                  <>
                     <Text as="h3">
                        Present{' '}
                        <Text as="helpText">
                           {`(${moment(graphTunnelData.presentTime).format(
                              `ll${
                                 groupBy[groupBy.length - 1] == 'hour'
                                    ? 'l'
                                    : ''
                              }`
                           )}-${moment(graphTunnelData.presentTime)
                              .add(1, groupBy[groupBy.length - 1])
                              .format(
                                 `ll${
                                    groupBy[groupBy.length - 1] == 'hour'
                                       ? 'l'
                                       : ''
                                 }`
                              )})`}
                        </Text>
                     </Text>
                     <ReactTabulator
                        columns={columns}
                        options={TableOptions}
                        data={graphTunnelData.orderRefData[0]}
                     />
                  </>
               )}
               <Spacer size="15px" />
               {graphTunnelData.orderRefData[1] && (
                  <>
                     <Text as="h3">
                        Past{' '}
                        <Text as="helpText">
                           {`(${moment(graphTunnelData.pastTime).format(
                              `ll${
                                 groupBy[groupBy.length - 1] == 'hour'
                                    ? 'l'
                                    : ''
                              }`
                           )}-${moment(graphTunnelData.pastTime)
                              .add(1, groupBy[groupBy.length - 1])
                              .format(
                                 `ll${
                                    groupBy[groupBy.length - 1] == 'hour'
                                       ? 'l'
                                       : ''
                                 }`
                              )})`}
                        </Text>
                     </Text>
                     <ReactTabulator
                        columns={columns}
                        options={TableOptions}
                        data={graphTunnelData.orderRefData[1]}
                     />
                  </>
               )}
            </Flex>
         </TunnelBody>
      </>
   )
}
const TunnelBody = styled.div`
   padding: 10px 16px 0px 32px;
   height: calc(100% - 103px);
   overflow: auto;
`
export default OrderRefTable
