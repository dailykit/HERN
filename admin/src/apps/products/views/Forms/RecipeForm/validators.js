const validator = {
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
   cookingTime: value => {
      let isValid = true
      let errors = []
      if (value && (Number.isNaN(value) || +value <= 0)) {
         isValid = false
         errors = [...errors, 'Invalid input!']
      }
      return { isValid, errors }
   },
   serving: value => {
      const serving = value.trim()
      let isValid = true
      let errors = []
      if (serving === '') {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
      if (!Number.isInteger(+value)) {
         isValid = false
         errors = [...errors, 'Integers only!']
      }
      if (+value <= 0) {
         isValid = false
         errors = [...errors, 'Should be greater than zero!']
      }
      return { isValid, errors }
   },
   label: value => {
      const label = value.trim()
      let isValid = true
      let errors = []
      if (label.length > 50) {
         isValid = false
         errors = [...errors, 'Label should contain less than 50 characters!']
      }
      return { isValid, errors }
   },
   slipName: value => {
      const name = value.trim()
      let isValid = true
      let errors = []
      if (!name.length) {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
      return { isValid, errors }
   },
}

export default validator
