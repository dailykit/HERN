import React from 'react'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   Text,
   Dropdown,
   DropdownButton,
   Spacer,
   ComboButton,
   IconButton,
   TextButton,
} from '@dailykit/ui'
import { KIOSK } from '../../../../graphql'
import tableOptions from '../../../../tableOption'
import { logger } from '../../../../../../shared/utils'
import { StyledWrapper, StyledHeader } from '../../styled'
import { DeleteIcon } from '../../../../../../shared/assets/icons'
import {
   InlineLoader,
   Flex,
   Tooltip,
   Banner,
} from '../../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../../shared/providers'
import { PublishIcon, UnPublishIcon } from '../../../../assets/icons'
import moment from 'moment'
import '../../../../tableStyle.css'

export const KioskReportTable = () => {
   const tableRef = React.useRef()
   const [kioskReport, setKioskReport] = React.useState([])

   let {
      loading,
      error,
      data: { order_kioskReport = [] } = [],
   } = useSubscription(KIOSK.KIOSK_REPORT, {
      onSubscriptionData: (
         {
            //  subscriptionData: { data: order_kioskReport = [] },
         }
      ) => {
         //  console.log('data for kiosk report:', order_kioskReport)
         //  setKioskReport
      },
   })
   console.log('kisok repot==>>', order_kioskReport)

   //options for groupBy:
   const [groupByOptions] = React.useState([
      { id: 1, title: 'KioskId', payload: 'locationKioskId' },
      { id: 2, title: 'LocationId', payload: 'locationId' },
   ])

   const defaultIDS = () => {
      let arr = []
      const kioskReportGroup = localStorage.getItem(
         'tabulator-kiosk-report_table-group'
      )
      const kioskReportGroupParse =
         kioskReportGroup !== undefined &&
         kioskReportGroup !== null &&
         kioskReportGroup.length !== 0
            ? JSON.parse(kioskReportGroup)
            : null
      if (kioskReportGroupParse !== null) {
         kioskReportGroupParse.forEach(x => {
            const foundGroup = groupByOptions.find(y => y.payload == x)
            console.log('foundroup--->', foundGroup, groupByOptions, 'x:>', x)
            console.log('y::>', kioskReportGroupParse, kioskReportGroup)
            // arr.push(foundGroup.id)
         })
      }
      return arr.length == 0 ? [4] : arr
   }

   const columns = React.useMemo(() => [
      {
         title: 'Label',
         field: 'label',
         frozen: true,
         headerSort: true,
         headerFilter: true,
         //    formatter: reactFormatter(<KioskName />),
         formatter: cell => cell.getData().label || 'N/A',
         headerTooltip: function (column) {
            const identifier = 'brands_listing_brand_column'
            return (
               //  tooltip(identifier)?.description || column.getDefinition().title
               column.getDefinition().title
            )
         },
         cssClass: 'rowClick',
         //    cellClick: (e, cell) => {
         //       cellClick(cell.getData())
         //    },
         width: 250,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 350,
      },
      {
         title: 'City',
         field: 'city',
         headerSort: true,
         headerFilter: true,
         width: 100,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 150,
         formatter: cell => cell.getData().city || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'KioskId',
         field: 'locationKioskId',
         headerSort: true,
         headerFilter: true,
         width: 100,
         resizable: 'true',
         minWidth: 80,
         maxWidth: 100,
         formatter: cell => cell.getData().locationKioskId || 'N/A',
         headerTooltip: function (column) {
            // const identifier = 'brands_listing_domain_column'
            return column.getDefinition().title
         },
      },
      {
         title: 'locationId',
         field: 'locationId',
         headerSort: true,
         headerFilter: true,
         width: 100,
         resizable: 'true',
         minWidth: 80,
         maxWidth: 100,
         formatter: cell => cell.getData().locationId || 'N/A',
         headerTooltip: function (column) {
            // const identifier = 'brands_listing_domain_column'
            return column.getDefinition().title
         },
      },
      // {
      //    title: 'Status',
      //    field: 'isActive',
      //    headerSort: true,
      //    headerFilter: true,
      //    // formatter: cell => cell.getData().isActive || 'N/A',
      //    formatter: reactFormatter(<ActiveFormatter />),
      //    headerTooltip: function (column) {
      //       const identifier = 'brands_listing_domain_column'
      //       return (
      //          tooltip(identifier)?.description || column.getDefinition().title
      //       )
      //    },
      // },
      // {
      //    title: 'Actions',
      //    hozAlign: 'center',
      //    headerSort: false,
      //    frozen: true,
      //    width: 80,
      //    headerHozAlign: 'center',
      //    formatter: reactFormatter(
      //       <DeleteKiosk deleteHandler={deleteHandler} />
      //    ),
      //    headerTooltip: function (column) {
      //       const identifier = 'brands_listing_actions_column'
      //       return (
      //          tooltip(identifier)?.description || column.getDefinition().title
      //       )
      //    },
      // },
      {
         title: 'Time',
         field: 'time',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: cell => cell.getData().time || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'KioskLabel',
         field: 'internalLocationKioskLabel',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 150,
         maxWidth: 200,
         formatter: cell => cell.getData().internalLocationKioskLabel || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Outlet',
         field: 'outlet',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: cell => cell.getData().outlet || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Posist Source Order Id',
         field: 'posist_sourceOrderId',
         headerFilter: true,
         width: 300,
         resizable: 'true',
         minWidth: 200,
         maxWidth: 300,
         formatter: cell => cell.getData().posist_sourceOrderId || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Posist Tab Type',
         field: 'posist_tabType',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: cell => cell.getData().posist_tabType || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Posist SourceName',
         field: 'posist_sourceName',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: cell => cell.getData().posist_sourceName || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Payment Status',
         field: 'paymentStatus',
         headerFilter: true,
         width: 350,
         resizable: 'true',
         minWidth: 300,
         maxWidth: 350,
         formatter: cell => cell.getData().paymentStatus || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Payment Type',
         field: 'paymentType',
         headerFilter: true,
         width: 350,
         resizable: 'true',
         minWidth: 300,
         maxWidth: 350,
         formatter: cell => cell.getData().paymentType || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Bank Id',
         field: 'bankId',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: cell => cell.getData().bankId || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Card Number',
         field: 'cardNumber',
         headerFilter: true,
         width: 300,
         resizable: 'true',
         minWidth: 200,
         maxWidth: 300,
         formatter: cell => cell.getData().cardNumber || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Card Type',
         field: 'cardType',
         headerFilter: true,
         width: 300,
         resizable: 'true',
         minWidth: 200,
         maxWidth: 300,
         formatter: cell => cell.getData().cardType || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Amount',
         field: 'amount',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: cell => cell.getData().amount || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },

      {
         title: 'Date',
         field: 'date',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: reactFormatter(<DateFormatter />),
      },
      {
         title: 'IsTest',
         field: 'isTest',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: cell => cell.getData().isTest || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'TerminalId',
         field: 'terminalId',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: cell => cell.getData().terminalId || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
      {
         title: 'Zipcode',
         field: 'zipcode',
         headerFilter: true,
         width: 200,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 200,
         formatter: cell => cell.getData().zipcode || 'N/A',
         headerTooltip: function (column) {
            return column.getDefinition().title
         },
      },
   ])

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }
   if (loading) return <InlineLoader />

   // types of report to download
   const downloadCsvData = () => {
      tableRef.current.table.download('csv', 'kiosk_report.csv')
   }

   const downloadPdfData = () => {
      tableRef.current.table.downloadToTab('pdf', 'kiosk_report.pdf')
   }

   const downloadXlsxData = () => {
      tableRef.current.table.download('xlsx', 'kiosk_report.xlsx')
   }

   return (
      <StyledWrapper>
         <Flex
            container
            alignItems="center"
            justifyContent="space-between"
            height="72px"
            margin="30px"
         >
            <Flex container alignItems="center" width="25%">
               {/* <Spacer size="250px" xAxis /> */}
               <Text as="h2" style={{ marginLeft: '87px' }}>
                  Kiosk Report ({order_kioskReport.length})
               </Text>
               {/* <Tooltip identifier="recipes_list_heading" /> */}
            </Flex>

            <Flex container alignItems="center" width="40%">
               {/* <Spacer size="15px" xAxis /> */}
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

               <Spacer size="15px" xAxis />
               <Text as="text1">Group By:</Text>
               <Spacer size="5px" xAxis />
               <Dropdown
                  type="multi"
                  variant="revamp"
                  disabled={true}
                  defaultIds={defaultIDS()}
                  options={groupByOptions}
                  searchedOption={() => {}}
                  selectedOption={value => {
                     localStorage.setItem(
                        'tabulator-kiosk-report_table-group',
                        JSON.stringify(value.map(x => x.payload))
                     )
                     tableRef.current.table.setGroupBy(
                        value.map(x => x.payload)
                     )
                  }}
                  typeName="groupBy"
               />
            </Flex>
            {/* <ComboButton type="solid" onClick={() => openRecipeTunnel(1)}>
               <AddIcon color="#fff" size={24} /> Create Recipe
            </ComboButton> */}
         </Flex>
         {loading ? (
            <InlineLoader />
         ) : (
            <>
               <ReactTabulator
                  ref={tableRef}
                  data={order_kioskReport ? order_kioskReport : []}
                  columns={columns}
                  options={{
                     ...tableOptions,
                     placeholder: 'No Kiosks Available Yet !',
                  }}
                  className="brands-table"
               />
            </>
         )}
      </StyledWrapper>
   )
}

const DateFormatter = ({ cell }) => {
   const data = cell.getData()
   return (
      <>
         <Text as="text1">{moment(data.date).format('DD-MM-YYYY')}</Text>
      </>
   )
}

const TimeFormatter = ({ cell }) => {
   const data = cell.getData()
   // console.log('data for table::>', data, data.time)
   return (
      <>
         <Text as="text1">{moment(data.time).format('hh:mm')}</Text>
      </>
   )
}

export default KioskReportTable
