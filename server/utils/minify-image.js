const sharp = require('sharp')

export const minifyImage = async (buffer, type) => {
   console.log('compressing image')
   // minifying buffer through imagemin
   const miniBuffer = await sharp(buffer)
      [type.ext]({ quality: 70, lossless: true })
      .toBuffer()
   return miniBuffer
}
