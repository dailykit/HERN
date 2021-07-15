import { toast } from 'react-toastify'

const handleNumberInputErrors = (e, errors, setErrors) => {
   if (!e.target.value.length) return

   const reg = new RegExp('[0-9]+$')
   const { value } = e.target

   const match = reg.test(value)

   if (match) {
      const cleanedErrors = [...errors]
      const index = cleanedErrors.findIndex(err => err.path === e.target.name)

      if (index >= 0) {
         cleanedErrors.splice(index, 1)
      }
      setErrors(cleanedErrors)
   }

   if (!match) {
      toast.error(`Invalid value for field: ${e.target.name}`)
      setErrors([
         ...errors,
         {
            path: e.target.name,
            message: `Invalid value for field: ${e.target.name}`,
         },
      ])
   }
}
export default handleNumberInputErrors
