const imagemin = require('imagemin')
const mozjpeg = require('imagemin-mozjpeg')
const sharp = require('sharp')
const isJpg = require('is-jpg')

export const minifyImage = async buffer => {
   // converting image to jpg
   const convertToJpg = async input => {
      if (isJpg(input)) {
         return input
      }

      return sharp(input).jpeg().toBuffer()
   }

   // minifying buffer through imagemin
   const miniBuffer = await imagemin.buffer(buffer, {
      plugins: [convertToJpg, mozjpeg({ quality: 70 })]
   })
   return miniBuffer
}
