import React, { useRef } from 'react'
import MonacoEditor, { loader } from '@monaco-editor/react'
import { useMutation } from '@apollo/react-hooks'
import { Flex, Form } from '@dailykit/ui'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'

// State
import { Context } from '../../state'
// Components
import ReferenceFile from './ReferenceFile'
import EditorOptions from './EditorOptions'
import History from './History'
import { WebBuilder } from '../../../../shared/components'

// Queries
import { GET_FILE_FETCH, UPDATE_FILE, DRAFT_FILE } from '../../graphql'

// Styles
import { EditorWrapper } from './styles'

// Helpers
import fetchCall from '../../utils/fetchCall'

const Editor = ({ path }) => {
   const monacoRef = useRef()
   const editorRef = useRef()

   const { state, dispatch } = React.useContext(Context)

   const [code, setCode] = React.useState('')
   const [file, setFile] = React.useState({})
   const [isModalVisible, toggleModal] = React.useState(false)
   const [updateFile] = useMutation(UPDATE_FILE)
   const [draftFile] = useMutation(DRAFT_FILE, {
      onCompleted: () => {
         toast.success('File Saved successfully')
      },
      onError: error => {
         toast.error('Something went wrong')
         console.log(error)
      },
   })
   const [language, setLanguage] = React.useState('javascript')
   const [theme, setTheme] = React.useState('vs-light')
   const [themes] = React.useState([
      { id: 1, title: 'Light', value: 'vs-light' },
      { id: 2, title: 'Dark', value: 'vs-dark' },
   ])
   const [isDark, setIsDark] = React.useState(false)
   const [isWebBuilderOpen, setIsWebBuilderOpen] = React.useState(false)

   React.useEffect(() => {
      loader.init().then(monaco => {
         monacoRef.current = monaco
      })
   }, [])

   React.useEffect(() => {
      const body = JSON.stringify({
         query: GET_FILE_FETCH,
         variables: {
            path: path,
         },
      })
      fetchCall(body).then(({ data }) => {
         const { getFile } = data
         const fileType = getFile.path.split('.').pop()
         switch (fileType) {
            case 'js':
               console.log(fileType)
               setLanguage('javascript')
               break
            case 'html':
               setLanguage(fileType)
               break
            case 'css':
               setLanguage(fileType)
               break
            case 'pug':
               setLanguage(fileType)
               break
         }
         setCode(getFile.content)
         setFile(getFile)
      })
   }, [path])

   const selectFile = async path => {
      toggleModal(false)
      const position = editorRef.current.getPosition()

      const range = new monacoRef.current.Range(
         position.lineNumber,
         position.column,
         position.lineNumber,
         position.column
      )

      const id = { major: 1, minor: 1 }

      const text = {
         name: path.split('/').pop(),
         path: path,
      }
      const op = {
         identifier: id,
         range: range,
         text: JSON.stringify(text, null, 2),
         forceMoveMarkers: true,
      }
      editorRef.current.executeEdits(code, [op])
   }

   function handleEditorDidMount(editor) {
      editorRef.current = editor
      editorRef.current.addCommand(
         monacoRef.current.KeyMod.Shift | monacoRef.current.KeyCode.KEY_2,
         () => toggleModal(!isModalVisible)
      )
   }

   const publish = message => {
      const code = editorRef.current.getValue()
      updateFile({
         variables: {
            path,
            content: code,
            message,
         },
      })
   }

   const draft = () => {
      const code = editorRef.current.getValue()
      dispatch({ type: 'UPDATE_LAST_SAVED' })
      draftFile({
         variables: {
            path: path,
            content: code,
         },
      })
   }

   const viewCurrentVersion = () => {
      setCode(state.tabs[state.currentTab].draft)
      dispatch({ type: 'REMOVE_VERSION', payload: path })
      dispatch({ type: 'REMOVE_DRAFT', payload: path })
   }

   const selectVersion = contentVersion => {
      if (state.tabs.find(tab => tab.path === path).draft === '') {
         dispatch({
            type: 'SET_DRAFT',
            payload: {
               content: editorRef.current.getValue(),
               path: path,
            },
         })
      }
      setCode(contentVersion)
   }

   const options = {
      fontFamily: 'monospace',
      fontSize: '16px',
      wordWrap: true,
      quickSuggestions: true,
      autoIndent: true,
      contextmenu: true,
      formatOnType: true,
      highlightActiveIndentGuide: true,
      quickSuggestionsDelay: 100,
      renderIndentGuides: true,
      renderLineHighlight: 'all',
      roundedSelection: true,
      scrollBeyondLastColumn: 5,
      scrollBeyondLastLine: false,
      selectOnLineNumbers: true,
      selectionHighlight: true,
      smoothScrolling: true,
   }

   const setDarkTheme = () => {
      setIsDark(!isDark)
   }

   // const langFormatProvider = {
   //    provideDocumentFormattingEdits(model, options, token) {
   //       return [
   //          {
   //             text: YourFormatter(model.getValue()), // put formatted text here
   //             range: model.getFullModelRange(),
   //          },
   //       ]
   //    },
   // }
   // const languageId = language
   // monaco.languages.registerDocumentFormattingEditProvider(
   //    languageId,
   //    langFormatProvider
   // )
   // const templateAreas = ()=>{
   //    let area = ''
   //    if(state.isHistoryVisible ){
   //       area = "'head head head head' 'main main main aside'"
   //    }else if(isWebBuilderOpen){
   //       area = ""
   //    }
   // }
   React.useEffect(() => {
      setTheme(isDark ? 'vs-dark' : 'vs-light')
   }, [isDark])

   return (
      <>
         <div style={{ position: 'absolute', margin: '16px 0' }}>
            <Flex container alignItems="center" justifyContent="space-around">
               <Form.Label htmlFor="theme" title="theme">
                  Dark Theme
               </Form.Label>
               <Form.Toggle
                  name="first_time"
                  onChange={setDarkTheme}
                  value={isDark}
               />
            </Flex>
         </div>
         <EditorWrapper isHistoryVisible={state.isHistoryVisible}>
            {isModalVisible && (
               <ReferenceFile
                  title="Add File"
                  toggleModal={toggleModal}
                  selectFile={selectFile}
               />
            )}

            <EditorOptions
               publish={publish}
               draft={draft}
               lastSaved={file.lastSaved}
               isBuilderOpen={val => setIsWebBuilderOpen(val)}
               language={language}
            />

            {!isWebBuilderOpen ? (
               <MonacoEditor
                  height="86vh"
                  width="100%"
                  language={language}
                  theme={theme}
                  value={code}
                  options={options}
                  onMount={handleEditorDidMount}
               />
            ) : (
               <WebBuilder
                  content={editorRef.current.getValue()}
                  onChangeContent={updatedCode => setCode(updatedCode)}
                  path={state?.tabs[state?.currentTab]?.path}
                  linkedCss={state?.tabs[state?.currentTab]?.linkedCss}
                  linkedJs={state?.tabs[state?.currentTab]?.linkedJs}
               />
            )}
            {state.isHistoryVisible && Object.keys(file).length > 0 && (
               <History
                  commits={file.commits}
                  path={path}
                  selectVersion={selectVersion}
                  viewCurrentVersion={viewCurrentVersion}
               />
            )}
         </EditorWrapper>
      </>
   )
}

Editor.propTypes = {
   path: PropTypes.string,
}

export default Editor
