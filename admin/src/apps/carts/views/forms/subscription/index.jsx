import React from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router'

import { ManualProvider } from './state'
import { Aside, Main } from './sections'
import { useTabs } from '../../../../../shared/providers'

export const Subscription = () => {
   const params = useParams()
   const { tab, addTab } = useTabs()

   React.useEffect(() => {
      if (!tab) {
         addTab(params.id, `/carts/subscription/${params.id}`)
      }
   }, [tab, addTab])
   return (
      <ManualProvider>
         <ManualContent />
      </ManualProvider>
   )
}

const ManualContent = () => {
   return (
      <Styles.Layout>
         <Main />
         <Aside />
      </Styles.Layout>
   )
}

const Styles = {
   Layout: styled.div`
      height: 100%;
      display: grid;
      grid-template-rows: 1fr;
      grid-template-areas: 'main aside';
      grid-template-columns: repeat(2, 1fr);
   `,
}
