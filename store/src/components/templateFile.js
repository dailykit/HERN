import React from 'react'
import { get_env, compileEJSFile } from '../utils'
import ReactHTMLParser, { convertNodeToElement } from 'react-html-parser'
import axios from 'axios'

export const TemplateFile = ({ path = '/navigation-menu/index.ejs', data }) => {
   const [templateString, setTemplateString] = React.useState('')
   const [templateData, setTemplateData] = React.useState(data)

   React.useEffect(() => {
      const url = `${get_env('EXPRESS_URL')}/template/files${path}`
      console.log(url)
      const fetchData = async () => {
         const { data } = await axios.get(url)

         setTemplateString(data)
      }
      fetchData()
   }, [])

   React.useEffect(() => {
      setTemplateData(data)
   }, [data])

   const htmlParserTransform = (node, index) => {
      if (node.type === 'tag' && node?.attribs?.onclick) {
         return (
            <div
               data-div-info="template-listener-wrapper"
               key={index}
               onClick={new Function(node.attribs.onclick)}
            >
               {convertNodeToElement(node)}
            </div>
         )
      } else {
         return convertNodeToElement(node)
      }
   }

   return (
      <div>{ReactHTMLParser(compileEJSFile(templateString, templateData))}</div>
   )
}
