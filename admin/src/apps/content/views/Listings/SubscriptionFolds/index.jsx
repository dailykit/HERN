import React, { useRef, useState, useEffect, useContext } from 'react'
import {
   Text,
   Flex,
   IconButton,
   ComboButton,
   Tunnels,
   Tunnel,
   useTunnel,
   PlusIcon,
} from '@dailykit/ui'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { StyledWrapper } from './styled'
import LinkFoldTunnel from './Tunnel'
import options from '../tableOption'
import FoldContext from '../../../context/Fold'
// import BrandContext from '../../../context/Brand'
import {
   GET_SUBSCRIPTION_FOLDS,
   DELETE_SUBSCRIPTION_FOLD,
} from '../../../graphql'
import { logger } from '../../../../../shared/utils'
import { Tooltip, InlineLoader, Banner } from '../../../../../shared/components'
import { DeleteIcon } from '../../../../../shared/assets/icons'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import { BrandContext } from '../../../../../App'

const SubscriptionFoldListing = () => {
   const { tab, addTab, closeAllTabs } = useTabs()
   const location = useLocation()
   const [tunnels, openTunnel, closeTunnel] = useTunnel()
   const [foldContext, setFoldContext] = useContext(FoldContext)
   // const [context, setContext] = useContext(BrandContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)

   const { tooltip } = useTooltip()
   const tableRef = useRef(null)
   const [foldList, setFoldList] = useState(undefined)
   const { brandId } = brandContext
   const prevBrandId = useRef(brandId)

   //    Subscription for page listing
   const { loading, error: subscriptionError } = useSubscription(
      GET_SUBSCRIPTION_FOLDS,
      {
         onSubscriptionData: ({
            subscriptionData: {
               data: { content_subscriptionDivIds: foldsInfo = [] } = {},
            } = {},
         } = {}) => {
            const result = foldsInfo.map(fold => {
               return {
                  identifier: fold.identifier,
                  fileId: fold?.fileId || 'No file linked',
                  fileName: fold?.subscriptionDivFileId?.fileName || 'N/A',
                  filePath: fold?.subscriptionDivFileId?.path || 'N/A',
               }
            })
            setFoldList(result)
         },
      }
   )

   //  Mutation for deleting subscription fold
   const [deleteFold] = useMutation(DELETE_SUBSCRIPTION_FOLD, {
      onCompleted: () => {
         toast.success('Fold deleted!')
      },
      onError: error => {
         logger(error)
         toast.error('Could not delete!')
      },
   })

   //    // Mutation for page publish toggle
   //    const [updatePage] = useMutation(UPDATE_WEBPAGE, {
   //       onCompleted: () => {
   //          toast.success('Updated!')
   //       },
   //       onError: error => {
   //          toast.error('Something went wrong')
   //          logger(error)
   //       },
   //    })

   useEffect(() => {
      if (!tab) {
         addTab('Pages', location.pathname)
      }
   }, [addTab, tab])

   // delete Handler
   const deleteHandler = (e, fold) => {
      e.stopPropagation()
      if (
         window.confirm(
            `Are you sure you want to delete  ${fold.fileName} fold linked with ${fold.identifier}?`
         )
      ) {
         deleteFold({
            variables: {
               identifier: fold.identifier,
               fileId: fold.fileId,
            },
         })
      }
   }

   const rowClick = (e, cell) => {
      const rowData = cell._cell.row.data
      setFoldContext({ ...rowData, tunnelRole: 'update' })
      openTunnel(1)
   }

   const DeleteButton = () => {
      return (
         <IconButton type="ghost">
            <DeleteIcon color="#FF5A52" />
         </IconButton>
      )
   }

   const openTunnelHandler = () => {
      setFoldContext({ ...foldContext, tunnelRole: 'insert' })
      openTunnel(1)
   }

   const columns = [
      {
         title: 'Identifier',
         field: 'identifier',
         headerFilter: true,
         hozAlign: 'left',
         cssClass: 'rowClick',
         cellClick: (e, cell) => {
            rowClick(e, cell)
         },
         headerTooltip: column => {
            const identifier = 'fold_listing_foldIdentifier_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },

         width: 300,
      },
      {
         title: 'File Id',
         field: 'fileId',
         headerFilter: true,
         hozAlign: 'left',
         titleFormatter: cell => {
            cell.getElement().style.textAlign = 'left'
            return '' + cell.getValue()
         },
         headerTooltip: column => {
            const identifier = 'fold_listing_fileId_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 150,
      },
      {
         title: 'File Name',
         field: 'fileName',
         hozAlign: 'left',
         headerTooltip: column => {
            const identifier = 'fold_listing_fileName_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },

         width: 200,
      },

      {
         title: 'File Path',
         field: 'filePath',
         hozAlign: 'left',
         headerTooltip: column => {
            const identifier = 'fold_listing_filePath_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Action',
         field: 'action',
         cellClick: (e, cell) => {
            e.stopPropagation()
            deleteHandler(e, cell._cell.row.data)
         },
         formatter: reactFormatter(<DeleteButton />),
         hozAlign: 'center',
         titleFormatter: cell => {
            cell.getElement().style.textAlign = 'center'
            return '' + cell.getValue()
         },
         width: 150,
      },
   ]

   if (brandContext.brandId !== prevBrandId.current) {
      closeAllTabs()
   }

   if (loading) {
      return <InlineLoader />
   }
   if (subscriptionError) {
      toast.error('Something went wrong!')
      logger(subscriptionError)
   }
   return (
      <StyledWrapper>
         <Banner id="content-app-subscriptions-listing-top" />
         <Flex
            container
            height="80px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h2" style={{ marginBottom: '0em' }}>
                  Subscription Folds(
                  {foldList?.length})
               </Text>
               <Tooltip identifier="subscriptionFold_list_heading" />
            </Flex>
            <ComboButton type="solid" size="md" onClick={openTunnelHandler}>
               <PlusIcon color="#fff" /> Link Fold
            </ComboButton>
         </Flex>

         {Boolean(foldList) && (
            <ReactTabulator
               columns={columns}
               data={foldList}
               options={{
                  ...options,
                  placeholder: 'No Folds Available Yet !',
               }}
               ref={tableRef}
            />
         )}
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <LinkFoldTunnel close={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="content-app-subscriptions-listing-bottom" />
      </StyledWrapper>
   )
}

export default SubscriptionFoldListing
