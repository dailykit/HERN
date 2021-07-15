import React from 'react'
import { useParams } from 'react-router-dom'

import Main from './Main'
import { useTabs } from '../../../../../shared/providers'

const RecurrencesForm = () => {
   const params = useParams()
   const { addTab, tab } = useTabs()

   React.useEffect(() => {
      if (!tab) {
         addTab('Recurrences', `/menu/settings/recurrences/${params.type}`)
      }
   }, [tab, addTab])
   return (
      <>
         <Main />
      </>
   )
}

export default RecurrencesForm
