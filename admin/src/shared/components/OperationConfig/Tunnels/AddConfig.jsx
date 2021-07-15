import React, { useState } from 'react'
import { useLazyQuery } from '@apollo/react-hooks'
import { Spacer, Avatar, Flex, Text, TextButton } from '@dailykit/ui'
import { STATION, LABEL_TEMPLATE } from '../../../graphql'
import { InlineLoader } from '../../InlineLoader'

export const AddConfigTunnel = ({ stationId, labelId, openTunnel }) => {
   const [labelName, setlabelName] = useState('')

   const [
      fetchStation,
      {
         loading: stationLoading,
         error: stationError,
         data: { station = {} } = {},
      },
   ] = useLazyQuery(STATION, {
      variables: { stationId },
   })

   const [
      fetchLabelTemplate,
      { loading: labelLoading, error: labelError },
   ] = useLazyQuery(LABEL_TEMPLATE, {
      variables: { labelId },
      onCompleted: data => {
         const label = data.labelTemplate.name
         const UpperName = label.charAt(0).toUpperCase() + label.slice(1)
         setlabelName(UpperName)
      },
   })

   React.useEffect(() => {
      if (stationId) {
         fetchStation()
      }
   }, [stationId, fetchStation])

   React.useEffect(() => {
      if (labelId) {
         fetchLabelTemplate()
      }
   }, [labelId, fetchLabelTemplate])

   if (stationLoading || labelLoading) return <InlineLoader />
   if (stationError || labelError)
      return <div>An error has occurred, try again!</div>

   return (
      <Flex padding=" 16px">
         <Spacer size="16px" />
         <Text as="title">Station</Text>
         <Spacer size="16px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <section>
               {station?.name ? (
                  <Avatar withName title={station?.name} url="" type="round" />
               ) : (
                  'Select a station'
               )}
            </section>
            <TextButton type="outline" onClick={() => openTunnel(3)}>
               Add Station
            </TextButton>
         </Flex>
         <Spacer size="70px" />
         <Text as="title">Label Template</Text>
         <Spacer size="16px" />
         <Flex container alignItems="center" justifyContent="space-between">
            <section>
               {labelName ? (
                  <Avatar withName title={labelName} url="" type="round" />
               ) : (
                  'Select a label template'
               )}
            </section>
            <TextButton type="outline" onClick={() => openTunnel(4)}>
               Add Label
            </TextButton>
         </Flex>
      </Flex>
   )
}
