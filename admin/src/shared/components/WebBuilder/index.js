import React, { useEffect, useState, useRef } from 'react'
import 'grapesjs/dist/css/grapes.min.css'
import 'grapesjs-preset-webpage'
import grapesjs from 'grapesjs'
import axios from 'axios'
import { toast } from 'react-toastify'
import { InlineLoader } from '../InlineLoader'
import { logger } from '../../utils'
import { config } from './config'
import { StyledDiv } from './style'
import { get_env } from '../../utils'
const Builder = React.forwardRef(
   (
      {
         path = '',
         content = '',
         onChangeContent,
         linkedCss = [],
         linkedJs = [],
      },
      ref
   ) => {
      const baseUrl = `${get_env('REACT_APP_EXPRESS_URL')}/template/files`
      const url = `${window._env_.REACT_APP_DAILYOS_SERVER_URI}/api/assets`
      const editorRef = useRef()
      const linkedCssArray = linkedCss.map(file => {
         let fileUrl = `${baseUrl}${file.cssFile.path}`
         if (/\s/.test(url)) {
            fileUrl = url.split(' ').join('%20')
         }
         return fileUrl
      })
      const linkedJsArray = linkedJs.map(file => {
         let fileUrl = `${baseUrl}${file.jsFile.path}`
         if (/\s/.test(url)) {
            fileUrl = url.split(' ').join('%20')
         }
         return fileUrl
      })
      const [mount, setMount] = useState(false)
      const [blocks, setBlocks] = useState([])
      const toggler = useRef(true)

      // mutation for saving the template
      const updateCode = (updatedCode, filePath) => {
         axios({
            url: window._env_.REACT_APP_DATA_HUB_URI,
            method: 'POST',
            headers: {
               'x-hasura-admin-secret':
                  window._env_.REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET,
            },
            data: {
               query: `
         mutation updateFile($path: String!, $content: String!, $message: String!) {
            updateFile(path: $path, content: $content, message: $message) {
               ... on Error {
                  success
                  error
               }
               ... on Success {
                  success
                  message
               }
            }
         }
           `,
               variables: {
                  path: filePath,
                  content: updatedCode,
                  message: 'update: template',
               },
            },
         })
            .then(() => toast.success('Template updated'))
            .catch(error => {
               toast.error('Failed to Add!')
               logger(error)
            })
      }

      // Initialize the grapejs editor by passing config object
      useEffect(() => {
         const editor = grapesjs.init({
            ...config,
            canvas: {
               styles: linkedCssArray,
               scripts: linkedJsArray,
            },
         })
         editorRef.current = editor
         setMount(true)
         return () => {
            const code = `${editorRef.current.getHtml()}
               <style> ${editorRef.current.getCss()} </style>`
            onChangeContent(code)
            editorRef.current.destroy()
         }
      }, [])

      React.useEffect(() => {
         const getBlocks = async () => {
            try {
               const { data } = await axios({
                  url: window._env_.REACT_APP_THEME_STORE_DATA_HUB_URI,
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                     'x-hasura-admin-secret':
                        window._env_
                           .REACT_APP_THEME_STORE_HASURA_GRAPHQL_ADMIN_SECRET,
                  },
                  data: {
                     query: `
               query getBlocks {
                  editor_block {
                    category
                    fileId
                    name
                    path
                    assets
                  }
                }
           `,
                  },
               })
               const blocksData = await Promise.all(
                  data.data.editor_block.map(async block => {
                     try {
                        const blockContent = await axios.get(
                           `${baseUrl}${block.path}`
                        )
                        return {
                           content: blockContent.data,
                           assets: block.assets,
                           name: block.name,
                           category: block.category,
                        }
                     } catch (err) {
                        console.log(err)
                     }
                  })
               )

               setBlocks(blocksData)
            } catch (error) {
               toast.error('Failed to load blocks!')
               logger(error)
            }
         }
         getBlocks()
      }, [])

      React.useImperativeHandle(ref, () => ({
         func(action) {
            editorRef.current.Commands.add('set-device-desktop', {
               run: ed => {
                  ed.setDevice('Desktop')
               },
            })
            editorRef.current.Commands.add('set-device-tablet', {
               run: ed => {
                  ed.setDevice('Tablet')
               },
            })
            editorRef.current.Commands.add('set-device-mobile', {
               run: ed => {
                  ed.setDevice('Mobile portrait')
               },
            })
            editorRef.current.Commands.add('save-template', {
               run: editor => {
                  const updatedCode = `${editor.getHtml()} <style> ${editor.getCss()} </style>`
                  updateCode(updatedCode, path)
               },
            })
            // stop command
            if (action === 'core:fullscreen' || action.includes('set-device')) {
               editorRef.current.stopCommand(action)
            }
            // run command
            editorRef.current.runCommand(action)
         },
      }))

      // loading all dailykit images in webBuilder image component

      if (mount && editorRef?.current) {
         const editor = editorRef.current
         const assetManager = editorRef.current.AssetManager
         axios.get(`${url}?type=images`).then(data => {
            data.data.data.map(image => {
               return assetManager.add(image.url)
            })
         })

         blocks.forEach(block => {
            editor.BlockManager.add(block?.name, {
               label: `<div>
                   <img src="${block?.assets?.icon}" height="60px" width="60px"/>
                   <div class="my-label-block">${block?.name}</div>
                 </div>`,
               content: block?.content,
               category: block?.category,
            })
         })

         // editor.Canvas.getDocument().head.insertAdjacentHTML(
         //    'beforeend',
         //    '<link href="https://test.dailykit.org/template/files/Riofit%20Meals/css/style.css" rel="stylesheet" />'
         // )
         // linkedCssArray.map(url => {

         // })

         // Adding a save button in webBuilder
         // if (!editor.Panels.getButton('devices-c', 'save')) {
         //    editor.Panels.addButton('devices-c', [
         //       {
         //          id: 'save',
         //          className: 'fa fa-floppy-o icon-blank',
         //          command: function (editor1, sender) {
         //             const updatedCode =
         //                editor.getHtml() +
         //                '<style>' +
         //                editor.getCss() +
         //                '</style>'
         //             updateCode(updatedCode, path)
         //          },
         //          attributes: { title: 'Save Template' },
         //       },
         //    ])
         // }

         // Define commands for style manager
         editor.Commands.add('show-layers', {
            getRowEl(ed) {
               return ed.getContainer().closest('.editor-row')
            },
            getLayersEl(row) {
               return row.querySelector('.layers-container')
            },

            run(ed) {
               const lmEl = this.getLayersEl(this.getRowEl(ed))
               lmEl.style.display = ''
            },
            stop(ed) {
               const lmEl = this.getLayersEl(this.getRowEl(ed))
               lmEl.style.display = 'none'
            },
         })

         // command for styles
         editor.Commands.add('show-styles', {
            getRowEl(ed) {
               return ed.getContainer().closest('.editor-row')
            },
            getStyleEl(row) {
               return row.querySelector('.styles-container')
            },

            run(ed) {
               const smEl = this.getStyleEl(this.getRowEl(ed))
               smEl.style.display = ''
            },
            stop(ed) {
               const smEl = this.getStyleEl(this.getRowEl(ed))
               smEl.style.display = 'none'
            },
         })

         // command for traits
         editor.Commands.add('show-traits', {
            getTraitsEl(ed) {
               const row = ed.getContainer().closest('.editor-row')
               return row.querySelector('.traits-container')
            },
            run(ed) {
               this.getTraitsEl(ed).style.display = ''
            },
            stop(ed) {
               this.getTraitsEl(ed).style.display = 'none'
            },
         })

         // Command for blocks
         editor.Commands.add('show-blocks', {
            getRowEl(ed) {
               return ed.getContainer().closest('.editor-row')
            },
            getBlockEl(row) {
               return row.querySelector('.blocks-container')
            },

            run(ed) {
               const bmEl = this.getBlockEl(this.getRowEl(ed))
               bmEl.style.display = ''
            },
            stop(ed) {
               const bmEl = this.getBlockEl(this.getRowEl(ed))
               bmEl.style.display = 'none'
            },
         })

         // call mutation for storing the template
         // editor.on('storage:store', function (e) {
         //    const updatedCode =
         //       editor.getHtml() + '<style>' + editor.getCss() + '</style>'
         //    updateCode(updatedCode, path)
         // })

         // editor.getModel().set('dmode', 'absolute')

         // editor.Canvas.({
         //    styles: linkedCssArray,
         //    scripts: linkedJsArray,
         // })
         // console.log(editor.Canvas.postRender)

         // set the content in the editor
         if (content) {
            editor.setComponents(content)
         }
         // editor.Panels.removePanel('views')
         if (!editor.Panels.getButton('views', 'sidePanelToggler')) {
            editor.Panels.addButton('views', {
               id: 'sidePanelToggler',
               className: 'fa fa-chevron-right',
               command: ed => {
                  toggler.current = !toggler.current
                  ed.Panels.getButton('views', 'sidePanelToggler').set(
                     'className',
                     toggler.current
                        ? 'fa fa-chevron-right icon-blank'
                        : 'fa fa-chevron-left icon-blank'
                  )
                  if (ed.Panels.getPanel('views-container')) {
                     ed.Panels.getPanel('views-container').set(
                        'visible',
                        toggler.current
                     )

                     document.getElementsByClassName(
                        'gjs-pn-views'
                     )[0].style.width = `${toggler.current ? '15%' : '3%'}`
                     document.getElementsByClassName(
                        'gjs-pn-views-container'
                     )[0].style.width = `${toggler.current ? '15%' : '3%'}`
                     document.getElementsByClassName(
                        'gjs-cv-canvas'
                     )[0].style.width = `${toggler.current ? '85%' : '97%'}`

                     ed.Panels.getButton('views', 'open-sm').set('attributes', {
                        style: `display:${
                           toggler.current ? 'inline-flex' : 'none'
                        }`,
                     })
                     ed.Panels.getButton('views', 'open-tm').set('attributes', {
                        style: `display:${
                           toggler.current ? 'inline-flex' : 'none'
                        }`,
                     })
                     ed.Panels.getButton('views', 'open-layers').set(
                        'attributes',
                        {
                           style: `display:${
                              toggler.current ? 'inline-flex' : 'none'
                           }`,
                        }
                     )
                     ed.Panels.getButton('views', 'open-blocks').set(
                        'attributes',
                        {
                           style: `display:${
                              toggler.current ? 'inline-flex' : 'none'
                           }`,
                        }
                     )
                     ed.Panels.getButton('views', 'open-blocks').set(
                        'active',
                        true
                     )
                  }
               },

               active: false,
            })
         }

         // editor.Panels.getPanel('views').set('visible', false)
         editor.Panels.removePanel('commands')
         editor.Panels.removePanel('devices-c')
         editor.Panels.removePanel('options')
      }

      return (
         <StyledDiv>
            <div className="editor-row">
               <div className="editor-canvas">
                  <div id="gjs">
                     <InlineLoader />
                  </div>
               </div>
            </div>
         </StyledDiv>
      )
   }
)

export default Builder
