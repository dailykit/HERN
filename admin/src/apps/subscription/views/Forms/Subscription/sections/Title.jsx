import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import {
   Tag,
   Form,
   Text,
   Flex,
   Tunnel,
   Spacer,
   Tunnels,
   PlusIcon,
   useTunnel,
   HelperText,
   IconButton,
   SectionTab,
   SectionTabs,
   TunnelHeader,
   SectionTabList,
   SectionTabPanel,
   SectionTabPanels,
} from '@dailykit/ui'

import Serving from './Serving'
import validate from '../validate'
import { usePlan } from '../state'
import { Header, Wrapper } from '../styled'
import { logger } from '../../../../../../shared/utils'
import { useTabs } from '../../../../../../shared/providers'
import {
   Banner,
   Tooltip,
   ErrorState,
   InlineLoader,
   ErrorBoundary,
   InsightDashboard,
} from '../../../../../../shared/components'
import { TickIcon, CloseIcon } from '../../../../../../shared/assets/icons'
import {
   TITLE,
   UPSERT_SUBSCRIPTION_TITLE,
   UPSERT_SUBSCRIPTION_SERVING,
} from '../../../../graphql'
import { MetaDetails } from './MetaDetails'

const Title = () => {
   const params = useParams()
   const { state, dispatch } = usePlan()
   const { tab, addTab, setTabTitle } = useTabs()
   const [tabIndex, setTabIndex] = React.useState(0)
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [servingTunnelState, setServingTunnelState] = React.useState('')
   const [upsertTitle] = useMutation(UPSERT_SUBSCRIPTION_TITLE, {
      onCompleted: ({ upsertSubscriptionTitle = {} }) => {
         if (isEmpty(upsertSubscriptionTitle)) return
         setTabTitle(upsertSubscriptionTitle?.title)
         toast.success('Successfully updated the title!')
      },
      onError: error => {
         toast.error('Failed to update the title!')
         logger(error)
      },
   })
   const {
      error,
      loading,
      data: { title = {} } = {},
   } = useSubscription(TITLE, {
      variables: {
         id: params.id,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { title: node = {} } = {} },
      }) => {
         if (isEmpty(node)) return

         dispatch({
            type: 'SET_TITLE',
            payload: {
               id: node.id,
               title: node.title,
               isActive: node.isActive,
               defaultServing: { id: node.defaultSubscriptionServingId },
            },
         })
         if (!tab) {
            addTab(node.title, `/subscription/subscriptions/${node.id}`)
         }
      },
   })

   const handleChange = e => {
      dispatch({
         type: 'SET_TITLE',
         payload: {
            title: e.target.value,
         },
      })
   }

   const saveTitle = e => {
      dispatch({
         type: 'SET_TITLE',
         payload: {
            meta: {
               isTouched: true,
               errors: validate.title(e.target.value).errors,
               isValid: validate.title(e.target.value).isValid,
            },
         },
      })
      if (!validate.title(e.target.value).isValid) return
      if (title.title === e.target.value) return
      upsertTitle({
         variables: {
            object: {
               id: params.id,
               title: e.target.value,
            },
         },
      })
   }

   const toggleIsActive = () => {
      if (!state.title.isActive && !title.isValid) {
         toast.error('Can not be published without any active servings!', {
            position: 'top-center',
         })
         return
      }
      upsertTitle({
         variables: {
            object: {
               id: state.title.id,
               title: state.title.title,
               isActive: !state.title.isActive,
            },
         },
      })
   }

   const toggleServingTunnel = type => {
      openTunnel(1)
      setServingTunnelState(type)
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Failed to fetch title details!')
      logger(error)
      return <ErrorState message="Failed to fetch title details!" />
   }
   return (
      <>
         <Banner id="subscription-app-create-subscription-form-top" />
         <Wrapper>
            <Header>
               <Form.Group>
                  <Form.Label htmlFor="title" title="title">
                     <Flex
                        container
                        alignItems="center"
                        style={{ marginLeft: '20px' }}
                     >
                        Subscription Title*
                        <Tooltip identifier="form_subscription_field_title" />
                     </Flex>
                  </Form.Label>
                  <Form.Text
                     id="title"
                     name="title"
                     value={state.title.title}
                     placeholder="Enter the title"
                     onBlur={e => saveTitle(e)}
                     onChange={e => handleChange(e)}
                     hasError={
                        state.title.meta.isTouched && !state.title.meta.isValid
                     }
                     style={{ marginLeft: '10px' }}
                  />
                  {state.title.meta.isTouched &&
                     !state.title.meta.isValid &&
                     state.title.meta.errors.map((node, index) => (
                        <Form.Error key={index}>{node}</Form.Error>
                     ))}
               </Form.Group>
               {title?.isDemo && <Tag>Demo</Tag>}
               <Flex
                  container
                  alignItems="center"
                  style={{ padding: '26px 26px 0px' }}
               >
                  {title.isValid ? (
                     <Flex container flex="1" alignItems="center">
                        <TickIcon size={20} color="green" />
                        <Spacer size="8px" xAxis />
                        <Text as="subtitle">All good!</Text>
                     </Flex>
                  ) : (
                     <Flex container flex="1" alignItems="center">
                        <CloseIcon size={8} color="red" />
                        <Spacer size="8px" xAxis />
                        <Text as="subtitle">
                           Must have atleast one active servings!
                        </Text>
                     </Flex>
                  )}
                  <Spacer size="16px" xAxis />
                  <Flex container alignItems="center">
                     <Form.Toggle
                        name="publish_title"
                        onChange={toggleIsActive}
                        value={state.title.isActive}
                     >
                        Publish
                     </Form.Toggle>
                     <Tooltip identifier="form_station_subscription_title_publish" />
                  </Flex>
               </Flex>
            </Header>

            <MetaDetails metaDetails={title.metaDetails} />

            <Flex
               as="section"
               height="calc(100% - 89px)"
               padding="0 14px 14px 14px"
            >
               <Flex
                  container
                  as="header"
                  height="48px"
                  alignItems="center"
                  justifyContent="space-between"
                  style={{ padding: '0px 18px' }}
               >
                  <Flex container alignItems="center">
                     <Text as="title">Servings</Text>
                     <Tooltip identifier="form_subscription_section_servings_heading" />
                  </Flex>
                  <IconButton
                     size="sm"
                     type="outline"
                     onClick={() => toggleServingTunnel('ADD_SERVING')}
                     style={{ marginTop: '4px', marginRight: '8px' }}
                  >
                     <PlusIcon />
                  </IconButton>
               </Flex>
               <SectionTabs
                  id="servingTabs"
                  onChange={index => setTabIndex(index)}
               >
                  <SectionTabList
                     id="servingTabList"
                     style={{ marginLeft: '10px' }}
                  >
                     {console.log('SERVINGS', title)}
                     {title?.servings.map(serving => (
                        <SectionTab key={serving.id}>
                           <Text as="title">{serving.size}</Text>
                        </SectionTab>
                     ))}
                  </SectionTabList>
                  <SectionTabPanels id="servingTabPanels">
                     {title?.servings.map((serving, index) => (
                        <SectionTabPanel key={serving.id}>
                           {tabIndex === index && (
                              <Serving
                                 id={serving.id}
                                 isActive={tabIndex === index}
                                 toggleServingTunnel={toggleServingTunnel}
                              />
                           )}
                        </SectionTabPanel>
                     ))}
                  </SectionTabPanels>
               </SectionTabs>
            </Flex>
            <ErrorBoundary rootRoute="/subscription/subscriptions">
               <Tunnels tunnels={tunnels}>
                  <Tunnel layer={1}>
                     <ServingTunnel
                        closeTunnel={closeTunnel}
                        servingTunnelState={servingTunnelState}
                     />
                  </Tunnel>
               </Tunnels>
            </ErrorBoundary>
         </Wrapper>
         <Banner id="subscription-app-create-subscription-form-bottom" />
      </>
   )
}

export default Title

const ServingTunnel = ({ servingTunnelState, closeTunnel }) => {
   const { state } = usePlan()
   const [serving, setServing] = React.useState({
      id: null,
      size: '',
      isActive: false,
      isDefault: false,
      meta: { errors: [], isValid: false, isTouched: false },
   })
   const hideTunnel = () => {
      closeTunnel(1)
   }
   const [upsertTitle] = useMutation(UPSERT_SUBSCRIPTION_TITLE)
   const [upsertServing] = useMutation(UPSERT_SUBSCRIPTION_SERVING, {
      onCompleted: ({ upsertSubscriptionServing = {} }) => {
         const { id } = upsertSubscriptionServing
         upsertTitle({
            variables: {
               object: {
                  id: state.title.id,
                  title: state.title.title,
                  defaultSubscriptionServingId: serving.isDefault ? id : null,
               },
            },
         })
         hideTunnel()
         toast.success('Successfully created the serving!')
      },
      onError: error => {
         logger(error)
         toast.error('Failed to create the serving')
      },
   })

   React.useEffect(() => {
      if (servingTunnelState === 'EDIT_SERVING') {
         setServing({
            id: state.serving?.id,
            size: state.serving.size,
            isActive: state.serving.isActive,
            isDefault: state.serving.isDefault,
            meta: { errors: [], isValid: false, isTouched: false },
         })
      } else {
         setServing({
            id: null,
            size: '',
            isActive: false,
            isDefault: false,
            meta: { errors: [], isValid: false, isTouched: false },
         })
      }
   }, [state.serving])

   const createServing = () => {
      upsertServing({
         variables: {
            object: {
               subscriptionTitleId: state.title.id,
               servingSize: Number(serving.size),
               ...(serving.id && {
                  id: serving.id,
               }),
            },
         },
      })
   }

   const onBlur = e => {
      setServing({
         ...serving,
         meta: {
            isTouched: true,
            errors: validate.serving(e.target.value).errors,
            isValid: validate.serving(e.target.value).isValid,
         },
      })
   }

   const makeDefault = () => {
      setServing(node => ({
         ...node,
         isDefault: !node.isDefault,
         meta: {
            errors: [],
            isValid: true,
            isTouched: false,
         },
      }))
   }

   const handleChange = (name, value) => {
      setServing(node => ({ ...node, [name]: value }))
   }

   return (
      <>
         <TunnelHeader
            close={() => hideTunnel()}
            title={`${
               servingTunnelState === 'EDIT_SERVING' ? 'Edit' : 'Add'
            } Serving`}
            right={{
               title: 'Save',
               action: () => createServing(),
            }}
            tooltip={
               <Tooltip identifier="form_subscription_tunnel_serving_create" />
            }
         />
         <Banner id="subscription-app-create-subscription-form-add-serving-tunnel-top" />
         <Flex padding="16px">
            <Form.Group>
               <Form.Label htmlFor="serving" title="serving">
                  <Flex container alignItems="center">
                     Serving Size*
                     <Tooltip identifier="form_subscription_tunnel_serving_field_size" />
                  </Flex>
               </Form.Label>
               <Form.Number
                  id="serving"
                  name="serving"
                  onBlur={onBlur}
                  onChange={e => handleChange('size', e.target.value)}
                  value={serving.size}
                  disabled={serving.id}
                  placeholder="Enter the serving size"
                  hasError={serving.meta.isTouched && !serving.meta.isValid}
               />
               {serving.meta.isTouched &&
                  !serving.meta.isValid &&
                  serving.meta.errors.map((error, index) => (
                     <Form.Error key={index}>{error}</Form.Error>
                  ))}
            </Form.Group>
            {serving.id && (
               <HelperText
                  type="hint"
                  message="Serving is not editable right now."
               />
            )}
            <Spacer size="16px" />
            <Form.Toggle
               onChange={makeDefault}
               name="makeServingDefault"
               value={serving.isDefault}
            >
               <Flex container alignItems="center">
                  Make Default
                  <Tooltip identifier="form_subscription_tunnel_serving_field_make_default" />
               </Flex>
            </Form.Toggle>
         </Flex>
         <Banner id="subscription-app-create-subscription-form-add-serving-tunnel-bottom" />
      </>
   )
}
