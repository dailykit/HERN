const validate = {
   firstName: value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text.length < 2) {
         isValid = false
         errors = [...errors, 'Must have atleast two letters.']
      }
      return { isValid, errors }
   },
   lastName: value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text.length < 2) {
         isValid = false
         errors = [...errors, 'Must have atleast two letters.']
      }
      return { isValid, errors }
   },
   email: value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text.length < 2) {
         isValid = false
         errors = [...errors, 'Must have atleast two letters.']
      }
      const regex = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
      if (!regex.test(text)) {
         isValid = false
         errors = [...errors, 'Must be a valid email.']
      }
      return { isValid, errors }
   },
   phoneNo: value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      const regex = new RegExp(
         /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
      )
      if (!regex.test(text)) {
         isValid = false
         errors = [...errors, 'Must be a valid phone number.']
      }
      return { isValid, errors }
   },
}

export default validate
