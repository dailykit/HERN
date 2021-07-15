import React, { useState } from 'react'
import {
   EditorState,
   ContentState,
   convertFromHTML,
   convertToRaw,
} from 'draft-js'
import { Editor } from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import './styles.css'

export default function RichText({
   defaultValue = '<p>Rich Text Editor</p>',
   onChange,
}) {
   //    const [editorOnFocus, setEditorOnFocus] = useState(false)
   const [editorState, setEditorState] = useState(
      EditorState.createWithContent(
         ContentState.createFromBlockArray(convertFromHTML(defaultValue))
      )
   )
   const onEditorStateChange = updatedEditorState => {
      setEditorState(updatedEditorState)
      onChange(
         draftToHtml(convertToRaw(updatedEditorState.getCurrentContent()))
      )
   }
   return (
      <Editor
         //  toolbarHidden={!editorOnFocus}
         //  onFocus={() => setEditorOnFocus(true)}
         //  onBlur={() => setEditorOnFocus(false)}
         editorState={editorState}
         wrapperClassName="wrapper-class"
         editorClassName="editor-class"
         toolbarClassName="toolbar-class"
         onEditorStateChange={onEditorStateChange}
      />
      //   <textarea
      //     disabled
      //     value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
      //   />
      // </>
   )
}
