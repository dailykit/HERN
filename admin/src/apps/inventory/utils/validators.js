export const validators = {
   name(value, placeholder) {
      const errors = []
      let isValid = true
      if (!value.trim().length) {
         errors.push(`${placeholder} can't be empty`)
         isValid = false
      }

      return { isValid, errors }
   },
   quantity(value) {
      let isValid = true
      let errors = []
      if (!+value || +value <= 0) {
         isValid = false
         errors = [...errors, 'Invalid quantity!']
      }
      return { isValid, errors }
   },
}
