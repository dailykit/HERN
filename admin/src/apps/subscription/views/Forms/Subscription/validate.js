const validate = {
   title: value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text.length === 0) {
         isValid = false
         errors = [...errors, 'Title is required!']
      }
      return { isValid, errors }
   },
   serving: value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text <= 0) {
         isValid = false
         errors = [...errors, 'Must be greater than 0.']
      }
      return { isValid, errors }
   },
}
export default validate
