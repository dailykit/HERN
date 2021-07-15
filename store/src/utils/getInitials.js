export const getInitials = input => {
   let title = input.trim()

   if (!title) {
      console.log('--- Error(Avatar): Provided title is empty! ---')
      throw Error('Provided title is empty!')
   }

   const { length } = title.split(' ')

   const [first] = title
   const [last] = length > 1 ? title.split(' ')[length - 1] : ['']
   return `${first}${last}`.toUpperCase()
}
