import React, { useEffect } from 'react'
import _ from 'lodash'
export const useModifier = props => {
   const {
      productOption,
      forNewItem,
      edit,
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
