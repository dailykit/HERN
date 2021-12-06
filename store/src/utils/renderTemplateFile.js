import pug from 'pug'
import ejs from 'ejs'

export const compileEJSFile = (templateString, options) => {
   const htmlString = ejs.render(templateString, options)
   return htmlString
}

export const compilePUGFile = (templateString, options) => {
   const htmlString = pug.render(templateString, options)
   return htmlString
}
