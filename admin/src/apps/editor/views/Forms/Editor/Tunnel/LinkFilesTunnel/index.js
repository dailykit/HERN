import React from 'react'
import { TunnelHeader, Tunnel, Tunnels, Loader, Flex, Text } from '@dailykit/ui'
import { TunnelBody } from './style'
import LinkFiles from '../../../../../../content/views/Forms/Page/ContentSelection/components/LinkFiles'

import { useTabsInfo } from '../../../../../context'
import { useSubscription } from '@apollo/react-hooks'
import { GET_FILE_ID_BY_PATH } from '../../../../../graphql'

export default function LinkFilesTunnel({ tunnels, closeTunnel }) {
   const { tabInfo } = useTabsInfo()
   const [fileId, setFileId] = React.useState(null)

   const { loading: isIdLoading } = useSubscription(GET_FILE_ID_BY_PATH, {
      variables: { where: { path: { _eq: tabInfo?.filePath } } },
      onSubscriptionData: ({
         subscriptionData: { data: { editor_file = [] } = {} } = {},
      }) => {
         setFileId(editor_file[0]?.id)
      },
      skip: !tabInfo?.filePath,
   })

   if (isIdLoading) return <Loader />
   return (
      <div>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="sm">
               <TunnelHeader title="Link Files" close={() => closeTunnel(1)} />
               <TunnelBody>
                  {fileId ? (
                     <>
                        <LinkFiles
                           title="Linked CSS with this file"
                           fileType="css"
                           entityId={fileId}
                           scope="html-file"
                        />
                        <LinkFiles
                           title="Linked JS with this file"
                           fileType="js"
                           entityId={fileId}
                           scope="html-file"
                        />
                     </>
                  ) : (
                     <Flex padding="32px">
                        <Text as="subtitle">(File not found)</Text>
                     </Flex>
                  )}
               </TunnelBody>
            </Tunnel>
         </Tunnels>
      </div>
   )
}
