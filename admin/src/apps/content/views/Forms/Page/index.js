import React, { useState, useEffect, useContext, useRef } from 'react'
import {
   Flex,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   Form,
   Spacer,
   useTunnel,
   TextButton,
   Tunnel,
   Tunnels,
} from '@dailykit/ui'
import { useSubscription, useMutation, useQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTabs } from '../../../../../shared/providers'
import { StyledWrapper, InputWrapper, StyledDiv, Highlight } from './styled'
import { PAGE_INFO, UPDATE_WEBPAGE } from '../../../graphql'
import { logger } from '../../../../../shared/utils'
import {
   Tooltip,
   InlineLoader,
   InsightDashboard,
   Banner,
} from '../../../../../shared/components'
import ContentSelection from './ContentSelection'
import { PagePreviewTunnel } from './Tunnel'
// for SEO Tools
import { SEObasics, SocialShare, TwitterCard, RichResults } from './SEO'
import { BrandContext } from '../../../../../App'

import BrandListing from '../../../utils/BrandListing'

const PageForm = () => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel()
   const { addTab, tab, setTabTitle, closeAllTabs } = useTabs()
   const [brandContext] = React.useContext(BrandContext)
   const prevBrandId = useRef(brandContext.brandId)
   const { pageId, pageName } = useParams()
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
   const [state, setState] = useState({})
   const [toggle, setToggle] = useState(false)


   const [brandListTunnel, openBrandListTunnel, closeBrandListTunnel] =
      useTunnel(1)

   React.useEffect(() => {
      if (brandContext.brandId == null) {
         openBrandListTunnel(1)
      }
   }, [brandContext.brandId])

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
         if (!text.includes('/')) {
            isValid = false
            errors = [...errors, 'Invalid route!Must start with ' / '.']
         }
      }
      return { isValid, errors }
   }

   // Subscription
   const { loading: pageLoading, error: pageLoadingError } = useSubscription(
      PAGE_INFO,
      {
         variables: {
            pageId,
         },
         onSubscriptionData: ({
            subscriptionData: {
               data: { brands_brandPages_by_pk: brandPage = {} } = {},
            } = {},
         }) => {
            setState(brandPage || {})
            setPageTitle({
               ...pageTitle,
               value: brandPage?.internalPageName || '',
            })

            setPageRoute({
               ...pageRoute,
               value: brandPage?.route || '',
            })
            setToggle(brandPage?.published)
         },
      }
   )

   // Mutation for page publish toggle
   const [updatePage] = useMutation(UPDATE_WEBPAGE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong with update_webpage')
         console.log(error)
         logger(error)
      },
   })

   const updatetoggle = () => {
      const val = !toggle
      // if (val && !state.isCouponValid.status) {
      //    toast.error('Coupon should be valid!')
      // } else {
      updatePage({
         variables: {
            pageId: pageId,
            set: {
               published: val,
            },
         },
      })
      // }
   }

   useEffect(() => {
      if (!tab) {
         addTab('Pages', '/content/pages')
      }
   }, [addTab, tab])

   // whenever pageTitle value changes the tab title will be updated also
   useEffect(() => {
      if (pageTitle.value && !Boolean(pageTitle.meta.errors.length)) {
         setTabTitle(pageTitle.value)
      }
   }, [pageTitle])

   // if (brandContext.brandId !== prevBrandId.current) {
   //    closeAllTabs()
   // }

   // page name validation & update name handler
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
         if (
            validatePageName(e.target.value, e.target.name).isValid &&
            validatePageName(e.target.value, e.target.name).errors.length === 0
         ) {
            updatePage({
               variables: {
                  pageId: pageId,
                  set: {
                     internalPageName: e.target.value,
                  },
               },
            })
         }
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
         if (
            validatePageName(e.target.value, e.target.name).isValid &&
            validatePageName(e.target.value, e.target.name).errors.length === 0
         ) {
            updatePage({
               variables: {
                  pageId: pageId,
                  set: {
                     route: e.target.value,
                  },
               },
            })
         }
      }
   }

   if (pageLoading) {
      return <InlineLoader />
   }
   if (pageLoadingError) {
      toast.error('Something went wrong')
      logger(pageLoadingError)
   }

   return (<>
      <StyledWrapper>
         <Banner id="content-app-pages-page-details-top" />
         <InputWrapper>
            <Flex
               container
               alignItems="center"
               justifyContent="space-between"
               padding="0 0 16px 0"
            >
               <Form.Group>
                  <Form.Text
                     id="pageTitle"
                     name="pageTitle"
                     value={pageTitle.value}
                     variant="revamp"
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
               <Flex container alignItems="center" height="100%">
                  <TextButton onClick={() => openTunnel(1)} type="ghost">
                     PREVIEW PAGE
                  </TextButton>
                  <Spacer xAxis size="24px" />
                  <Form.Toggle
                     name="page_published"
                     onChange={updatetoggle}
                     value={toggle}
                  >
                     <Flex container alignItems="center">
                        Publish
                        <Tooltip identifier="page_publish_info" />
                     </Flex>
                  </Form.Toggle>
               </Flex>
            </Flex>
         </InputWrapper>
         <StyledDiv>
            <HorizontalTabs>
               <div className="styleTab">
                  <HorizontalTabList>
                     <HorizontalTab>Details</HorizontalTab>
                     <HorizontalTab>SEO Tools</HorizontalTab>
                  </HorizontalTabList>
               </div>
               <HorizontalTabPanels>
                  <div className="styleTab">
                     <HorizontalTabPanel>
                        <Flex container padding="16px 0">
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
                                    value={"https://" + brandContext.brandDomain}
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
                        </Flex>
                        <ContentSelection />
                     </HorizontalTabPanel>
                  </div>
                  <div className="styleTab">
                     <HorizontalTabPanel>
                        <SEObasics routeName={pageRoute.value} />
                        <SocialShare routeName={pageRoute.value} />
                        <TwitterCard routeName={pageRoute.value} />
                        <RichResults routeName={pageRoute.value} />
                     </HorizontalTabPanel>
                  </div>
               </HorizontalTabPanels>
            </HorizontalTabs>
         </StyledDiv>
         <PagePreviewTunnel
            tunnels={tunnels}
            openTunnel={openTunnel}
            closeTunnel={closeTunnel}
            pageRoute={pageRoute}
         />
         <Banner id="content-app-pages-page-details-bottom" />
      </StyledWrapper>
      <Tunnels tunnels={brandListTunnel}>
         <Tunnel popup={true} layer={1} size="md">
            <BrandListing
               closeTunnel={closeBrandListTunnel}
            />
         </Tunnel>
      </Tunnels>
   </>
   )
}

export default PageForm
