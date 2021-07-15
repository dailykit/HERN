import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   Text,
   Spacer,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
} from '@dailykit/ui'

import { TabContent } from './styled'
import { Users } from './sections/Users'
import { Scales } from './sections/Scales'
import { STATIONS } from '../../../graphql'
import { logger } from '../../../../../shared/utils'
import { KotPrinters } from './sections/KotPrinters'
import { LabelPrinters } from './sections/LabelPrinters'
import { useTabs } from '../../../../../shared/providers'
import { InlineLoader, Tooltip, Banner } from '../../../../../shared/components'

const StationForm = () => {
   const params = useParams()
   const [title, setTitle] = React.useState({
      value: '',
      meta: {
         errors: [],
         isValid: false,
         isTouched: false,
      },
   })
   const { tab, addTab, setTabTitle } = useTabs()
   const [update] = useMutation(STATIONS.UPDATE, {
      onCompleted: () => toast.success('Successfully updated station name!'),
      onError: error => {
         toast.error('Failed to update the station name!')
         logger(error)
      },
   })
   const {
      loading,
      error,
      data: { station = {} } = {},
   } = useSubscription(STATIONS.STATION, {
      variables: { id: params.id },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         const { station } = data
         setTitle(title => ({ ...title, value: station.name }))
         setTabTitle(station.name)
      },
   })

   if (!loading && error) {
      toast.error('Failed to station details!')
      logger(error)
   }

   React.useEffect(() => {
      if (!tab && !loading && !isEmpty(station)) {
         addTab(station?.name, `/settings/stations/${params.id}`)
      }
   }, [tab, loading, params.id, addTab, station])

   const handleSubmit = value => {
      if (station.name === value) return
      update({
         variables: {
            _set: { name: value },
            pk_columns: { id: params.id },
         },
      })
   }

   const onTitleBlur = e => {
      const { isValid, errors } = validate.title(e.target.value)
      if (isValid) {
         handleSubmit(e.target.value)
      }
      setTitle(title => ({
         ...title,
         meta: {
            errors,
            isValid,
            isTouched: true,
         },
      }))
   }

   if (loading) return <InlineLoader />
   return (
      <Flex>
         <Banner id="settings-app-stations-station-details-top" />
         <Flex
            container
            as="header"
            padding="16px"
            minHeight="80px"
            style={{ borderBottom: '1px solid #f3f3f3' }}
         >
            <Form.Group>
               <Flex container alignItems="center">
                  <Form.Label htmlFor="title" title="title">
                     Title*
                  </Form.Label>
                  <Tooltip identifier="form_station_field_title" />
               </Flex>
               <Form.Text
                  id="title"
                  name="title"
                  value={title.value}
                  onBlur={onTitleBlur}
                  placeholder="Enter the title"
                  hasError={title.meta.isTouched && !title.meta.isValid}
                  onChange={e => setTitle({ ...title, value: e.target.value })}
               />
               {title.meta.isTouched &&
                  !title.meta.isValid &&
                  title.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
         </Flex>
         <Flex
            container
            as="section"
            height="48px"
            padding="0 16px"
            alignItems="center"
         >
            <Text as="h2">Configure</Text>
            <Tooltip identifier="station_form_section_configure" />
         </Flex>
         {station?.name && (
            <HorizontalTabs>
               <HorizontalTabList>
                  <Spacer size="16px" xAxis />
                  <HorizontalTab>
                     Users ({station.user.aggregate.count})
                  </HorizontalTab>
                  <HorizontalTab>
                     Labels Printers ({station.labelPrinter.aggregate.count})
                  </HorizontalTab>
                  <HorizontalTab>
                     KOT Printers ({station.kotPrinter.aggregate.count})
                  </HorizontalTab>
                  <HorizontalTab>
                     Scales ({station.scale.aggregate.count})
                  </HorizontalTab>
               </HorizontalTabList>
               <TabContent>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        <Users station={station} />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <LabelPrinters station={station} />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <KotPrinters station={station} />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <Scales station={station} />
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </TabContent>
            </HorizontalTabs>
         )}
         <Banner id="settings-app-stations-station-details-bottom" />
      </Flex>
   )
}

export default StationForm

const validate = {
   title: (value = '') => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text.length < 3) {
         isValid = false
         errors = [...errors, 'Must have atleast two letters.']
      }
      return { isValid, errors }
   },
}
