import pug from 'pug'
import ejs from 'ejs'

export const compileEJSFile = (templateString, data) => {
   const htmlString = ejs.compile(templateString)
   return htmlString(data)
}

export const compilePUGFile = (templateString, data) => {
   const htmlString = pug.render(templateString, data)
   return htmlString
}
