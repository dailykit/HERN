import React, { useState, useContext, useRef } from 'react'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   TunnelHeader,
   Loader,
   Flex,
   Form,
   Spacer,
   Dropdown,
   TextButton,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { TunnelBody } from './styled'
import { INSERT_SUBSCRIPTION_FOLD, GET_FILES } from '../../../../graphql'
import FoldContext from '../../../../context/Fold'

import {
   Tooltip,
   InlineLoader,
   Banner,
} from '../../../../../../shared/components'
import { logger } from '../../../../../../shared/utils'

export default function LinkFoldTunnel({ close }) {
   const identifierOptions = [
      { id: 1, title: 'select-plan-bottom-01' },
      { id: 2, title: 'select-delivery-bottom-01' },
      { id: 3, title: 'select-menu-bottom-01' },
      { id: 4, title: 'home-bottom-01' },
   ]
   const [foldContext, setFoldContext] = useContext(FoldContext)
   const [files, setFiles] = useState([])
   const [searchQueryForIdentifier, setSearchQueryForIdentifier] = useState('')
   const [searchQueryForFile, setSearchQueryForFile] = useState('')
   const [searchResultForIdentifier, setSearchResultForIdentifier] = useState(
      identifierOptions
   )
   const [searchResultForFile, setSearchResultForFile] = useState([])
   const [defaultIdentifierId, setDefaultIdentifierId] = useState(null)
   const [defaultFileId, setDefaultFileId] = useState(null)
   const selectedIdentifierRef = useRef(null)
   const selectedFileIdRef = useRef(null)

   const {
      loading: subscriptionLoading,
      error: subscriptionError,
   } = useSubscription(GET_FILES, {
      variables: {
         linkedFile: [],
         fileTypes: ['html'],
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { editor_file_aggregate: { nodes = [] } } = {},
         } = {},
      }) => {
         const result = nodes.map(file => {
            return {
               id: file.id,
               title: file.fileName,
               value: file.path,
               type: file.fileType,
            }
         })
         setFiles(result)
         setSearchResultForFile(result)
         console.log('completed...', result)
      },
   })

   const selectedOptionforIdentifier = option => {
      selectedIdentifierRef.current = option.title
   }
   const selectedOptionforFile = option => {
      selectedFileIdRef.current = option.id
   }

   // Mutation
   const [linkFold, { loading: mutationLoading }] = useMutation(
      INSERT_SUBSCRIPTION_FOLD,
      {
         onCompleted: () => {
            selectedIdentifierRef.current = 1
            selectedFileIdRef.current = null
            setSearchQueryForFile('')
            setSearchQueryForIdentifier('')
            setSearchResultForFile([])
            setSearchResultForIdentifier([])
            setDefaultFileId(null)
            setDefaultIdentifierId(null)
            close(1)
            toast.success('Fold linked successfully!')
         },
         onError: error => {
            toast.error(`Error : ${error.message}`)
         },
      }
   )

   const closeFunc = () => {
      selectedIdentifierRef.current = 1
      selectedFileIdRef.current = null
      setSearchQueryForFile('')
      setSearchQueryForIdentifier('')
      setSearchResultForFile([])
      setSearchResultForIdentifier([])
      setDefaultFileId(null)
      setDefaultIdentifierId(null)
      close(1)
   }
   const linkFoldHandler = () => {
      // if (pageTitle.meta.isValid && pageRoute.meta.isValid) {
      linkFold({
         variables: {
            identifier: selectedIdentifierRef.current,
            fileId: selectedFileIdRef.current,
         },
      })
      // }
   }

   React.useEffect(() => {
      const result = identifierOptions.filter(option =>
         option.title.toLowerCase().includes(searchQueryForIdentifier)
      )
      setSearchResultForIdentifier(result)
   }, [searchQueryForIdentifier])

   React.useEffect(() => {
      const result = files.filter(option =>
         option.title.toLowerCase().includes(searchQueryForFile)
      )
      setSearchResultForFile(result)
   }, [searchQueryForFile])

   React.useEffect(() => {
      if (
         Object.keys(foldContext).length &&
         files.length &&
         foldContext.tunnelRole === 'update'
      ) {
         const identifier = identifierOptions.find(
            option => option.title === foldContext.identifier
         )
         const fileIndex = files.findIndex(
            file => file.id === foldContext.fileId
         )
         if (fileIndex !== -1) {
            setDefaultFileId(fileIndex + 1)
            selectedFileIdRef.current = files[fileIndex].id
         } else {
            setDefaultFileId(null)
         }
         if (identifier && Object.keys(identifier).length) {
            setDefaultIdentifierId(identifier.id)
            selectedIdentifierRef.current = identifier.title
         } else {
            setDefaultFileId(null)
         }
      }
   }, [foldContext, files])

   if (subscriptionError) {
      logger(subscriptionError)
   }
   if (subscriptionLoading || !searchResultForFile.length) {
      return <InlineLoader />
   }
   return (
      <>
         <TunnelHeader
            title="Link Subscription Fold"
            right={{
               action: () => linkFoldHandler(),
               title: mutationLoading ? (
                  <TextButton isLoading={mutationLoading} type="solid">
                     Loading
                  </TextButton>
               ) : (
                  foldContext?.tunnelRole.toUpperCase() || 'Save'
               ),
            }}
            close={() => closeFunc()}
            tooltip={
               <Tooltip identifier="subscriptionFold_linking_tunnelHeader" />
            }
         />
         <Banner id="content-app-subscription-subscription-fold-tunnel-top" />
         <TunnelBody>
            <Form.Group>
               <Flex container alignItems="flex-end">
                  <Form.Label htmlFor="name" title="Page Name">
                     Identifier*
                  </Form.Label>
                  <Tooltip identifier="fold_identifier_info" />
               </Flex>
               <Dropdown
                  type="single"
                  defaultValue={defaultIdentifierId || null}
                  options={searchResultForIdentifier}
                  searchedOption={option => setSearchQueryForIdentifier(option)}
                  selectedOption={option => selectedOptionforIdentifier(option)}
                  placeholder="type what you're looking for..."
               />
            </Form.Group>
            <Spacer size="16px" />
            <Form.Group>
               <Flex container alignItems="flex-end">
                  <Form.Label htmlFor="name" title="Page URL">
                     Select file*
                  </Form.Label>
                  <Tooltip identifier="page_route_info" />
               </Flex>

               <Dropdown
                  type="single"
                  defaultValue={defaultFileId || null}
                  options={searchResultForFile}
                  searchedOption={option => setSearchQueryForFile(option)}
                  selectedOption={option => selectedOptionforFile(option)}
                  placeholder="type what you're looking for..."
               />
            </Form.Group>
         </TunnelBody>
         <Banner id="content-app-subscription-subscription-fold-tunnel-bottom" />
      </>
   )
}
