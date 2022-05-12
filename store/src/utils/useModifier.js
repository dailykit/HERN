import React, { useEffect } from 'react'
import _ from 'lodash'
export const useModifier = props => {
   const {
      product,
      productOption,
      forNewItem,
      edit,
      productCartDetail,
      simpleModifier = false,
      nestedModifier = false,
   } = props

   const [selectedModifierOptions, setSelectedModifierOptions] = React.useState(
      {
         single: [],
         multiple: [],
      }
   )
   const [errorCategories, setErrorCategories] = React.useState([])
   const [status, setStatus] = React.useState('loading')

   // for edit or i'll choose
   useEffect(() => {
      if (forNewItem || edit) {
         const productOptionId = productCartDetail.childs[0].productOption.id
         const modifierCategoryOptionsIds =
            productCartDetail.childs[0].childs.map(x => x?.modifierOption?.id)
         let nestedModifierCategoryOptionsIds = []
         productCartDetail.childs[0].childs.forEach(eachOption => {
            if (eachOption.childs.length > 0) {
               eachOption.childs.forEach(nestedEachOption => {
                  nestedModifierCategoryOptionsIds.push(
                     nestedEachOption.modifierOption.id
                  )
               })
            }
         })

         //selected product option
         const selectedProductOption = product.productOptions.find(
            x => x.id == productOptionId
         )
         //selected modifiers
         let singleModifier = []
         let multipleModifier = []
         if (selectedProductOption.modifier && simpleModifier) {
            selectedProductOption.modifier.categories.forEach(category => {
               category.options.forEach(option => {
                  const selectedOption = {
                     modifierCategoryID: category.id,
                     modifierCategoryOptionsID: option.id,
                     modifierCategoryOptionsPrice: option.price,
                     cartItem: option.cartItem,
                  }
                  if (category.type === 'single') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        singleModifier = singleModifier.concat(selectedOption)
                     }
                  }
                  if (category.type === 'multiple') {
                     if (modifierCategoryOptionsIds.includes(option.id)) {
                        multipleModifier =
                           multipleModifier.concat(selectedOption)
                     }
                  }
               })
            })
         }
         if (selectedProductOption.additionalModifiers && simpleModifier) {
            selectedProductOption.additionalModifiers.forEach(
               eachAdditionalModifier => {
                  eachAdditionalModifier.modifier.categories.forEach(
                     category => {
                        category.options.forEach(option => {
                           const selectedOption = {
                              modifierCategoryID: category.id,
                              modifierCategoryOptionsID: option.id,
                              modifierCategoryOptionsPrice: option.price,
                              cartItem: option.cartItem,
                           }
                           if (category.type === 'single') {
                              if (
                                 modifierCategoryOptionsIds.includes(option.id)
                              ) {
                                 singleModifier =
                                    singleModifier.concat(selectedOption)
                              }
                           }
                           if (category.type === 'multiple') {
                              if (
                                 modifierCategoryOptionsIds.includes(option.id)
                              ) {
                                 multipleModifier =
                                    multipleModifier.concat(selectedOption)
                              }
                           }
                        })
                     }
                  )
               }
            )
         }
         if (nestedModifier) {
            let allAvailableModifiers = []
            if (!_.isEmpty(selectedProductOption.additionalModifiers)) {
               allAvailableModifiers = [
                  ...allAvailableModifiers,
                  ...selectedProductOption.additionalModifiers.map(
                     eachAdditionalModifier => eachAdditionalModifier.modifier
                  ),
               ]
            }
            if (!_.isEmpty(selectedProductOption.modifier)) {
               allAvailableModifiers.push(selectedProductOption.modifier)
            }

            let allNestedModifiers = []
            console.log('allAvailableModifiers', allAvailableModifiers)
            allAvailableModifiers.forEach(eachModifier => {
               eachModifier.categories.forEach(eachCategory => {
                  eachCategory.options.forEach(eachOption => {
                     if (eachOption.additionalModifierTemplateId) {
                        allNestedModifiers.push({
                           ...eachOption.additionalModifierTemplate,
                           parentModifierOptionId: eachOption.id,
                        })
                     }
                  })
               })
            })
            allNestedModifiers.forEach(eachModifier => {
               eachModifier.categories.forEach(category => {
                  category.options.forEach(option => {
                     const selectedOption = {
                        modifierCategoryID: category.id,
                        modifierCategoryOptionsID: option.id,
                        modifierCategoryOptionsPrice: option.price,
                        cartItem: option.cartItem,
                        parentModifierOptionId:
                           eachModifier.parentModifierOptionId,
                     }
                     if (category.type === 'single') {
                        if (
                           nestedModifierCategoryOptionsIds.includes(option.id)
                        ) {
                           singleModifier =
                              singleModifier.concat(selectedOption)
                        }
                     }
                     if (category.type === 'multiple') {
                        if (
                           nestedModifierCategoryOptionsIds.includes(option.id)
                        ) {
                           multipleModifier =
                              multipleModifier.concat(selectedOption)
                        }
                     }
                  })
               })
            })
         }
         setSelectedModifierOptions(prevState => ({
            ...prevState,
            single: singleModifier,
            multiple: multipleModifier,
         }))
         setStatus('success')
      } else {
         setStatus('success')
      }
   }, [])

   useEffect(() => {
      // default selected modifiers
      if (!(forNewItem || edit)) {
         let singleModifier = []
         let multipleModifier = []
         if (productOption.modifier && simpleModifier) {
            productOption.modifier.categories.forEach(eachCategory => {
               if (eachCategory.type === 'single' && eachCategory.isRequired) {
                  // default selected modifier option
                  // select first option which has zero price

                  const firstOptionWithZeroPrice = eachCategory.options.find(
                     option => option.price === 0
                  )
                     ? eachCategory.options.find(option => option.price === 0)
                     : eachCategory.options[0]

                  const defaultModifierSelectedOption = {
                     modifierCategoryID: eachCategory.id,
                     modifierCategoryOptionsID: firstOptionWithZeroPrice.id,
                     modifierCategoryOptionsPrice:
                        firstOptionWithZeroPrice.price,
                     modifierCategoryOptionsDiscount:
                        firstOptionWithZeroPrice.discount,
                     cartItem: firstOptionWithZeroPrice.cartItem,
                  }
                  singleModifier = [
                     ...singleModifier,
                     defaultModifierSelectedOption,
                  ]
               } else if (
                  eachCategory.type === 'multiple' &&
                  eachCategory.isRequired
               ) {
                  // select options which has price zero
                  const optionsWithZeroPrice = eachCategory.options.filter(
                     option => option.price === 0
                  )
                  const optionsWithOutZeroPrice = eachCategory.options.filter(
                     option => option.price !== 0
                  )
                  const defaultMultiSelectedOptions =
                     optionsWithZeroPrice.length >= eachCategory.limits.min
                        ? optionsWithZeroPrice.slice(0, eachCategory.limits.min)
                        : [
                             ...optionsWithZeroPrice,
                             ...optionsWithOutZeroPrice.slice(
                                0,
                                eachCategory.limits.min -
                                   optionsWithZeroPrice.length
                             ),
                          ]

                  defaultMultiSelectedOptions.forEach(eachModifierOption => {
                     // default selected modifier option
                     const defaultModifierSelectedOption = {
                        modifierCategoryID: eachCategory.id,
                        modifierCategoryOptionsID: eachModifierOption.id,
                        modifierCategoryOptionsPrice: eachModifierOption.price,
                        modifierCategoryOptionsDiscount:
                           eachModifierOption.discount,
                        cartItem: eachModifierOption.cartItem,
                     }
                     multipleModifier = [
                        ...multipleModifier,
                        defaultModifierSelectedOption,
                     ]
                  })
               }
            })
         }
         if (!_.isEmpty(productOption.additionalModifiers) && simpleModifier) {
            productOption.additionalModifiers.forEach(
               eachAdditionalModifier => {
                  eachAdditionalModifier.modifier.categories.forEach(
                     eachCategory => {
                        if (
                           eachCategory.type === 'single' &&
                           eachCategory.isRequired
                        ) {
                           // default selected modifier option
                           const defaultModifierSelectedOption = {
                              modifierCategoryID: eachCategory.id,
                              modifierCategoryOptionsID:
                                 eachCategory.options[0].id,
                              modifierCategoryOptionsPrice:
                                 eachCategory.options[0].price,
                              modifierCategoryOptionsDiscount:
                                 eachCategory.options[0].discount,
                              cartItem: eachCategory.options[0].cartItem,
                           }
                           singleModifier = [
                              ...singleModifier,
                              defaultModifierSelectedOption,
                           ]
                        } else if (
                           eachCategory.type === 'multiple' &&
                           eachCategory.isRequired
                        ) {
                           const defaultSelectedOptions =
                              eachCategory.options.slice(
                                 0,
                                 eachCategory.limits.min
                              )
                           defaultSelectedOptions.forEach(
                              eachModifierOption => {
                                 // default selected modifier option
                                 const defaultModifierSelectedOption = {
                                    modifierCategoryID: eachCategory.id,
                                    modifierCategoryOptionsID:
                                       eachModifierOption.id,
                                    modifierCategoryOptionsPrice:
                                       eachModifierOption.price,
                                    modifierCategoryOptionsDiscount:
                                       eachModifierOption.discount,
                                    cartItem: eachModifierOption.cartItem,
                                 }
                                 multipleModifier = [
                                    ...multipleModifier,
                                    defaultModifierSelectedOption,
                                 ]
                              }
                           )
                        }
                     }
                  )
               }
            )
         }
         if (nestedModifier) {
            let allNestedModifiers = []
            if (!_.isEmpty(productOption.modifier)) {
               productOption.modifier.categories.forEach(eachCategory => {
                  eachCategory.options.forEach(eachOption => {
                     if (eachOption.additionalModifierTemplateId) {
                        allNestedModifiers.push({
                           ...eachOption.additionalModifierTemplate,
                           parentModifierOptionId: eachOption.id,
                        })
                     }
                  })
               })
            }
            if (!_.isEmpty(productOption.additionalModifiers)) {
               productOption.additionalModifiers.forEach(
                  eachAdditionalModifier => {
                     eachAdditionalModifier.modifier.categories.forEach(
                        eachCategory => {
                           eachCategory.options.forEach(eachOption => {
                              if (eachOption.additionalModifierTemplateId) {
                                 allNestedModifiers.push({
                                    ...eachOption.additionalModifierTemplate,
                                    parentModifierOptionId: eachOption.id,
                                 })
                              }
                           })
                        }
                     )
                  }
               )
            }
            console.log('allNestedModifiers', allNestedModifiers)
            allNestedModifiers.forEach(eachNestedModifier => {
               eachNestedModifier.categories.forEach(eachCategory => {
                  if (
                     eachCategory.type === 'single' &&
                     eachCategory.isRequired
                  ) {
                     // default selected modifier option
                     // select first option which has zero price

                     const firstOptionWithZeroPrice = eachCategory.options.find(
                        option => option.price === 0
                     )
                        ? eachCategory.options.find(
                             option => option.price === 0
                          )
                        : eachCategory.options[0]

                     const defaultModifierSelectedOption = {
                        modifierCategoryID: eachCategory.id,
                        modifierCategoryOptionsID: firstOptionWithZeroPrice.id,
                        modifierCategoryOptionsPrice:
                           firstOptionWithZeroPrice.price,
                        modifierCategoryOptionsDiscount:
                           firstOptionWithZeroPrice.discount,
                        cartItem: firstOptionWithZeroPrice.cartItem,
                        parentModifierOptionId:
                           eachNestedModifier.parentModifierOptionId,
                     }
                     singleModifier = [
                        ...singleModifier,
                        defaultModifierSelectedOption,
                     ]
                  } else if (
                     eachCategory.type === 'multiple' &&
                     eachCategory.isRequired
                  ) {
                     // select options which has price zero
                     const optionsWithZeroPrice = eachCategory.options.filter(
                        option => option.price === 0
                     )
                     const optionsWithOutZeroPrice =
                        eachCategory.options.filter(
                           option => option.price !== 0
                        )
                     const defaultMultiSelectedOptions =
                        optionsWithZeroPrice.length >= eachCategory.limits.min
                           ? optionsWithZeroPrice.slice(
                                0,
                                eachCategory.limits.min
                             )
                           : [
                                ...optionsWithZeroPrice,
                                ...optionsWithOutZeroPrice.slice(
                                   0,
                                   eachCategory.limits.min -
                                      optionsWithZeroPrice.length
                                ),
                             ]

                     defaultMultiSelectedOptions.forEach(eachModifierOption => {
                        // default selected modifier option
                        const defaultModifierSelectedOption = {
                           modifierCategoryID: eachCategory.id,
                           modifierCategoryOptionsID: eachModifierOption.id,
                           modifierCategoryOptionsPrice:
                              eachModifierOption.price,
                           modifierCategoryOptionsDiscount:
                              eachModifierOption.discount,
                           cartItem: eachModifierOption.cartItem,
                           parentModifierOptionId:
                              eachNestedModifier.parentModifierOptionId,
                        }
                        multipleModifier = [
                           ...multipleModifier,
                           defaultModifierSelectedOption,
                        ]
                     })
                  }
               })
            })
         }
         setSelectedModifierOptions(prevState => ({
            ...prevState,
            single: singleModifier,
            multiple: multipleModifier,
         }))
      }
   }, [productOption])
   return {
      selectedModifierOptions,
      setSelectedModifierOptions,
      errorCategories,
      setErrorCategories,
      status,
   }
}
