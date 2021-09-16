import React, { useEffect, useState } from 'react'
import {
   ButtonGroup,
   Dropdown,
   DropdownButton,
   Filler,
   Flex,
   Spacer,
   Text,
   TextButton,
   Tunnel,
   TunnelHeader,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'

import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import TableOptions from '../tableOptions'
import { InlineLoader } from '../../../../../InlineLoader'
import moment from 'moment'
import { AnalyticsApiArgsContext } from '../../../../context/apiArgs'
import { useTabs } from '../../../../../../providers'
import styled from 'styled-components'
import './../../../../tableStyle.css'
import { get_env } from '../../../../../../utils'
//currencies
const currency = {
   USD: '$',
   INR: '₹',
   EUR: '€',
}
const EarningTable = ({ data }) => {
   return (
      <>
         <Flex>
            <Flex>
               <Text as="h2" style={{ padding: '0px 10px' }}>
                  Earning Table
               </Text>
            </Flex>
            <Flex container>
               <Flex></Flex>
            </Flex>
            <Flex>
               <DataTable data={data} />
            </Flex>
         </Flex>
      </>
   )
}

const DataTable = ({ data }) => {
   const earningTableRef = React.useRef()
   const [ordersTunnels, openOrderTunnel, closeOrderTunnel] = useTunnel(1)
   const [orderTunnelData, setOrderTunnelData] = useState({
      data: [],
      timeRange: '',
   })
   const { analyticsApiArgState } = React.useContext(AnalyticsApiArgsContext)
   const [earningTableData, setEarningTableData] = useState([])
   const [status, setStatus] = useState({ loading: true })
   const totalCalc = values => {
      let total = 0
      values.forEach(value => (total += value))
      return 'Σ = ' + total.toFixed(2)
   }
   const downloadCsvData = () => {
      earningTableRef.current.table.download('csv', 'earning_table.csv')
   }

   const downloadPdfData = () => {
      earningTableRef.current.table.downloadToTab('pdf', 'earning_table.pdf')
   }

   const downloadXlsxData = () => {
      earningTableRef.current.table.download('xlsx', 'earning_table.xlsx')
   }

   //dropdown options
   const dropdownOptions = [
      {
         id: 1,
         title: 'Orders',
         payload: 'count',
      },
      {
         id: 2,
         title: 'Tax',
         payload: 'totalTax',
      },
      {
         id: 3,
         title: 'Discount',
         payload: 'totalDiscount',
      },
      {
         id: 4,
         title: 'Shipping',
         payload: 'totalDeliveryPrice',
      },
   ]

   //default ids for columns to be show dropdown
   const defaultIds = () => {
      const defaultShowColumns = localStorage.getItem(
         'earning-table-show-columns'
      )
      const parseDefaultColumns = defaultShowColumns
         ? JSON.parse(defaultShowColumns)
         : [1, 2, 3, 4]
      return parseDefaultColumns
   }

   //columns to be show dropdown selected option fn
   const selectedOption = option => {
      const ids = option.map(x => x.id)
      localStorage.setItem('earning-table-show-columns', JSON.stringify(ids))
      dropdownOptions.forEach(eachOption => {
         if (ids.includes(eachOption.id)) {
            earningTableRef.current.table.showColumn(eachOption.payload)
         } else {
            earningTableRef.current.table.hideColumn(eachOption.payload)
         }
      })
   }

   //columns to be show dropdown search option
   const searchedOption = option => console.log(option)

   //columns for table
   const columns = [
      {
         title: 'Time',
         field: 'date',
         width: 270,
         hozAlign: 'center',
      },
      {
         title: 'Orders',
         field: 'count',
         bottomCalc: 'sum',
         visible: true,
         width: 120,
         cellClick: (e, cell) => {
            setOrderTunnelData({
               ...orderTunnelData,
               data: cell._cell.row.data.orderRefs,
               timeRange: cell._cell.row.data.date,
            })

            openOrderTunnel(1)
         },
         cssClass: 'colHover',
         hozAlign: 'center',

         // formatter: reactFormatter(<OrderFormatter />),
      },
      {
         title: `Tax (${analyticsApiArgState.currency})`,
         field: 'totalTax',
         bottomCalc: totalCalc,
         visible: true,
         width: 120,
         hozAlign: 'center',
      },
      {
         title: `Discount (${analyticsApiArgState.currency})`,
         field: 'totalDiscount',
         bottomCalc: totalCalc,
         visible: true,
         width: 120,
         hozAlign: 'center',
      },
      {
         title: `Delivery (${analyticsApiArgState.currency})`,
         field: 'totalDeliveryPrice',
         bottomCalc: totalCalc,
         visible: true,
         width: 130,
         hozAlign: 'center',
      },
      {
         title: `Net Sales (${analyticsApiArgState.currency})`,
         field: 'netSale',
         bottomCalc: totalCalc,
         width: 150,
         hozAlign: 'center',
      },
      {
         title: `Total (${analyticsApiArgState.currency})`,
         field: 'total',
         bottomCalc: totalCalc,
         width: 150,
         hozAlign: 'center',
      },
   ]

   // fn run after table data loaded
   const dataLoaded = () => {
      const defaultShowColumns = localStorage.getItem(
         'earning-table-show-columns'
      )
      const parseDefaultColumns = JSON.parse(defaultShowColumns)
      if (parseDefaultColumns) {
         dropdownOptions.forEach(eachOption => {
            if (!parseDefaultColumns.includes(eachOption.id)) {
               earningTableRef.current.table.hideColumn(eachOption.payload)
            }
         })
      }
   }

   const earningDataManipulation = data => {
      const manipulateData = data.map(each => {
         if (Object.keys(each).includes('hour')) {
            const newDate = `${each.month}-${each.day}-${each.year} ${each.hour}:00`
            each.date = moment(newDate).format('DD MMM YYYY hh:mm a')
         } else if (Object.keys(each).includes('day')) {
            const newDate = `${each.month}-${each.day}-${each.year}`
            each.date = moment(newDate).format('DD MMM YYYY')
         } else if (Object.keys(each).includes('week')) {
            const newDate = moment(`${each.week} ${each.year}`, 'WW YYYY')
               .startOf('isoWeek')
               .format('DD MMM YYYY')
            const nextNewDate = moment(newDate)
               .add(1, 'w')
               .format('DD MMM YYYY')
            each.date = `${newDate} to ${nextNewDate}`
         } else {
            const newDate = `${each.month} ${each.year}`
            each.date = moment(newDate, 'MM YYYY').format('MMM YYYY')
         }
         each.netSale = parseFloat(
            (each.total - each.totalTax - each.totalDiscount).toFixed(2)
         )
         return each
      })
      setStatus({ ...status, loading: false })
      setEarningTableData(manipulateData)
   }
   useEffect(() => {
      earningDataManipulation(data)
   }, [data])
   if (status.loading) {
      return <InlineLoader />
   }
   if (earningTableData.length === 0) {
      return <Filler message="Data not available" />
   }
   return (
      <>
         <Flex>
            <Tunnels tunnels={ordersTunnels}>
               <Tunnel size="full" layer={1}>
                  <TunnelHeader
                     title="Orders"
                     close={() => closeOrderTunnel(1)}
                     description="This is a description"
                  />
                  <TunnelBody>
                     <OrderTunnel
                        orderTableData={orderTunnelData.data}
                        orderTunnelData={orderTunnelData}
                     />
                  </TunnelBody>
               </Tunnel>
            </Tunnels>
            <Flex
               container
               justifyContent="flex-end"
               alignItems="center"
               padding="0px 10px"
            >
               <DropdownButton title="Download" width="150px">
                  <DropdownButton.Options>
                     <DropdownButton.Option onClick={() => downloadCsvData()}>
                        CSV
                     </DropdownButton.Option>
                     <DropdownButton.Option onClick={() => downloadPdfData()}>
                        PDF
                     </DropdownButton.Option>
                     <DropdownButton.Option onClick={() => downloadXlsxData()}>
                        XLSX
                     </DropdownButton.Option>
                  </DropdownButton.Options>
               </DropdownButton>
               <Spacer xAxis size="20px" />
               <Dropdown
                  type="multi"
                  options={dropdownOptions}
                  defaultIds={defaultIds()}
                  searchedOption={searchedOption}
                  selectedOption={selectedOption}
                  placeholder="Columns to be show..."
                  typeName="option"
                  selectedOptionsVisible={false}
               />
            </Flex>
         </Flex>
         <Spacer size="20px" />
         <ReactTabulator
            ref={earningTableRef}
            dataLoaded={dataLoaded}
            data={data}
            columns={columns}
            options={TableOptions}
         />
         <Spacer size="20px" />
      </>
   )
}
const OrderTunnel = props => {
   const { orderTableData, orderTunnelData } = props
   const { addTab, tab } = useTabs()
   const CreatedAtFormatter = ({ cell }) => {
      return (
         <Text as="text2">
            {moment(cell._cell.value.split('.')[0]).format(`ll`)}
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
   return (
      <>
         <Flex padding="0px 0px 0px 12px">
            <Spacer size="10px" />
            <Text as="h3"> Orders for {orderTunnelData.timeRange}</Text>
            <Spacer size="10px" />
            <ReactTabulator
               data={orderTableData}
               options={TableOptions}
               columns={columns}
            />
         </Flex>
      </>
   )
}
const TunnelBody = styled.div`
   padding: 10px 16px 0px 32px;
   height: calc(100% - 103px);
   overflow: auto;
`
export default React.memo(EarningTable)
