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
   quantity: value => {
      let isValid = true
      let errors = []
      if (value <= 0) {
         isValid = false
         errors = [...errors, 'Invalid quantity!']
      }
      return { isValid, errors }
   },
   priority: value => {
      let isValid = true
      let errors = []
      if (value < 0) {
         isValid = false
         errors = [...errors, 'Cannot be less then 0!']
      }
      if (!Number.isInteger(value)) {
         isValid = false
         errors = [...errors, 'Integers only!']
      }
      return { isValid, errors }
   },
   price: value => {
      let isValid = true
      let errors = []
      if (value <= 0) {
         isValid = false
         errors = [...errors, 'Invalid input!']
      }
      return { isValid, errors }
   },
}

export default validator
