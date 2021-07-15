import { useSubscription } from '@apollo/react-hooks'
import { Loader } from '@dailykit/ui'
import React from 'react'
import { useParams } from 'react-router-dom'
import { PACKAGING_SUBSCRIPTION } from '../../../graphql'
import { StyledWrapper } from '../styled'
import FormView from './FormView'
import { logger } from '../../../../../shared/utils'
import { ErrorState } from '../../../../../shared/components'

export default function SachetPackaging() {
   const { id } = useParams()

   const { error, loading, data: { packaging = {} } = {} } = useSubscription(
      PACKAGING_SUBSCRIPTION,
      {
         variables: { id },
      }
   )

   if (loading) return <Loader />

   if (error) {
      logger(error)
      return <ErrorState />
   }

   return (
      <>
         <StyledWrapper>
            <FormView state={packaging} />
         </StyledWrapper>
      </>
   )
}
