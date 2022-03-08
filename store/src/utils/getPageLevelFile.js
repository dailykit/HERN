import fs from 'fs'

export const getPageLevelFiles = async dataByRoute => {
   const content = await fs.readFileSync(
      process.cwd() + '/public/env-config.js',
      'utf-8'
   )
   /* config file */
   const config = JSON.parse(content.replace('window._env_ = ', ''))

   const linkedFiles = await dataByRoute?.brands_brandPages[0][
      'brandPagesLinkedFiles'
   ]

   const css = linkedFiles
      .filter(file => file.fileType === 'css')
      .map(
         file =>
            `${config['BASE_BRAND_URL']}/template/files${file.linkedFile.path}`
      )

   const scripts = linkedFiles
      .filter(file => file.fileType === 'js')
      .map(
         file =>
            `${config['BASE_BRAND_URL']}/template/files${file.linkedFile.path}`
      )

   return { scripts, css }
}
