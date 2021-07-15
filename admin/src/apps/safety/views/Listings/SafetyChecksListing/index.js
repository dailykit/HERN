import React from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { IconButton, Loader } from '@dailykit/ui'
import * as moment from 'moment'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { AddIcon, DeleteIcon } from '../../../assets/icons'
import { useTabs } from '../../../../../shared/providers'
import {
   CREATE_SAFETY_CHECK,
   DELETE_SAFETY_CHECK,
   SAFETY_CHECKS,
} from '../../../graphql'
import { StyledHeader, StyledWrapper } from '../styled'
import tableOptions from '../tableOption'
import { Banner } from '../../../../../shared/components'

const address = 'apps.safety.views.listings.safetycheckslisting.'
const SafetyChecksListing = () => {
   const { t } = useTranslation()
   const { addTab: createTab, tab } = useTabs()

   const addTab = (title, id) => {
      createTab(title, `/safety/checks/${id}`)
   }

   const { data: { safety_safetyCheck = [] } = {}, loading } = useSubscription(
      SAFETY_CHECKS,
      {
         onError: error => {
            console.log(error)
         },
      }
   )

   const [createSafetyCheck] = useMutation(CREATE_SAFETY_CHECK, {
      onCompleted: input => {
         addTab('Check', input.insert_safety_safetyCheck.returning[0].id)
         toast.success('Initiated!')
      },
      onError: error => {
         console.log(error)
         toast.error('Some error occurred!')
      },
   })
   const [deleteSafetyCheck] = useMutation(DELETE_SAFETY_CHECK, {
      onCompleted: () => {
         toast.success('Safety check deleted!')
      },
      onError: error => {
         console.log(error)
         toast.error('Error')
      },
   })

   React.useEffect(() => {
      if (!tab) {
         createTab('Safety Checks', '/safety/checks')
      }
   }, [tab, createTab])

   if (loading) return <Loader />

   return (
      <StyledWrapper>
         <Banner id="safety-app-safety-checks-listing-top" />
         <StyledHeader>
            <h1>{t(address.concat('safety checks'))}</h1>
            <IconButton type="solid" onClick={createSafetyCheck}>
               <AddIcon color="#fff" size={24} />
            </IconButton>
         </StyledHeader>

         <DataTable
            data={safety_safetyCheck}
            addTab={addTab}
            deleteCheck={deleteSafetyCheck}
         />
         <Banner id="safety-app-safety-checks-listing-bottom" />
      </StyledWrapper>
   )
}

function DataTable({ data, addTab, deleteCheck }) {
   const { t } = useTranslation()

   const tableRef = React.useRef()

   const rowClick = (e, row) => {
      const { id } = row._row.data
      addTab('Check', id)
   }

   const columns = [
      {
         title: t(address.concat('time')),
         field: 'created_at',
         headerFilter: false,
         width: 150,
         formatter: reactFormatter(<ShowDate />),
      },
      {
         title: t(address.concat('users tested')),
         field: 'SafetyCheckPerUsers',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'right',
         headerHozAlign: 'right',
         formatter: reactFormatter(<ShowCount />),
         width: 150,
      },

      {
         title: 'Actions',
         headerFilter: false,
         headerSort: false,
         hozAlign: 'center',
         cellClick: (e, cell) => {
            e.stopPropagation()
            const { id } = cell._cell.row.data
            deleteCheck({
               variables: { id },
            })
         },
         formatter: reactFormatter(<DeleteCheck />),
         width: 150,
      },
   ]

   return (
      <div>
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={data}
            rowClick={rowClick}
            options={tableOptions}
         />
      </div>
   )
}

function DeleteCheck() {
   return <DeleteIcon color="#FF5A52" />
}

function ShowDate({
   cell: {
      _cell: { value },
   },
}) {
   return <>{moment(value).format('LLL')}</>
}

function ShowCount({
   cell: {
      _cell: { value },
   },
}) {
   if (value && value.length) return value.length
   return '0'
}

export default SafetyChecksListing
