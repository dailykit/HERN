import React from 'react'
import * as moment from 'moment'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   ButtonTile,
   Checkbox,
   Loader,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableRow,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'

import { DeleteIcon } from '../../../assets/icons'
import {
   reducer,
   SafetyCheckContext,
   state as initialState,
} from '../../../context/check'
import { DELETE_CHECKUP, SAFETY_CHECK, USERS } from '../../../graphql'
import { Container, StyledBody, StyledHeader, StyledWrapper } from '../styled'
import { CheckTunnel, UserTunnel } from './tunnels'
import { Banner } from '../../../../../shared/components'

const address = 'apps.safety.views.forms.safetyform.'
export default function SimpleRecipeProduct() {
   const { t } = useTranslation()
   const { id } = useParams()

   const [checkState, checkDispatch] = React.useReducer(reducer, initialState)

   const [state, setState] = React.useState({})

   const [tunnels, openTunnel, closeTunnel] = useTunnel()

   const [users, setUsers] = React.useState([])

   // Subscription
   const { loading } = useSubscription(SAFETY_CHECK, {
      variables: {
         id,
      },
      onSubscriptionData: data => {
         setState(data.subscriptionData.data.safety_safetyCheck[0])
      },
   })
   useSubscription(USERS, {
      onSubscriptionData: data => {
         const users = data.subscriptionData.data.settings_user.map(user => ({
            id: user.id,
            title: user.firstName + ' ' + user.lastName,
         }))
         setUsers(users)
      },
   })

   // Mutation
   const [deleteCheckup] = useMutation(DELETE_CHECKUP, {
      onCompleted: () => {
         toast.success(t(address.concat('check deleted!')))
      },
      onError: error => {
         console.log(error)
         toast.error(t(address.concat('error')))
      },
   })

   if (loading) return <Loader />

   return (
      <SafetyCheckContext.Provider value={{ checkState, checkDispatch }}>
         <Banner id="safety-apps-safety-checks-safety-check-details-top" />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <UserTunnel
                  openTunnel={openTunnel}
                  closeTunnel={closeTunnel}
                  users={users}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <CheckTunnel state={state} closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <StyledWrapper>
            <StyledHeader>
               <div>
                  <Text as="title">
                     {moment(state.created_at).format('LLL')}
                  </Text>
               </div>
            </StyledHeader>
            <StyledBody>
               <Container paddingX="64">
                  <Text as="p">{t(address.concat('users'))}</Text>
                  <Container
                     bottom="32"
                     hidden={!state.SafetyCheckPerUsers?.length}
                  >
                     <Table>
                        <TableHead>
                           <TableRow>
                              <TableCell>{t(address.concat('name'))}</TableCell>
                              <TableCell>
                                 {t(address.concat('uses mask'))}
                              </TableCell>
                              <TableCell>
                                 {t(address.concat('uses sanitizer'))}
                              </TableCell>
                              <TableCell>
                                 {t(address.concat('temprature'))}
                              </TableCell>
                              <TableCell></TableCell>
                           </TableRow>
                        </TableHead>
                        <TableBody>
                           {state.SafetyCheckPerUsers?.map(check => (
                              <TableRow key={check.id}>
                                 <TableCell>
                                    {check.user.firstName +
                                       ' ' +
                                       check.user.lastName}
                                 </TableCell>
                                 <TableCell>
                                    <Checkbox
                                       checked={check.usesMask}
                                       onChange={() => console.log()}
                                    />
                                 </TableCell>
                                 <TableCell>
                                    <Checkbox
                                       checked={check.usesSanitizer}
                                       onChange={() => console.log()}
                                    />
                                 </TableCell>
                                 <TableCell>
                                    {check.temperature} &deg;F
                                 </TableCell>
                                 <TableCell>
                                    <span
                                       onClick={() =>
                                          deleteCheckup({
                                             variables: {
                                                id: check.id,
                                             },
                                          })
                                       }
                                    >
                                       <DeleteIcon color="#FF5A52" />
                                    </span>
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </Container>
                  <Container>
                     <ButtonTile
                        type="secondary"
                        text={t(address.concat('add user'))}
                        onClick={() => openTunnel(1)}
                     />
                  </Container>
               </Container>
            </StyledBody>
         </StyledWrapper>
         <Banner id="safety-apps-safety-checks-safety-check-details-bottom" />
      </SafetyCheckContext.Provider>
   )
}
