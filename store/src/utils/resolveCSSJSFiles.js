import fs from 'fs'

export const resolveCSSJSFiles = async linkedCSSJSFiles => {
   const content = fs.readFileSync(
      process.cwd() + '/public/env-config.js',
      'utf-8'
   )
   /* config file */
   const config = JSON.parse(content.replace('window._env_ = ', ''))

   const getFileScope = file => {
      if (file.brandId !== null) return 'brand'
      if (file.brandPageId !== null) return 'page'
      if (file.brandPageModuleId !== null) return 'page-module'
      if (file.htmlFileId !== null) return 'html-file'
   }

   const files = linkedCSSJSFiles.map(file => ({
      id: file.id,
      path: `${config['EXPRESS_URL']}/template/files${file.file.path}`,
      type: file.file.fileType,
      fileScope: getFileScope(file),
      fileId: file.file.id,
      position: file.position === null ? 0 : file.position,
   }))

   return files
}
