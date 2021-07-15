import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Flex, Spacer, ComboButton } from '@dailykit/ui'
import { EditIcon, CloseIcon } from '../../assets/Icons'
import { Popup } from '../../../../shared/components'
import { Cross, PhotoGrid } from './style'
import { logger, get_env } from '../../../../shared/utils'

export default function ThemeStore({ show, closePopup, setCreateType }) {
   const [templates, setTemplates] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(false)
   const [clickedTempId, setClickedTempId] = React.useState(0)
   const copyTemplate = async (templatePath, templateId) => {
      setIsLoading(true)
      setClickedTempId(templateId)
      try {
         await axios.post(
            `https://test.dailykit.org/template/download${templatePath}`
         )
         setIsLoading(false)
         closePopup()
         toast.success('Template Copied successfully')
         window.location.reload()
      } catch (error) {
         setIsLoading(false)
         closePopup()
         toast.error('Something went wrong while copying template')
         logger(error)
      }
   }
   React.useEffect(() => {
      const getTemplates = async () => {
         try {
            const { data } = await axios({
               url: get_env('REACT_APP_THEME_STORE_DATA_HUB_URI'),
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'x-hasura-admin-secret': get_env(
                     'REACT_APP_THEME_STORE_HASURA_GRAPHQL_ADMIN_SECRET'
                  ),
               },
               data: {
                  query: `
                  query getTemplateInfo {
                     editor_template {
                       id
                       name
                       route
                       thumbnail
                     }
                   }         
        `,
               },
            })
            setTemplates(data?.data?.editor_template || [])
         } catch (error) {
            toast.error('Failed to load templates!')
            logger(error)
         }
      }
      getTemplates()
   }, [])
   return (
      <Popup show={show} size="1200px">
         <Flex container alignItems="start" justifyContent="space-between">
            <Popup.Text>Choose a Template</Popup.Text>
            <Cross onClick={() => closePopup()}>{CloseIcon}</Cross>
         </Flex>
         <PhotoGrid>
            {templates.map(template => (
               <div className="theme" key={template.id}>
                  <h3>{template.name}</h3>
                  <img src={template.thumbnail} alt={template.name} />
                  <Spacer size="4px" />
                  <ComboButton
                     type="ghost"
                     size="sm"
                     isLoading={clickedTempId === template.id && isLoading}
                     onClick={() => copyTemplate(template.route, template.id)}
                  >
                     <EditIcon size="20" /> Edit
                  </ComboButton>
               </div>
            ))}
         </PhotoGrid>
      </Popup>
   )
}
