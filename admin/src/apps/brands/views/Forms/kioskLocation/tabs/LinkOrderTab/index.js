import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Text,
   Spacer,
   Form,
   ButtonTile,
   useTunnel,
   Tunnels,
   Tunnel,
   Collapsible,
   Dropdown,
   IconButton,
   TextButton,
} from '@dailykit/ui'
import validator from '../validator'
import CreateLinkOrderTab from '../../../../../../../shared/CreateUtils/Brand/Kiosk/CreateLinkOrderTab'
import { KIOSK } from '../../../../../graphql'
import { Wrapper, Label } from '../../../brand/styled'
import { logger } from '../../../../../../../shared/utils'
import { useTabs } from '../../../../../../../shared/providers'
import { DeleteIcon } from '../../../../../../../shared/assets/icons'
import {
   Banner,
   InlineLoader,
   Tooltip,
} from '../../../../../../../shared/components'

export const LinkOrderTab = () => {
   const params = useParams()
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [orderTabList, setOrderTabList] = React.useState([])
   const { tab, addTab, setTabTitle } = useTabs()
   const [title, setTitle] = React.useState([
      //  {
      //      orderPrefix:{
      //       id: null,
      //       value: null,
      //       meta: {
      //          isValid: false,
      //          isTouched: false,
      //          errors: [],
      //       },
      //      },
      //      orderTab:{
      //       value: null,
      //       meta: {
      //          isValid: false,
      //          isTouched: false,
      //          errors: [],
      //       },
      //      },
      //      posistTab:{
      //       id: null,
      //       value: null,
      //       meta: {
      //          isValid: false,
      //          isTouched: false,
      //          errors: [],
      //       },
      //      }
      //  }
   ])

   // const { error, loading } = useQuery(KIOSK.GET_KIOSKS, {
   //    variables: {
   //       id: params.id,
   //    },
   //    onError: () => {
   //       toast.error('Failed to load addresses, please try again.')
   //    },
   //    onCompleted: ({ kiosk }) => {
   //       console.log('kiosks data:', kiosk)
   //       let dataExtracted = kiosk.orderTabs
   //       dataExtracted = dataExtracted.map(order => {
   //          return {
   //             value: '',
   //             orderPrefix: order?.orderPrefix || '',
   //             orderTab: order?.OrderTab.label || '',
   //             posistTab: order?.posist_tabType || '',
   //             posistTabId: order?.posist_tabId || '',
   //             orderTabId: order?.orderTabId || '',
   //             meta: {
   //                isValid: order ? true : false,
   //                isTouched: false,
   //                errors: [],
   //             },
   //          }
   //       })
   //       console.log('formatted data-->', dataExtracted)
   //       setTitle(previousData => [...previousData, ...dataExtracted])
   //    },
   // })

   const { error, loading } = useSubscription(KIOSK.GET_KIOSKS, {
      variables: {
         id: params.id,
      },
      onError: () => {
         toast.error('Failed to load addresses, please try again.')
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { kiosk = [] },
         },
      }) => {
         console.log('kiosks data:', kiosk)
         let dataExtracted = kiosk.orderTabs
         dataExtracted = dataExtracted.map(order => {
            return {
               value: '',
               orderPrefix: order?.orderPrefix || '',
               orderTab: order?.OrderTab.label || '',
               posistTab: order?.posist_tabType || '',
               posistTabId: order?.posist_tabId || '',
               orderTabId: order?.orderTabId || '',
               meta: {
                  isValid: order ? true : false,
                  isTouched: false,
                  errors: [],
               },
            }
         })
         console.log('formatted data-->', dataExtracted)
         setTitle(previousData => [...previousData, ...dataExtracted])
      },
   })
   console.log('new tittle', title, title[0]?.orderTabId)
   // if (title[0]?.orderTabId) {
   //    let firstObject = {
   //       id: title[0]?.orderTabId || 'nope',
   //       title: title[0]?.orderTab || 'nope',
   //       value: title[0]?.orderTab || 'nope',
   //    }
   //    console.log('first object:::>', firstObject)
   //    setOrderTabList(firstObject)
   // }

   const { error1, loading1, data1 } = useQuery(KIOSK.ORDER_TAB_LIST, {
      onCompleted: data => {
         const name1 = data.brands_orderTab.map(orderTabList => {
            return {
               id: orderTabList?.id || '',
               title: orderTabList?.label || '',
               value: orderTabList?.label || '',
            }
         })
         setOrderTabList(previousData => [...previousData, ...name1])
      },
   })
   console.log('labels are:', orderTabList)

   //    const createKioskHandler = () => {
   //       try {
   //          const objects = kiosk.filter(Boolean).map(kiosk => ({
   //             internalLocationKioskLabel: `${kiosk.internalLocationKioskLabel.value}`,
   //          }))
   //          if (!objects.length) {
   //             throw Error('Nothing to add!')
   //          }
   //          createKiosk({
   //             variables: {
   //                objects,
   //             },
   //          })
   //       } catch (error) {
   //          toast.error(error.message)
   //       }
   //    }

   const [createKiosk_OrderTab, { loading2 }] = useMutation(
      KIOSK.CREATE_KIOSK_ORDER_TAB,
      {
         onCompleted: input => {
            {
               console.log('input coming for new kioskOrderTab===>', input)
            }
            // setTitle([
            //    {
            //       value: null,
            //       orderPrefix: null,
            //       orderTab: null,
            //       posistTab: null,
            //       meta: {
            //          isValid: false,
            //          isTouched: false,
            //          errors: [],
            //       },
            //    },
            // ])
            toast.success('Successfully created the kiosk!')
            closeTunnel(1)
         },
         onError: () =>
            toast.success('Failed to create the kiosk, please try again!'),
      }
   )

   const createKioskOrderTab = () => {
      try {
         const objects = title.filter(Boolean).map(title => ({
            orderTab: '',
         }))
      } catch (error) {
         toast.error(error.message)
      }
   }

   const [updateKiosk_OrderTab] = useMutation(KIOSK.UPDATE_KIOSK_ORDER_TAB, {
      onCompleted: data => {
         toast.success('Updated!')
         console.log('update kiosk_orderTab data=>>', data)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const updateOrderPrefix = async (e, kioskOrderTab) => {
      const { isValid, errors } = validator.name(kioskOrderTab.orderPrefix)
      if (isValid) {
         console.log('====>>>>', params.id, kioskOrderTab.orderTabId)
         const { data } = await updateKiosk_OrderTab({
            variables: {
               locationKioskId: params.id,
               orderTabId: kioskOrderTab.orderTabId,
               _set: {
                  orderPrefix: kioskOrderTab.orderPrefix,
               },
            },
         })
      }
      //   setTitle({
      //      ...title,
      //      meta: {
      //         isTouched: true,
      //         errors,
      //         isValid,
      //      },
      //   })
   }

   //   const updateOrderTab = async (e, kioskOrderTab) => {
   //      const { isValid, errors } = validator.name(kioskOrderTab.orderTab)
   //      if (isValid) {
   //         const { data } = await updateKiosk_OrderTab({
   //            variables: {
   //               locationKioskId: params.id,
   //               orderTabId: kioskOrderTab.orderTabId,
   //               _set: {
   //                  //    orderTabId: where:{}
   //               },
   //            },
   //         })
   //      }
   //   }
   const updateOrderTab = async (e, kioskOrderTab) => {
      console.log('eeeeee++++', e)
      const { isValid, errors } = validator.name(e.title)
      if (isValid) {
         const { data } = await updateKiosk_OrderTab({
            variables: {
               locationKioskId: params.id,
               orderTabId: kioskOrderTab.orderTabId,
               _set: {
                  orderTabId: e.id,
               },
            },
         })
      }
   }

   const [deleteKioskOrderTab] = useMutation(KIOSK.DELETE_KIOSK_ORDER_TAB, {
      onCompleted: () => {
         toast.success('Option deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
         console.log(error)
      },
   })
   const handleDeleteOption = async (e, kioskOrderTab) => {
      console.log('delete::>', kioskOrderTab.orderTabId, params.id)
      const isConfirmed = window.confirm(
         `Are you sure you want to delete - ${kioskOrderTab.orderTab}?`
      )
      if (isConfirmed) {
         deleteKioskOrderTab({
            variables: {
               locationKioskId: { _eq: params.id },
               orderTabId: { _eq: kioskOrderTab.orderTabId },
            },
         })
      }
   }

   // const renderHead = () => {
   return (
      <div>
         <Flex padding="16px">
            {title.map((kioskOrderTab, i) => {
               return (
                  <>
                     <Collapsible
                        isDraggable
                        head={
                           <Flex
                              container
                              alignItems="center"
                              style={{ gap: '15px' }}
                           >
                              {/* <Flex > */}
                              <Form.Group>
                                 {/* <Spacer yAxis size="16px" /> */}
                                 <Form.Label
                                    // style={{ marginTop: '-38px' }}
                                    htmlFor={`kioskOrderTab.orderTabs-${i}`}
                                    title={`kioskOrderTab.orderTabs-${i}`}
                                 >
                                    Order Tab
                                 </Form.Label>

                                 {/* <Form.Text
                           id={`kioskOrderTab.orderTabs-${i}`}
                           name={`kioskOrderTab.orderTabs-${i}`}
                           value={kioskOrderTab.orderTab}
                           placeholder="Enter Order Tab"
                           //    onChange={e => {
                           //       const prevTitle = [...title]
                           //       prevTitle[i].orderTab = e.target.value
                           //       setTitle(prevTitle)
                           //    }}
                           //    onBlur={e => updateOrderTab(e, title[i])}
                        /> */}
                                 <div
                                    style={{
                                       border: '1px solid #e3e3e3',
                                       borderRadius: '6px',
                                       height: '40px',
                                       textAlign: 'match-parent',
                                       padding: '7px 12px 12px 12px',
                                    }}
                                 >
                                    <Dropdown
                                       type="single"
                                       defaultOption={{
                                          id: kioskOrderTab.orderTabId,
                                       }}
                                       isLoading={loading1}
                                       addOption={orderTabList}
                                       placeholder="Enter Order Tab"
                                       options={orderTabList}
                                       selectedOption={e =>
                                          updateOrderTab(e, kioskOrderTab)
                                       }
                                       //    addOption={() => console.log('Item added')}
                                    />
                                 </div>
                              </Form.Group>
                              {/* </Flex> */}
                              <Spacer yAxis size="16px" />
                              {/* <Flex container alignItems="center"> */}
                              <Form.Group>
                                 <Form.Label
                                    htmlFor={`kioskOrderTab.orderPrefix-${i}`}
                                    title={`kioskOrderTab.orderPrefix-${i}`}
                                 >
                                    Order Prefix
                                 </Form.Label>
                                 <Form.Text
                                    id={`kioskOrderTab.orderPrefix-${i}`}
                                    name={`kioskOrderTab.orderPrefix-${i}`}
                                    value={kioskOrderTab.orderPrefix}
                                    placeholder="Enter Order Prefix"
                                    onChange={e => {
                                       const prevTitle = [...title]
                                       prevTitle[i].orderPrefix = e.target.value
                                       setTitle(prevTitle)
                                    }}
                                    onBlur={e => updateOrderPrefix(e, title[i])}
                                 />
                              </Form.Group>
                              {/* </Flex> */}
                              <Spacer yAxis size="16px" />
                              {/* <Flex container alignItems="center"> */}
                              <Form.Group>
                                 <Form.Label
                                    htmlFor={`kioskOrderTab.posistTab-${i}`}
                                    title={`kioskOrderTab.posistTab-${i}`}
                                 >
                                    Posist Tab
                                 </Form.Label>
                                 <Form.Text
                                    id={`kioskOrderTab.posistTab-${i}`}
                                    name={`kioskOrderTab.posistTab-${i}`}
                                    value={kioskOrderTab.posistTab}
                                    placeholder="Enter Posist Tab"
                                    onChange={e => {
                                       const prevTitle = [...title]
                                       prevTitle[i].posistTab = e.target.value
                                       setTitle(prevTitle)
                                    }}
                                 />
                              </Form.Group>
                              {/* </Flex> */}
                              <IconButton
                                 title="Delete Option"
                                 type="ghost"
                                 onClick={e =>
                                    handleDeleteOption(e, kioskOrderTab)
                                 }
                              >
                                 <DeleteIcon />
                              </IconButton>
                           </Flex>
                        }
                     />
                  </>
               )
            })}
         </Flex>
         <Spacer yAxis size="16px" />
         <ButtonTile
            type="secondary"
            text="Link New Order Tab"
            onClick={() => openTunnel(1)}
         />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <CreateLinkOrderTab closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
      </div>
   )
}
