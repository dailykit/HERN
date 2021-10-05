const sharp = require('sharp')

export const minifyImage = async buffer => {
   // minifying buffer through imagemin
   const miniBuffer = await sharp(buffer)
      .jpeg({ quality: 70, lossless: true })
      .toBuffer()
   return miniBuffer
}
