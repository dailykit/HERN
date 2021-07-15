import React from 'react'
import { Form, TunnelHeader } from '@dailykit/ui'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { toast } from 'react-toastify'
import {
   ErrorBoundary,
   InlineLoader,
} from '../../../../../../../../shared/components'
import { logger } from '../../../../../../../../shared/utils'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import {
   BRAND_RECURRENCES,
   UPSERT_BRAND_RECURRENCE,
} from '../../../../../../graphql'
import { TunnelBody } from '../styled'

const BrandTunnel = ({ closeTunnel }) => {
   const { recurrenceState } = React.useContext(RecurrenceContext)

   const tableRef = React.useRef()

   const {
      loading,
      error,
      data: { brandRecurrences = [] } = {},
   } = useSubscription(BRAND_RECURRENCES)

   const [upsertBrandRecurrence] = useMutation(UPSERT_BRAND_RECURRENCE, {
      onCompleted: data => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

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
