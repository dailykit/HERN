import { lte } from 'lodash'

const validator = {
   label: value => {
      let isValid = true
      let errors = []
      return { isValid, errors }
   },
   name: value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text.length < 1) {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
      return { isValid, errors }
   },
   quantity: value => {
      let isValid = true
      let errors = []
      if (value <= 0) {
         isValid = false
         errors = [...errors, 'Quantity should be greater than 0!']
      }
      return { isValid, errors }
   },
   price: value => {
      let isValid = true
      let errors = []
      if (value < 0) {
         isValid = false
         errors = [...errors, 'Price should be a greater than or equal to 0!']
      }
      return { isValid, errors }
   },
   discount: value => {
      let isValid = true
      let errors = []
      if (value < 0) {
         isValid = false
         errors = [
            ...errors,
            'Discount should be a greater than or equal to 0!',
         ]
      }
      return { isValid, errors }
   },
   posist_baseItemId: value => {
      let isValid = true
      let errors = []
      // if (text.length < 1) {
      //    isValid = false
      //    errors = [...errors, 'Cannot be empty!']
      // }
      return { isValid, errors }
   },
   csv: value => {
      const words = value.trim().split(',')
      let isValid = true
      let errors = []
      const hasDirtyValues = words.some(word => !word)
      if (words.length > 1 && hasDirtyValues) {
         isValid = false
         errors = [...errors, 'Invalid input!']
      }
      return { isValid, errors }
   },
   min: value => {
      let isValid = true
      let errors = []
      if (!value) {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
      if (!Number.isInteger(+value) || +value < 0) {
         isValid = false
         errors = [...errors, 'Invalid value!']
      }
      return { isValid, errors }
   },
   max: value => {
      let isValid = true
      let errors = []
      if (!value) {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
      if (!Number.isInteger(+value) || +value < 1) {
         isValid = false
         errors = [...errors, 'Invalid value!']
      }
      return { isValid, errors }
   },
}

export default validator
