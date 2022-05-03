import React from 'react'
import { Form, TunnelHeader,useTunnel,
   Tunnels,
   Tunnel, } from '@dailykit/ui'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { toast } from 'react-toastify'
import {
   ErrorBoundary,
   InlineLoader,
   Flex,
} from '../../../../../../../../shared/components'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import {
   BRAND_RECURRENCES,
   UPSERT_BRAND_RECURRENCE,
} from '../../../../../../graphql'
import { TunnelBody } from '../styled'
import LinkBrandLocations from './LinkBrandLocations'

const BrandTunnel = ({ closeTunnel }) => {
   const [brandDetails, setBrandDetails] = React.useState({})
   const { recurrenceState } = React.useContext(RecurrenceContext)
   const [tunnels, openTunnelForLocations, closeTunnelForLocations] = useTunnel(1)

   const tableRef = React.useRef()

   const {
      loading,
      error,
      data: { brandRecurrences = [] } = {},
   } = useSubscription(BRAND_RECURRENCES)
   // console.log('data needed:',brandRecurrences)
   
   brandRecurrences.forEach((element)=>{
      element.linkBrandLocation = 'Link Locations'
   })
   
   // console.log('new data needed:',brandRecurrences)
   const [upsertBrandRecurrence] = useMutation(UPSERT_BRAND_RECURRENCE, {
      onCompleted: data => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   
   const linkWithBrandLocations =(e) => {
      openTunnelForLocations(1)
   }

   const cellClick =(e)=>{ 
      console.log("cell clicked",e,e.id,e.isActive)
      const recurrenceId = recurrenceState.recurrenceId
      setBrandDetails(e)
      if(e.recurrences.some(
         recurrence =>
            recurrence.recurrenceId === recurrenceId && recurrence.isActive
      )){window.alert('link not active')}
      else{linkWithBrandLocations(e)}
      // linkWithBrandLocations(e)     
   }
   
   const columns = [
      {
         title: 'Title',
         field: 'title',
         headerFilter: true,
         headerSort: false,
      },
      {
         title: 'Domain',
         field: 'domain',
         headerFilter: true,
      },
      {  
         title: 'link brand location',
         field: 'linkBrandLocation',
         headerTooltip: function (column) {
            return (column.getDefinition().title)},
         cellClick : (e, cell) => {
            cellClick(cell.getData())
            // console.log('cell clicked')
         },
         formatter:function(cell, formatterParams){
            const value = cell.getValue();
            const linkValue = cell.getData()
            const recurrenceId= recurrenceState.recurrenceId
            // console.log("see cell value:",cell.getData())
            if(linkValue.recurrences.some(
               recurrence =>
                  recurrence.recurrenceId === recurrenceId && recurrence.isActive
            )){return "<span style='color:#000000; font-weight:bold; cursor:pointer;'>" + value + "</span>";}
            
            else{return "<span style='color:#367BF5; font-weight:bold; cursor:pointer;'>" + value + "</span>";}
         //   return "<span style='color:#367BF5; font-weight:bold; cursor:pointer;'>" + value + "</span>";
            
         },
      },
      {
         title: 'Recurrence Available',
         formatter: reactFormatter(
            <ToggleRecurrence
               recurrenceId={recurrenceState.recurrenceId}
               onChange={object =>
                  upsertBrandRecurrence({ variables: { object } })
               }
            />
         ),
      },
   ]

   const options = {
      cellVertAlign: 'middle',
      layout: 'fitColumns',
      autoResize: true,
      maxHeight: 420,
      resizableColumns: true,
      virtualDomBuffer: 80,
      placeholder: 'No Data Available',
      persistence: true,
      persistenceMode: 'cookie',
   }

   if (!loading && error) return <ErrorBoundary />

   return (
      <>
         <TunnelHeader
            title="Link Recurrence with Brands"
            close={() => closeTunnel(5)}
         />
         <TunnelBody>
            {loading ? (
               <InlineLoader />
            ) : (
               <ReactTabulator
                  ref={tableRef}
                  columns={columns}
                  data={brandRecurrences}
                  options={options}
               />
            )}
         </TunnelBody>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <LinkBrandLocations closeTunnelForLocations={closeTunnelForLocations} brandDetails={brandDetails} />
            </Tunnel>
         </Tunnels>
      </>
   )
}

export default BrandTunnel

const ToggleRecurrence = ({ cell, recurrenceId, onChange }) => {
   const brand = React.useRef(cell.getData())
   const [active, setActive] = React.useState(false)

   const toggleHandler = value => {
      console.log(value)
      onChange({
         recurrenceId,
         brandId: brand.current.id,
         isActive: !active,
      })
   }

   React.useEffect(() => {
      const isActive = brand.current.recurrences.some(
         recurrence =>
            recurrence.recurrenceId === recurrenceId && recurrence.isActive
      )
      setActive(isActive)
   }, [brand.current])

   return (
      <Form.Toggle
         name={`toggle-${brand.current.id}`}
         value={active}
         onChange={toggleHandler}
      />
   )
}

