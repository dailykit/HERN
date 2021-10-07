import React, { useState, useContext } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { TunnelHeader, Loader, Flex, Form, Spacer } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { TunnelBody, StyledWrapper, InputWrapper } from './styled'
import { useTabs } from '../../../../../../shared/providers'
import { CREATE_WEBPAGE } from '../../../../graphql'
import BrandContext from '../../../../context/Brand'

import { Tooltip, Banner } from '../../../../../../shared/components'

export default function PageCreationTunnel({ close }) {
   const { addTab } = useTabs()
   const [context, setContext] = useContext(BrandContext)
   const { websiteId } = context
   const [types, setTypes] = useState([])
   const [pageTitle, setPageTitle] = useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [pageRoute, setPageRoute] = useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   // form validation
   const validatePageName = (value, name) => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (name === 'pageTitle') {
         if (text.length < 2) {
            isValid = false
            errors = [...errors, 'Must have atleast two letters.']
         }
      } else {
         if (text.length < 1) {
            isValid = false
            errors = [...errors, 'Must have atleast one letters.']
         }
         if (!text.includes('/') && text.length > 0) {
            isValid = false
            errors = [...errors, "Invalid route..Must start with ' / '."]
         }
      }
      return { isValid, errors }
   }

   //Mutation
   const [createPage, { loading }] = useMutation(CREATE_WEBPAGE, {
      onCompleted: ({ insert_brands_brandPages_one: webPage = {} }) => {
         setPageRoute({
            value: '',
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         })
         setPageTitle({
            value: '',
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         })
         addTab(
            webPage.internalPageName,
            `/content/pages/${webPage.brandId}/${webPage.internalPageName}`
         )
         toast.success('Campaign created!')
      },
      onError: error => {
         toast.error(`Error : ${error.message}`)
      },
   })

   const onBlur = e => {
      if (e.target.name === 'pageTitle') {
         setPageTitle({
            ...pageTitle,
            meta: {
               ...pageTitle.meta,
               isTouched: true,
               errors: validatePageName(e.target.value, e.target.name).errors,
               isValid: validatePageName(e.target.value, e.target.name).isValid,
            },
         })
      } else {
         setPageRoute({
            ...pageRoute,
            meta: {
               ...pageRoute.meta,
               isTouched: true,
               errors: validatePageName(e.target.value, e.target.name).errors,
               isValid: validatePageName(e.target.value, e.target.name).isValid,
            },
         })
      }
   }

   const closeFunc = () => {
      close(1)
      setPageRoute({
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      })
      setPageTitle({
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      })
   }
   const createPageHandler = () => {
      if (pageTitle.meta.isValid && pageRoute.meta.isValid) {
         createPage({
            variables: {
               object: {
                  brandId: context.brandId,
                  route: pageRoute.value,
                  internalPageName: pageTitle.value,
               },
            },
         })
      }
   }
   return (
      <>
         <TunnelHeader
            title="Create Page"
            right={{
               action: () => createPageHandler(),
               title: loading ? 'Creating...' : 'Create',
            }}
            close={() => closeFunc()}
            tooltip={<Tooltip identifier="webpage_creation_tunnelHeader" />}
         />
         <Banner id="content-app-pages-create-page-tunnel-top" />
         <TunnelBody>
            <Form.Group>
               <Flex container alignItems="flex-end">
                  <Form.Label htmlFor="name" title="Page Name">
                     Page Name*
                  </Form.Label>
                  <Tooltip identifier="page_name_info" />
               </Flex>
               <Form.Text
                  id="pageTitle"
                  name="pageTitle"
                  value={pageTitle.value}
                  placeholder="Enter the Page Name "
                  onBlur={onBlur}
                  onChange={e =>
                     setPageTitle({
                        ...pageTitle,
                        value: e.target.value,
                     })
                  }
               />
               {pageTitle.meta.isTouched &&
                  !pageTitle.meta.isValid &&
                  pageTitle.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            <Spacer size="16px" />
            <Form.Group>
               <Flex container alignItems="flex-end">
                  <Form.Label htmlFor="name" title="Page URL">
                     Page Route*
                  </Form.Label>
                  <Tooltip identifier="page_route_info" />
               </Flex>
               <Flex container>
                  <Form.Text
                     id="domain"
                     name="domain"
                     value={context.brandDomain}
                     disabled
                  />
                  <Form.Text
                     id="pageRoute"
                     name="pageRoute"
                     value={pageRoute.value}
                     placeholder="Enter the Page Route "
                     onBlur={onBlur}
                     onChange={e =>
                        setPageRoute({
                           ...pageRoute,
                           value: e.target.value,
                        })
                     }
                  />
               </Flex>
               {pageRoute.meta.isTouched &&
                  !pageRoute.meta.isValid &&
                  pageRoute.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
         </TunnelBody>
         <Banner id="content-app-pages-create-page-tunnel-bottom" />
      </>
   )
}
