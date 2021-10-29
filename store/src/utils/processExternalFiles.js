export const processExternalFiles = (folds, pageLevelFiles) => {
   // Adding css links  attached with page
   if (Boolean(pageLevelFiles.css.length)) {
      const fragment = document.createDocumentFragment()
      pageLevelFiles.css.forEach(path => {
         const data = document.createElement('link')
         data.setAttribute('rel', 'stylesheet')
         data.setAttribute('href', path)
         data.setAttribute('type', 'text/css')
         data.setAttribute('media', 'screen')
         data.setAttribute('data-stylesheet-type', 'page-stylesheet')
         fragment.appendChild(data)
      })
      document.head.appendChild(fragment)
   }

   if (folds.length && typeof document !== 'undefined') {
      /*Adding scripts attached with modules*/
      /*Filter undefined scripts*/
      const scripts = folds.flatMap(fold => fold.scripts)
      const filterScripts = scripts.filter(Boolean)
      if (Boolean(filterScripts.length)) {
         const fragment = document.createDocumentFragment()
         filterScripts.forEach(script => {
            const data = document.createElement('script')
            data.setAttribute('type', 'text/javascript')
            data.setAttribute('src', script)
            data.setAttribute('data-script-type', 'module-script')
            fragment.appendChild(data)
         })
         document.body.appendChild(fragment)
      }

      /*Adding scripts attached with page */
      const filterPageLevelScripts = pageLevelFiles.scripts.filter(Boolean)
      if (Boolean(filterPageLevelScripts.length)) {
         const fragment = document.createDocumentFragment()
         filterPageLevelScripts.forEach(script => {
            const data = document.createElement('script')
            data.setAttribute('type', 'text/javascript')
            data.setAttribute('src', script)
            data.setAttribute('data-script-type', 'page-script')
            fragment.appendChild(data)
         })
         document.body.appendChild(fragment)
      }
   }
}
