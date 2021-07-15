export const getFullPath = path => {
   const host =
      window._env_.NODE_ENV === 'development'
         ? 'https://test.dailykit.org'
         : window.location.origin

   const url = `${host}/template/files${path}`
   return url
}

export const getFile = async path => {
   try {
      const url = getFullPath(path)
      const response = await fetch(url)

      return response
   } catch (error) {
      console.log(error)
   }
}

export const isConfigFileExist = async path => {
   try {
      const filePath = path
         .replace('components', 'components/config')
         .replace('ejs', 'json')
      const response = await getFile(filePath)
      if (response.status === 200) {
         return true
      }
      return false
   } catch (error) {
      console.log(error)
      return false
   }
}
