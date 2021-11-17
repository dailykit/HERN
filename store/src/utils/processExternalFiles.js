export const processExternalFiles = async (folds, files) => {
   if (Boolean(files.length)) {
      const fragment = document.createDocumentFragment()
      files.forEach(file => {
         if (file.type === 'css') {
            const data = document.createElement('link')
            data.setAttribute('rel', 'stylesheet')
            data.setAttribute('href', file.path)
            data.setAttribute('type', 'text/css')
            data.setAttribute('media', 'screen')
            data.setAttribute('data-stylesheet-scope', file.fileScope)
            data.setAttribute('data-stylesheet-id', file.fileId)
            data.setAttribute('data-stylesheet-position', file.position)
            data.setAttribute('data-stylesheet-link-id', file.id)
            fragment.appendChild(data)
         }
      })

      document.head.appendChild(fragment)
   }

   if (Boolean(files.length)) {
      const fragment = document.createDocumentFragment()
      files.forEach(file => {
         if (file.type === 'js') {
            const data = document.createElement('script')
            data.setAttribute('type', 'text/javascript')
            data.setAttribute('src', file.path)
            data.setAttribute('data-stylesheet-scope', file.fileScope)
            data.setAttribute('data-stylesheet-id', file.fileId)
            data.setAttribute('data-stylesheet-position', file.position)
            data.setAttribute('data-stylesheet-link-id', file.id)
            fragment.appendChild(data)
         }
      })

      document.body.appendChild(fragment)
   }
}
