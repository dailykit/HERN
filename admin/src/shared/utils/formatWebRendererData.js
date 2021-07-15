export const formatWebRendererData = data => {
   let result = []
   if (data.length) {
      data.forEach(obj => {
         const fileDetail = obj?.file
         const fetchedFile = [fileDetail?.path]
         const fetchedLinkedCssFiles = fileDetail?.linkedCssFiles
            ?.map(file => {
               return file?.cssFile?.path
            })
            ?.flat(1)

         const fetchedLinkedJsFiles = fileDetail.linkedJsFiles
            ?.map(file => {
               return file?.jsFile?.path
            })
            ?.flat(1)
         result.push({
            elementId: `${obj.divId}-${obj?.file?.id}`,
            filePath: fetchedFile,
            cssPath: fetchedLinkedCssFiles,
            jsPath: fetchedLinkedJsFiles,
            fileId: obj.file.id,
         })
      })
   }
   return result
}
