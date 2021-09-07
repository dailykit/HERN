export const processJsFile = folds => {
   if (folds.length && typeof document !== 'undefined') {
      /*Filter undefined scripts*/
      const scripts = folds.flatMap(fold => fold.scripts)
      const filterScripts = scripts.filter(Boolean)
      if (Boolean(filterScripts.length)) {
         const fragment = document.createDocumentFragment()
         filterScripts.forEach(script => {
            const s = document.createElement('script')
            s.setAttribute('type', 'text/javascript')
            s.setAttribute('src', script)
            fragment.appendChild(s)
         })
         document.body.appendChild(fragment)
      }
   }
}
