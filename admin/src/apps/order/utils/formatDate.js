export const formatDate = (
   date,
   options = {
      minute: 'numeric',
      hour: 'numeric',
      month: 'short',
      day: 'numeric',
   }
) => {
   try {
      return new Intl.DateTimeFormat('en-US', options).format(new Date(date))
   } catch (error) {
      return error.message
   }
}
