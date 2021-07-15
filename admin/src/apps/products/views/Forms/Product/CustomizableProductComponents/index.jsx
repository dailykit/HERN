import React from 'react'
import {
   ButtonTile,
   ComboButton,
   Flex,
   SectionTab,
   SectionTabList,
   SectionTabPanel,
   SectionTabPanels,
   SectionTabs,
   Spacer,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { ProductOptionsTunnel, ProductsTunnel } from './tunnels'
import { ProductTile, ProductOptionsPanel } from '../components'
import { useMutation } from '@apollo/react-hooks'
import { CUSTOMIZABLE_PRODUCT_COMPONENT } from '../../../../graphql'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../shared/utils'
import { EditIcon } from '../../../../../../shared/assets/icons'

const CustomizableOptions = ({ productId, options }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [optionsTunnel, openOptionsTunnel, closeOptionsTunnel] = useTunnel(1)

   const [selected, setSelected] = React.useState({
      productId: null,
      customizableOptionId: null,
      selectedOptions: [],
   })

   const [deleteCustomizableProductComponent] = useMutation(
      CUSTOMIZABLE_PRODUCT_COMPONENT.DELETE,
      {
         onCompleted: () => {
            toast.success('Product deleted!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const handleDeleteOption = option => {
      const isConfirmed = window.confirm(
         `Are you sure you want to delete - ${option.linkedProduct.name}?`
      )
      if (isConfirmed) {
         deleteCustomizableProductComponent({
            variables: {
               id: option.id,
            },
         })
      }
   }

   return (
      <>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <ProductsTunnel
                  productId={productId}
                  closeTunnel={closeTunnel}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={optionsTunnel}>
            <Tunnel layer={1}>
               <ProductOptionsTunnel
                  productId={selected.productId}
                  customizableOptionId={selected.customizableOptionId}
                  selectedOptions={selected.selectedOptions}
                  closeTunnel={closeOptionsTunnel}
               />
            </Tunnel>
         </Tunnels>
         {options.length ? (
            <SectionTabs>
               <SectionTabList>
                  {options.map(option => (
                     <SectionTab>
                        <ProductTile
                           assets={option.linkedProduct.assets}
                           name={option.linkedProduct.name}
                           handleDelete={() => handleDeleteOption(option)}
                        />
                     </SectionTab>
                  ))}
                  <ButtonTile
                     type="secondary"
                     text="Add Product"
                     onClick={() => openTunnel(1)}
                  />
               </SectionTabList>
               <SectionTabPanels>
                  {options.map(option => (
                     <SectionTabPanel>
                        {option.options.length ? (
                           <Flex container justifyContent="space-between">
                              <ProductOptionsPanel
                                 options={option.selectedOptions}
                              />
                              <ComboButton
                                 type="ghost"
                                 size="sm"
                                 onClick={() => {
                                    setSelected({
                                       productId: option.linkedProduct.id,
                                       customizableOptionId: option.id,
                                       selectedOptions: option.options,
                                    })
                                    openOptionsTunnel(1)
                                 }}
                              >
                                 <EditIcon color="#00A7E1" />
                                 Edit Options
                              </ComboButton>
                           </Flex>
                        ) : (
                           <ButtonTile
                              type="secondary"
                              text="Add Options"
                              onClick={() => {
                                 setSelected({
                                    productId: option.linkedProduct.id,
                                    customizableOptionId: option.id,
                                    selectedOptions: option.options,
                                 })
                                 openOptionsTunnel(1)
                              }}
                           />
                        )}
                     </SectionTabPanel>
                  ))}
               </SectionTabPanels>
            </SectionTabs>
         ) : (
            <ButtonTile
               type="secondary"
               text="Add Product Option"
               onClick={() => openTunnel(1)}
            />
         )}
      </>
   )
}

export default CustomizableOptions
