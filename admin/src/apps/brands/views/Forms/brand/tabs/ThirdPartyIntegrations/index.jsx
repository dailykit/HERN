import React from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import { Flex, Text, TextButton, Spacer } from '@dailykit/ui'

import { logger } from '../../../../../../../shared/utils'
import { InlineLoader, Tooltip } from '../../../../../../../shared/components'

export const ThirdPartyIntegrations = ({ brand = {} }) => {
   return (
      <Flex padding="16px">
         <Parseur id={brand?.parseurMailBoxId} />
      </Flex>
   )
}

const Parseur = ({ id = '' }) => {
   const params = useParams()
   const [mailbox, setMailbox] = React.useState({})
   const [loading, setLoading] = React.useState(true)
   const [error, setError] = React.useState('')
   React.useEffect(() => {
      if (id) {
         ;(async () => {
            try {
               const response = await axios(
                  `${window._env_.REACT_APP_DAILYOS_SERVER_URI}/api/parseur/${id}`
               )
               if (response.status === 200 && response.statusText === 'OK') {
                  if (response.data.success) {
                     setMailbox(response.data.data)
                     setError('')
                  } else {
                     setError('Something went wrong. Please try again later!')
                  }
               } else {
                  setError('Something went wrong. Please try again later!')
               }
            } catch (error) {
               setError('Something went wrong. Please try again later!')
            } finally {
               setLoading(false)
            }
         })()
      } else {
         setLoading(false)
      }
   }, [id])

   const integrate = React.useCallback(() => {
      ;(async () => {
         try {
            const response = await axios({
               method: 'POST',
               url: `${window._env_.REACT_APP_DAILYOS_SERVER_URI}/api/parseur`,
               data: { brand: { id: params.id } },
            })
            if (response.status === 200 && response.statusText === 'OK') {
               if (response.data.success) {
               } else {
                  throw response.data
               }
            }
         } catch (error) {
            logger(error)
         }
      })()
   }, [params.id])

   const remove = React.useCallback(() => {
      ;(async () => {
         try {
            const response = await axios({
               method: 'DELETE',
               url: `${window._env_.REACT_APP_DAILYOS_SERVER_URI}/api/parseur`,
               data: {
                  brand: { id: params.id },
                  mailbox: { id },
               },
            })
            if (response.status === 200 && response.statusText === 'OK') {
               if (!response.data.success) {
                  throw response.data
               }
            }
         } catch (error) {
            logger(error)
         }
      })()
   }, [params, id])

   return (
      <>
         <Flex
            as="header"
            container
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2">Parseur</Text>
               <Tooltip identifier="brands_thirdPartyIntegrations_section_parseur" />
            </Flex>
            {id ? (
               <TextButton type="outline" onClick={remove}>
                  Remove Integration
               </TextButton>
            ) : (
               <TextButton type="outline" onClick={integrate}>
                  Add Integration
               </TextButton>
            )}
         </Flex>
         <Spacer size="12px" />
         {loading ? (
            <InlineLoader />
         ) : (
            <Flex as="main">
               {id ? (
                  <>
                     {error ? (
                        <Text as="p">
                           <span>⚠</span> &nbsp; {error}
                        </Text>
                     ) : (
                        <Flex>
                           <Detail>
                              <span>Id:</span>
                              <span>{mailbox?.id}</span>
                           </Detail>
                           <Spacer size="4px" />
                           <Detail>
                              <span>Name:</span>
                              <span>{mailbox?.name}</span>
                           </Detail>
                           <Spacer size="4px" />
                           <Detail>
                              <span>Email:</span>
                              <span>{mailbox?.email_prefix}</span>
                              @in.parseur.com
                           </Detail>
                           <Spacer size="4px" />
                           <Detail>
                              <span>Category:</span>
                              <span>
                                 {mailbox?.master_parser_name}(
                                 {mailbox?.master_parser_slug})
                              </span>
                           </Detail>
                           <Spacer size="12px" />
                           <Text as="h3">Instructions</Text>
                           <Spacer size="4px" />
                           <Text as="p">
                              Set the given mailbox email as forwarding email in
                              your email client. Following list provides you
                              with guides to different email clients.
                           </Text>
                           <Spacer size="8px" />
                           <EmailGuides>
                              <EmailGuide
                                 title="Gmail"
                                 link="https://support.google.com/mail/answer/10957?hl=en"
                              />
                              <Spacer size="4px" />
                              <EmailGuide
                                 title="Outlook"
                                 link="https://support.microsoft.com/en-us/office/turn-on-automatic-forwarding-in-outlook-on-the-web-7f2670a1-7fff-4475-8a3c-5822d63b0c8e"
                              />
                              <Spacer size="4px" />
                              <EmailGuide
                                 title="Yahoo"
                                 link="https://help.yahoo.com/kb/auto-forwarding-address-sln29133.html"
                              />
                           </EmailGuides>
                        </Flex>
                     )}
                  </>
               ) : (
                  <Flex
                     container
                     height="80px"
                     alignItems="center"
                     justifyContent="center"
                  >
                     <Text as="p">
                        <span>⚠</span> &nbsp; Integration Pending
                     </Text>
                  </Flex>
               )}
            </Flex>
         )}
      </>
   )
}

const Detail = styled.section`
   span:first-child {
      color: #6b6565;
      margin-right: 4px;
   }
`

const EmailGuides = styled.ul`
   padding-left: 14px;
`

const EmailGuide = ({ title, link }) => {
   return (
      <li>
         <Text as="p">
            For {title}:{' '}
            <a target="_blank" rel="noopener noreferrer" href={link}>
               Visit Here
            </a>
         </Text>
      </li>
   )
}
