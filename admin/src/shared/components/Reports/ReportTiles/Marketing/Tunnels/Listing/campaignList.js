import { ReactTabulator } from '@dailykit/react-tabulator'
import { DropdownButton, Filler, Flex, Spacer, Text } from '@dailykit/ui'
import React, { useCallback } from 'react'
import TableOptions from './tableOptions'

const CampaignList = ({ campaigns, setSortedCampaigns }) => {
   const campaignsTableRef = React.useRef()
   const totalCalc = (values, data, calcParams) => {
      let total = 0
      values.forEach(value => {
         total += value
      })
      return `Σ = ${total.toFixed(2)}`
   }
   // console.log('compareActiveList', compareActive)

   const dataSorted = useCallback((_, rows) => {
      setSortedCampaigns(rows.map(eachRow => eachRow._row.data))
   }, [])

   const columns = [
      {
         title: 'Campaign Id',
         field: 'id',
         hozAlign: 'center',
         width: 100,
         headerTooltip: true,
      },
      {
         title: 'Title',
         field: 'campaign_title',
         headerFilter: true,
         hozAlign: 'left',
         headerTooltip: true,
      },
      {
         title: 'Description',
         field: 'campaign_description',
         headerFilter: true,
         hozAlign: 'left',
         width: 200,
         headerTooltip: true,
      },
      {
         title: 'Reward Count',
         field: 'campaign_count',
         bottomCalc: totalCalc,
         hozAlign: 'right',
         cssClass: 'digit-col',
         width: 130,
         headerTooltip: true,
      },
      {
         title: `Reward Wallet Amount `,
         field: 'campaign_wallet',
         bottomCalc: totalCalc,
         hozAlign: 'right',
         cssClass: 'digit-col',
         width: 130,
         headerTooltip: true,
      },
      {
         title: `Reward Loyalty Points `,
         field: 'campaign_loyalty',
         bottomCalc: totalCalc,
         hozAlign: 'right',
         cssClass: 'digit-col',
         width: 130,
         headerTooltip: true,
      },
   ]
   const downloadCsvData = () => {
      campaignsTableRef.current.table.download('csv', 'campaigns-list.csv')
   }

   const downloadPdfData = () => {
      campaignsTableRef.current.table.downloadToTab('pdf', 'campaigns-list.pdf')
   }

   const downloadXlsxData = () => {
      campaignsTableRef.current.table.download('xlsx', 'campaigns-list.xlsx')
   }
   const dataLoaded = () => {}
   if (campaigns.length == 0) {
      return <Filler message="No campaign available" />
   }
   return (
      <>
         <Spacer size="15px" />
         <Flex container flexDirection="column">
            <Text as="h3" style={{ padding: '0px 10px' }}>
               Campaigns List
            </Text>
            <Spacer size="10px" />
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
            </Flex>
            <Spacer size="10px" />
            <ReactTabulator
               dataLoaded={dataLoaded}
               ref={campaignsTableRef}
               data={campaigns}
               columns={columns}
               options={TableOptions}
               className="report-table campaigns-table"
               dataSorted={dataSorted}
            />
         </Flex>
      </>
   )
}
const isCampaignListPropsEqual = (prevProps, nextProps) => {
   return prevProps.campaigns === nextProps.campaigns
}
export default React.memo(CampaignList, isCampaignListPropsEqual)
