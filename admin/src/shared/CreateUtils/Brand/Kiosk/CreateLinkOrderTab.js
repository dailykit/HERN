import React from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import {
   ButtonTile,
   Dropdown,
   Flex,
   Form,
   Spacer,
   TunnelHeader,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { logger } from '../../../utils'
import { useTabs } from '../../../providers'
import validator from '../../validator'
import { KIOSK } from '../../../../apps/brands/graphql'
import { repeat } from 'lodash'
import { Banner, Tooltip } from '../../../components'
import { useParams } from 'react-router-dom'

const CreateLinkOrderTab = ({ closeTunnel }) => {
   const params = useParams()
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [orderTabList, setOrderTabList] = React.useState([])
   const [title, setTitle] = React.useState([])

   const { error1, loading1, data1 } = useQuery(KIOSK.ORDER_TAB_LIST, {
      onCompleted: data => {
         const name1 = data.brands_orderTab.map(orderTabList => {
            return {
               id: orderTabList.id,
               title: orderTabList.label,
               posistTabType: orderTabList.posist_tabType,
            }
         })
         setOrderTabList(name1)
      },
   })
   // console.log('labels are:', orderTabList)

   const [createKiosk_OrderTab, { loading }] = useMutation(
      KIOSK.CREATE_KIOSK_ORDER_TAB,
      {
         onCompleted: input => {
            {
               // console.log('input coming for new kioskOrderTab===>', input)
            }
            setTitle([
               {
                  value: null,
                  orderPrefix: null,
                  orderTab: null,
                  orderTabId: null,
                  posistTabId: null,
                  posistTab: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            ])
            toast.success('Successfully created the kiosk!')
            closeTunnel(1)
         },
         onError: () =>
            toast.success('Failed to create the kiosk, please try again!'),
      }
   )

   const createKioskOrderTab = (e, kioskOrderTab) => {
      try {
         // console.log('links are:::>>', e, kioskOrderTab)
         const objects = title.filter(Boolean).map(title => ({
            locationKioskId: params.id,
            orderTabId: e.id,
            posist_tabType: e.posistTabType,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createKiosk_OrderTab({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const save = type => {
      setClick(type)
      let kioskOrderTabValid = true

      if (kioskOrderTabValid === true) {
         return createKioskOrderTab()
      }
      return toast.error('order tab is required!')
   }

   const close = () => {
      setTitle([
         {
            value: null,
            orderPrefix: null,
            orderTab: null,
            orderTabId: null,
            posistTabId: null,
            posistTab: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      ])
      closeTunnel(1)
   }
   return (
      // <div>
      //    <h1>create link order Tab</h1>
      // </div>
      <>
         <TunnelHeader
            title="Add New Order Tab for kiosk"
            right={{
               action: () => {
                  save('save')
               },
               title: loading && click === 'save' ? 'Saving...' : 'Save',
               // disabled: types.filter(Boolean).length === 0,
            }}
            // extraButtons={[
            //    {
            //       action: () => {
            //          save('SaveAndOpen')
            //       },
            //       title:
            //          loading && click === 'SaveAndOpen'
            //             ? 'Saving...'
            //             : 'Save & Open',
            //    },
            // ]}
            close={close}
            // tooltip={<Tooltip identifier="create_recipe_tunnelHeader" />}
         />
         <Banner id="product-app-recipe-create-recipe-tunnel-top" />
         <Flex padding="16px">
            {title.map((kioskOrderTab, i) => (
               <>
                  <Form.Group>
                     <Spacer yAxis size="16px" />
                     <Form.Label
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
                     /> */}
                     <Dropdown
                        type="single"
                        // default={kioskOrderTab.orderTab}
                        placeholder="Enter Order Tab"
                        options={orderTabList}
                        selectedOption={e =>
                           createKioskOrderTab(e, kioskOrderTab)
                        }
                        //    addOption={() => console.log('Item added')}
                     />
                  </Form.Group>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Order Tab for thisKiosk"
               onClick={() =>
                  setTitle([
                     ...title,
                     {
                        // internalLocationKioskLabel: {
                        value: null,
                        orderTab: null,
                        meta: {
                           isValid: false,
                           isTouched: false,
                           errors: [],
                        },
                        // },
                     },
                  ])
               }
            />
         </Flex>
         <Spacer xAxis size="24px" />
         {/* <Banner id="product-app-recipe-create-recipe-tunnel-bottom" /> */}
      </>
   )
}

export default CreateLinkOrderTab
