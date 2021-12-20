import { useMutation } from '@apollo/react-hooks'
import {
   Flex,
   Form,
   HorizontalTab,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   HorizontalTabs,
   Text,
   TextButton,
   TunnelHeader,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { Tooltip } from '../../../../..'
import { PRODUCT_PRICE_BRAND_LOCATION } from '../../../../Query'

const SpecificPriceTunnel = ({ closeTunnel, selectedRowData }) => {
   const [specificData, setSpecificData] = React.useState({})
   const [initialSpecificData, setInitialSpecificData] = React.useState({
      specificData: 0,
      markUpPrice: 0,
      specificDiscount: 0,
   })
   const [upsertSpecificData, { loading }] = useMutation(
      PRODUCT_PRICE_BRAND_LOCATION,
      {
         onCompleted: input => {
            console.log('The input contains:', input)
            setSpecificData({})
            setInitialSpecificData({
               specificData: 0,
               markUpPrice: 0,
               specificDiscount: 0,
            })
            toast.success('Successfully updated the Product!')
            closeTunnel(1)
         },
         onError: () =>
            toast.success('Failed to update Product, please try again!'),
      }
   )
   console.log('selectedRowData', selectedRowData)
   const SpecificDataHandler = () => {
      try {
         const newData = {
            ...specificData,
            brandId: selectedRowData.brandId,
            productId: selectedRowData.id,
         }
         console.log('new data', newData)
         upsertSpecificData({
            variables: {
               objects: newData,
               constraint: 'productPrice_brand_location_brandId_productId_key',
               update_columns: [
                  'specificPrice',
                  'markupOnStandardPriceInPercentage',
                  'specificDiscount',
               ],
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }
   const save = () => {
      return SpecificDataHandler()
   }
   const close = () => {
      setSpecificData({})
      setInitialSpecificData({
         specificData: 0,
         markUpPrice: 0,
         specificDiscount: 0,
      })

      closeTunnel(1)
   }
   console.log(
      'specific price and mark up',
      specificData.specificPrice,
      specificData.markupOnStandardPriceInPercentage,
      specificData.specificDiscount
   )
   return (
      <div>
         <TunnelHeader
            title="Specific Price"
            right={{
               action: () => {
                  save('save')
               },
               title: 'Save',
               // disabled: types.filter(Boolean).length === 0,
            }}
            close={close}
            tooltip={<Tooltip identifier="specific_price_tunnelHeader" />}
         />
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>
                  <TextButton
                     type="ghost"
                     size="sm"
                     disabled={
                        'markupOnStandardPriceInPercentage' in specificData
                     }
                     onClick={() => {
                        setSpecificData(prevData => {
                           const newData = { ...prevData }
                           delete newData['markupOnStandardPriceInPercentage']
                           return newData
                        })
                     }}
                  >
                     Specific Price
                  </TextButton>
               </HorizontalTab>
               <HorizontalTab>
                  <TextButton
                     type="ghost"
                     size="sm"
                     disabled={'specificPrice' in specificData}
                     onClick={() => {
                        setSpecificData(prevData => {
                           const newData = { ...prevData }
                           delete newData['specificPrice']
                           return newData
                        })
                     }}
                  >
                     Markup Price
                  </TextButton>
               </HorizontalTab>
               <HorizontalTab>
                  <TextButton
                     type="ghost"
                     size="sm"
                     onClick={() => {
                        // setInitialSpecificData({
                        //    ...initialSpecificData,
                        //    specificPrice: 0,
                        // })
                        // setSpecificData(prevData => {
                        //    const newData = { ...prevData }
                        //    delete newData['markupOnStandardPriceInPercentage']
                        //    return newData
                        // })
                        console.log('Specific Discount')
                     }}
                  >
                     Specific Discount
                  </TextButton>
               </HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel>
                  <Form.Group>
                     <Form.Label
                        htmlFor="SpecificPrice "
                        title="SpecificPrice "
                     >
                        <Flex container alignItems="center">
                           <Text as="text1">Specific Price</Text>
                           <TextButton
                              type="ghost"
                              size="sm"
                              onClick={() => {
                                 setInitialSpecificData({
                                    ...initialSpecificData,
                                    specificPrice: 0,
                                 })

                                 setSpecificData(prevData => {
                                    const newData = { ...prevData }
                                    delete newData['specificPrice']
                                    return newData
                                 })
                              }}
                           >
                              Clear
                           </TextButton>
                           {/* <Tooltip identifier="recipe_price_increase" /> */}
                        </Flex>
                     </Form.Label>
                     <Form.Number
                        id="SpecificPrice"
                        name="SpecificPrice"
                        min="0"
                        value={initialSpecificData.specificPrice}
                        placeholder="Enter price"
                        onChange={e =>
                           setInitialSpecificData({
                              ...specificData,
                              specificPrice: e.target.value,
                           })
                        }
                        onBlur={() => {
                           if (initialSpecificData.specificPrice) {
                              setSpecificData({
                                 ...specificData,
                                 specificPrice:
                                    initialSpecificData.specificPrice,
                              })
                              return
                           }
                           if ('specificPrice' in specificData) {
                              // finding key in specificData which is having empty value
                              const newOptions = {
                                 ...specificData,
                              }
                              delete newOptions['specificPrice']
                              setSpecificData(newOptions)
                              return
                           }
                        }}
                     />
                  </Form.Group>
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <Form.Group>
                     <Form.Label htmlFor="MarkupPrice " title="MarkupPrice ">
                        <Flex container alignItems="center">
                           <Text as="text1">Mark up Price</Text>
                           <TextButton
                              type="ghost"
                              size="sm"
                              onClick={() => {
                                 setInitialSpecificData({
                                    ...initialSpecificData,
                                    markUpPrice: 0,
                                 })

                                 setSpecificData(prevData => {
                                    const newData = { ...prevData }
                                    delete newData[
                                       'markupOnStandardPriceInPercentage'
                                    ]
                                    return newData
                                 })
                              }}
                           >
                              Clear
                           </TextButton>
                           {/* <Tooltip identifier="recipe_price_increase" /> */}
                        </Flex>
                     </Form.Label>
                     <Form.Number
                        id="MarkupPrice"
                        name="MarkupPrice"
                        min="0"
                        value={initialSpecificData.markUpPrice}
                        placeholder="Enter price"
                        onChange={e =>
                           setInitialSpecificData({
                              ...specificData,
                              markUpPrice: e.target.value,
                           })
                        }
                        onBlur={() => {
                           if (initialSpecificData.markUpPrice) {
                              setSpecificData({
                                 ...specificData,
                                 markupOnStandardPriceInPercentage:
                                    initialSpecificData.markUpPrice,
                              })
                              return
                           }
                           if (
                              'markupOnStandardPriceInPercentage' in
                              specificData
                           ) {
                              // finding key in specificData which is having empty value
                              const newOptions = {
                                 ...specificData,
                              }
                              delete newOptions[
                                 'markupOnStandardPriceInPercentage'
                              ]
                              setSpecificData(newOptions)
                              return
                           }
                        }}
                     />
                  </Form.Group>
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <Form.Group>
                     <Form.Label
                        htmlFor="SpecificDiscount "
                        title="SpecificDiscount "
                     >
                        <Flex container alignItems="center">
                           <Text as="text1">Specific Discount</Text>
                           <TextButton
                              type="ghost"
                              size="sm"
                              onClick={() => {
                                 setInitialSpecificData({
                                    ...initialSpecificData,
                                    specificDiscount: 0,
                                 })

                                 setSpecificData(prevData => {
                                    const newData = { ...prevData }
                                    delete newData['specificDiscount']
                                    return newData
                                 })
                              }}
                           >
                              Clear
                           </TextButton>
                           {/* <Tooltip identifier="recipe_price_increase" /> */}
                        </Flex>
                     </Form.Label>
                     <Form.Number
                        id="SpecificDiscount"
                        name="SpecificDiscount"
                        min="0"
                        value={initialSpecificData.specificDiscount}
                        placeholder="Enter price"
                        onChange={e =>
                           setInitialSpecificData({
                              ...specificData,
                              specificDiscount: e.target.value,
                           })
                        }
                        onBlur={() => {
                           if (initialSpecificData.specificDiscount) {
                              setSpecificData({
                                 ...specificData,
                                 specificDiscount:
                                    initialSpecificData.specificDiscount,
                              })
                              return
                           }
                           if ('specificDiscount' in specificData) {
                              // finding key in specificData which is having empty value
                              const newOptions = {
                                 ...specificData,
                              }
                              delete newOptions['specificDiscount']
                              setSpecificData(newOptions)
                              return
                           }
                        }}
                     />
                  </Form.Group>
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>
      </div>
   )
}

export default SpecificPriceTunnel
