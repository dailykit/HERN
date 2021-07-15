import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { TunnelHeader, Input, Checkbox } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

import { TunnelBody, StyledInputWrapper } from '../styled'
import { SafetyCheckContext } from '../../../../../context/check'
import { Grid, Container } from '../../../styled'
import { CREATE_CHECKUP } from '../../../../../graphql'
import { Banner } from '../../../../../../../shared/components'

const address = 'apps.safety.views.forms.safetyform.tunnels.checktunnel.'

const CheckTunnel = ({ state, closeTunnel }) => {
   const { t } = useTranslation()
   const { checkState } = React.useContext(SafetyCheckContext)

   const [busy, setBusy] = React.useState(false)
   const [mask, setMask] = React.useState(false)
   const [sanitizer, setSanitizer] = React.useState(false)
   const [temp, setTemp] = React.useState('')

   //
   // Mutation
   const [addCheckup] = useMutation(CREATE_CHECKUP, {
      variables: {
         object: {
            SafetyCheckId: state.id,
            temperature: temp,
            userId: checkState.user.id,
            usesMask: mask,
            usesSanitizer: sanitizer,
         },
      },
      onCompleted: () => {
         toast.success(t(address.concat('checkup added!')))
         closeTunnel(2)
         closeTunnel(1)
      },
      onError: error => {
         console.log(error)
         toast.error(t(address.concat('error')))
         setBusy(false)
      },
   })

   // Handlers
   const save = () => {
      if (busy) return
      setBusy(true)
      addCheckup()
   }

   return (
      <>
         <TunnelHeader
            title={`
            ${t(address.concat('enter checkup details for'))} : ${
               checkState.user.title
            }`}
            close={() => closeTunnel(2)}
            right={{
               action: save,
               title: busy ? 'Saving...' : 'Save',
            }}
         />
         <Banner id="safety-apps-safety-checks-safety-check-details-check-tunnel-top" />
         <TunnelBody>
            <Grid>
               <Checkbox checked={mask} onChange={setMask}>
                  {t(address.concat('uses mask'))}
               </Checkbox>
               <Checkbox checked={sanitizer} onChange={setSanitizer}>
                  {t(address.concat('uses sanitizer'))}
               </Checkbox>
            </Grid>
            <Container top="32">
               <StyledInputWrapper width="120">
                  <Input
                     type="text"
                     label={t(address.concat('temprature'))}
                     name="temp"
                     value={temp}
                     onChange={e => setTemp(e.target.value)}
                  />
                  &deg;F
               </StyledInputWrapper>
            </Container>
         </TunnelBody>
         <Banner id="safety-apps-safety-checks-safety-check-details-check-tunnel-bottom" />
      </>
   )
}

export default CheckTunnel
