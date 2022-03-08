import React from 'react'
import { get_env } from '../utils'
import ReactHTMLParser from 'react-html-parser'
import axios from 'axios'
import { compileEJSFile } from '../utils/renderTemplateFile'

export const TemplateFile = ({ path = '/navigation-menu/index.ejs', data }) => {
   const [templateString, setTemplateString] = React.useState('')
   const [templateData, setTemplateData] = React.useState(data)

   React.useEffect(() => {
      const url = `${get_env('BASE_BRAND_URL')}/template/files${path}`
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

   console.log(
      'promsie',
      import('../utils/renderTemplateFile').then(promise =>
         promise.compileEJSFile(templateString, templateData)
      )
   )
   return (
      <div>{ReactHTMLParser(compileEJSFile(templateString, templateData))}</div>
   )
}
