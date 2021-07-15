const validators = {
   amount: value => {
      let isValid = true
      let errors = []
      if (!value) {
         isValid = false
         errors = [...errors, 'Cannot be empty or Invalid Input!']
      }
      if (+value <= 0 && value !== '') {
         isValid = false
         errors = [...errors, 'Should be greater than 0!']
      }
      return { isValid, errors }
   },
   points: value => {
      let isValid = true
      let errors = []
      if (!value) {
         isValid = false
         errors = [...errors, 'Cannot be empty or Invalid Input!']
      }
      if (+value <= 0 && value !== '') {
         isValid = false
         errors = [...errors, 'Should be greater than 0!']
      }
      if (+value % 1 !== 0) {
         isValid = false
         errors = [...errors, 'Should be a whole number!']
      }
      return { isValid, errors }
   },
}

export default validators
