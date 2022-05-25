import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Text,
   Spacer,
   Form,
   ButtonGroup,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   Dropdown,
   TextButton,
} from '@dailykit/ui'
import validator from '../../validator'
import copy from 'copy-to-clipboard'
import { KIOSK, BRANDS } from '../../../graphql'
import { Wrapper, Label } from '../brand/styled'
import { logger } from '../../../../../shared/utils'
import { useTabs } from '../../../../../shared/providers'
import { Banner, InlineLoader, Tooltip } from '../../../../../shared/components'
import { KioskConfig, BasicInfo, LinkOrderTab } from './tabs'
import { CopyIcon } from '../../../../editor/assets/Icons'

export const KioskLocation = () => {
   const params = useParams()
   const { tab, addTab, setTabTitle } = useTabs()
   const [brandList, setBrandList] = React.useState([])
   const [title, setTitle] = React.useState({
      value: '',
      accessUrl: '',
      brandName: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   const [update] = useMutation(KIOSK.UPDATE_KIOSK, {
      onCompleted: () => toast.success('Successfully updated KIOSK!'),
      onError: error => {
         toast.error('Failed to update KIOSK!')
         logger(error)
      },
   })

   const {
      error,
      loading,
      data: { kiosk = {} } = {},
   } = useSubscription(KIOSK.KIOSK, {
      variables: {
         id: { _eq: params.id },
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { kiosk = {} },
         },
      }) => {
         // console.log('data is:', kiosk)
         setTitle({
            value: kiosk[0].kioskLabel || '',
            accessUrl: kiosk[0]?.accessUrl || '',
            meta: {
               isValid: kiosk[0].kioskLabel ? true : false,
               isTouched: false,
               errors: [],
            },
         })
         setTabTitle(kiosk[0].kioskLabel || '')
      },
   })

   const { brandListError, brandListLoading, brandListData } = useSubscription(
      BRANDS.LIST,
      {
         onSubscriptionData: ({
            subscriptionData: {
               data: { brands = {} },
            },
         }) => {
            // console.log('brands data', brands)
            const brandsData = brands?.nodes.map(brand => {
               return {
                  id: brand?.id || '',
                  // title: brand?.title || '',
                  title: brand?.domain || '',
               }
            })
            setBrandList(previousData => [...previousData, ...brandsData])
         },
      }
   )
   // console.log('brandlist made now::>', brandList)

   React.useEffect(() => {
      if (!tab && !loading && !isEmpty(kiosk)) {
         addTab(kiosk?.title || 'N/A', `/kiosks/kiosks/${kiosk[0].id}`)
         console.log('data:', loading)
      }
   }, [tab, addTab, loading, kiosk])

   const updateTitle = e => {
      setTitle({
         ...title,
         meta: {
            ...title.meta,
            isTouched: true,
            errors: validator.name(e.target.value).errors,
            isValid: validator.name(e.target.value).isValid,
         },
      })
      if (validator.name(e.target.value).isValid) {
         update({
            variables: {
               id: params.id,
               _set: {
                  internalLocationKioskLabel: title.value,
               },
            },
         })
      } else {
         toast.error('kiosk Title must be provided')
      }
   }

   if (loading || brandListLoading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   return (
      <Wrapper>
         {/* <Banner id="brands-app-brands-brand-details-top" /> */}
         <Flex
            container
            padding="0 34px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container style={{ gap: '10px' }}>
               <Form.Group>
                  <Flex container alignItems="flex-end">
                     <Form.Label htmlFor="name" title="Kiosk Label">
                        Kiosk Label*
                     </Form.Label>
                     <Tooltip identifier="brand_title_info" />
                  </Flex>
                  <Form.Text
                     id="Kiosk"
                     name="Kiosk"
                     placeholder="Enter the kiosk label"
                     value={title.value}
                     disabled={kiosk?.isDefault}
                     onChange={e =>
                        setTitle({ ...title, value: e.target.value })
                     }
                     onBlur={e => updateTitle(e)}
                  />
                  {title.meta.isTouched &&
                     !title.meta.isValid &&
                     title.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Form.Group>
                  <Flex container alignItems="flex-end">
                     <Form.Label
                        htmlFor="accessUrl"
                        title="Copy Kiosk Access URL"
                     >
                        <ButtonGroup
                           style={{ gap: '5px' }}
                           onClick={() => {
                              copy(title.accessUrl)
                           }}
                        >
                           {'Domain*    '}

                           <CopyIcon size={20} />
                        </ButtonGroup>
                     </Form.Label>
                  </Flex>
                  <div style={{ display: 'flex' }}>
                     <div
                        style={{
                           border: '1px solid #e3e3e3',
                           borderRadius: '6px',
                           // marginTop: '15px',
                           height: '40px',
                           textAlign: 'match-parent',
                           padding: '0 12px 12px 12px',
                        }}
                     >
                        <div style={{ marginTop: '10px' }}>
                           <Dropdown
                              type="single"
                              isLoading={brandListLoading}
                              addOption={brandList}
                              options={brandList}
                              defaultName={title.accessUrl.split('/kiosk')[0]}
                              selectedOption={e =>
                                 update({
                                    variables: {
                                       id: params.id,
                                       _set: {
                                          accessUrl:
                                             e.title + '/kiosk/' + params.id,
                                       },
                                    },
                                 })
                              }
                              placeholder="Enter brand domain"
                           />
                        </div>
                     </div>
                     {/* <h1>.</h1> */}
                     <Form.Text
                        id="Kiosk"
                        name="Kiosk"
                        // style={{ marginTop: '-2px' }}
                        placeholder="Enter the kiosk label"
                        value={'/kiosk/' + params.id}
                        disabled={true}
                        // onChange={e =>
                        //    setTitle({ ...title, value: e.target.value })
                        // }
                        // onBlur={e => updateTitle(e)}
                     />
                  </div>
               </Form.Group>
            </Flex>

            <Form.Toggle
               name="Active"
               value={kiosk[0]?.isActive}
               onChange={() => {
                  if (
                     title.accessUrl &&
                     kiosk[0]?.printerId &&
                     kiosk[0]?.location?.id
                  ) {
                     update({
                        variables: {
                           id: params.id,
                           _set: { isActive: !kiosk[0].isActive || false },
                        },
                     })
                  }
                  if (title.accessUrl && kiosk[0]?.printerId) {
                     toast.error('Location not set')
                  }
                  if (kiosk[0]?.printerId && kiosk[0]?.location?.id) {
                     toast.error('Access URL not set')
                  }
                  if (title.accessUrl && kiosk[0]?.location?.id) {
                     toast.error('Printer not set')
                  } else {
                     toast.error('Access URL or Printer or Location not set')
                  }
               }}
               style={{ marginTop: '24px' }}
            >
               <Flex container alignItems="center">
                  Active
                  <Tooltip identifier="brands_publish_info" />
               </Flex>
            </Form.Toggle>
         </Flex>
         <Spacer size="24px" />
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>Basic Info</HorizontalTab>
               <HorizontalTab>Link Order Tab</HorizontalTab>
               {/* <HorizontalTab>Kiosk Config</HorizontalTab> */}
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel style={{ height: '100%' }}>
                  <BasicInfo />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <LinkOrderTab />
               </HorizontalTabPanel>
               {/* <HorizontalTabPanel>
                  <KioskConfig />
               </HorizontalTabPanel> */}
            </HorizontalTabPanels>
         </HorizontalTabs>
         <Banner id="brands-app-brands-brand-details-bottom" />
      </Wrapper>
   )
}

export default KioskLocation
