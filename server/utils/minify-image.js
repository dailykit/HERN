export const minifyImage = async (buffer, type) => {
   let fileType
   // minifying buffer through imagemin
   if (type.ext === 'jpg') {
      fileType = 'jpeg'
   } else {
      fileType = type.ext
   }
   try {
      const miniBuffer = await sharp(buffer)
         [fileType]({ quality: 70, lossless: true })
         .toBuffer()

      return miniBuffer
   } catch (error) {
      console.log(error)
      return error
   }
}
