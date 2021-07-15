import React from 'react'
import {
   ButtonTile,
   ComboButton,
   Flex,
   IconButton,
   SectionTab,
   SectionTabList,
   SectionTabPanel,
   SectionTabPanels,
   SectionTabs,
   SectionTabsListHeader,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import {
   LabelTunnel,
   ProductsTunnel,
   ProductOptionsTunnel,
   ProductTypeTunnel,
} from './tunnels'
import {
   DeleteIcon,
   EditIcon,
   PlusIcon,
} from '../../../../../../shared/assets/icons'
import { ProductOptionsPanel, ProductTile } from '../components'
import { useMutation } from '@apollo/react-hooks'
import { COMBO_PRODUCT_COMPONENT } from '../../../../graphql'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../shared/utils'

const ComboProductComponents = ({ productId, options }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [productsTunnel, openProductsTunnel, closeProductsTunnel] = useTunnel(
      2
   )
   const [optionsTunnel, openOptionsTunnel, closeOptionsTunnel] = useTunnel(1)

   const [selected, setSelected] = React.useState({
      productId: null,
      comboComponentId: null,
      selectedOptions: [],
   })

   const [updateComboProductComponent] = useMutation(
      COMBO_PRODUCT_COMPONENT.UPDATE,
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

   const [deleteComboProductComponent] = useMutation(
      COMBO_PRODUCT_COMPONENT.DELETE,
      {
         onCompleted: () => {
            toast.success('Component deleted!')
         },
         onError: error => {
            toast.error('Something went wrong!')
            logger(error)
         },
      }
   )

   const handleDeleteProduct = option => {
      const isConfirmed = window.confirm(
         `Do you want to remove product from - ${option.label}?`
      )
      if (isConfirmed) {
         updateComboProductComponent({
            variables: {
               id: option.id,
               _set: {
                  linkedProductId: null,
                  options: [],
               },
            },
         })
      }
   }

   const handleDeleteComponent = option => {
      const isConfirmed = window.confirm(
         `Do you want to delete - ${option.label}?`
      )
      if (isConfirmed) {
         deleteComboProductComponent({
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
               <LabelTunnel productId={productId} closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={productsTunnel}>
            <Tunnel layer={1}>
               <ProductTypeTunnel
                  openTunnel={openProductsTunnel}
                  closeTunnel={closeProductsTunnel}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <ProductsTunnel
                  comboComponentId={selected.comboComponentId}
                  closeTunnel={closeProductsTunnel}
               />
            </Tunnel>
         </Tunnels>
         <Tunnels tunnels={optionsTunnel}>
            <Tunnel layer={1}>
               <ProductOptionsTunnel
                  productId={selected.productId}
                  comboComponentId={selected.comboComponentId}
                  selectedOptions={selected.selectedOptions}
                  closeTunnel={closeOptionsTunnel}
               />
            </Tunnel>
         </Tunnels>
         {options.length ? (
            <SectionTabs>
               <SectionTabList>
                  <SectionTabsListHeader>
                     <Flex
                        container
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                     >
                        <Text as="title"> Components({options.length}) </Text>
                        <IconButton
                           type="ghost"
                           size="sm"
                           onClick={() => openTunnel(1)}
                        >
                           <PlusIcon />
                        </IconButton>
                     </Flex>
                  </SectionTabsListHeader>
                  {options.map(option => (
                     <>
                        <Flex
                           container
                           margin="0 0 8px 0"
                           alignItems="center"
                           justifyContent="space-between"
                        >
                           <Text as="subtitle">{option.label}</Text>
                           <IconButton
                              type="ghost"
                              size="sm"
                              onClick={() => handleDeleteComponent(option)}
                           >
                              <DeleteIcon color="#FF5A52" />
                           </IconButton>
                        </Flex>
                        <SectionTab>
                           {option.linkedProduct ? (
                              <ProductTile
                                 assets={option.linkedProduct.assets}
                                 name={option.linkedProduct.name}
                                 handleDelete={() =>
                                    handleDeleteProduct(option)
                                 }
                              />
                           ) : (
                              <ButtonTile
                                 type="secondary"
                                 text="Add Product"
                                 onClick={() => {
                                    setSelected({
                                       ...selected,
                                       comboComponentId: option.id,
                                    })
                                    openProductsTunnel(1)
                                 }}
                              />
                           )}
                        </SectionTab>
                     </>
                  ))}
               </SectionTabList>
               <SectionTabPanels>
                  {options.map(option => (
                     <>
                        {Boolean(option.linkedProduct) && (
                           <SectionTabPanel>
                              {option.linkedProduct.type === 'simple' ? (
                                 <>
                                    {option.options.length ? (
                                       <Flex
                                          container
                                          justifyContent="space-between"
                                       >
                                          <ProductOptionsPanel
                                             options={option.selectedOptions}
                                          />
                                          <ComboButton
                                             type="ghost"
                                             size="sm"
                                             onClick={() => {
                                                setSelected({
                                                   productId:
                                                      option.linkedProduct.id,
                                                   comboComponentId: option.id,
                                                   selectedOptions:
                                                      option.options,
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
                                                productId:
                                                   option.linkedProduct.id,
                                                comboComponentId: option.id,
                                                selectedOptions: option.options,
                                             })
                                             openOptionsTunnel(1)
                                          }}
                                       />
                                    )}
                                 </>
                              ) : (
                                 <Text as="h3">
                                    For customizable product, options will be
                                    carried.
                                 </Text>
                              )}
                           </SectionTabPanel>
                        )}
                     </>
                  ))}
               </SectionTabPanels>
            </SectionTabs>
         ) : (
            <ButtonTile
               type="secondary"
               text="Add Components"
               onClick={() => openTunnel(1)}
            />
         )}
      </>
   )
}

export default ComboProductComponents
