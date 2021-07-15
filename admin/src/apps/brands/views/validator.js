const validatorFunc = {
   text: value => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (text.length < 1) {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
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
      if (text.length < 2 && text.length > 0) {
         isValid = false
         errors = [...errors, 'Must have atleast two letters.']
      }
      return { isValid, errors }
   },
   time: value => {
      const array = value.split(':')
      let isValid = true
      let errors = []
      if (array[0] < 0 || array[1] < 0 || array[0] > 12 || array[1] > 59) {
         isValid = false
         errors = [
            ...errors,
            'Invalid time format, Please use 12 hour time format',
         ]
      }
      if (value === '') {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
      return { isValid, errors }
   },
   email: value => {
      var mailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      let isValid = true
      let errors = []
      if (!value.match(mailformat)) {
         isValid = false
         errors = [...errors, 'Invalid email']
      }
      return { isValid, errors }
   },
   phone: value => {
      var phoneformat = /^(^\+{0,2}([\-\. ])?(\(?\d{0,3}\))?([\-\. ])?\(?\d{0,3}\)?([\-\. ])?\d{3}([\-\. ])?\d{4})$/
      let isValid = true
      let errors = []
      if (!phoneformat.test(value.toString())) {
         isValid = false
         errors = [...errors, ' Invalid Input!']
      }

      return { isValid, errors }
   },
   priority: value => {
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
   percentage: value => {
      let isValid = true
      let errors = []
      if (!value) {
         isValid = false
         errors = [...errors, 'Cannot be empty!']
      }
      if (+value < 0 && value !== '') {
         isValid = false
         errors = [...errors, 'Should be greater than 0!']
      }
      if (Number.isNaN(+value)) {
         isValid = false
         errors = [...errors, 'Invalid value!']
      }
      return { isValid, errors }
   },
   url: value => {
      var urlFormat = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
      let isValid = true
      let errors = []
      if (!urlFormat.test(value)) {
         isValid = false
         errors = [...errors, ' Invalid Input!']
      }
      return { isValid, errors }
   },
}

export default validatorFunc
