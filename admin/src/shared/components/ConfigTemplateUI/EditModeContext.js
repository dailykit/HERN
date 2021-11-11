import React from 'react'

export const EditModeContext = React.createContext()

export const EditModeProvider = props => {
   const [editMode, setEditMode] = React.useState(false)
   
   return (
      <EditModeContext.Provider
         value={{ editMode, setEditMode}}
      >
         {props.children}
      </EditModeContext.Provider>
   )
}
export const useEditMode = () => {
   const { editMode, setEditMode} =
      React.useContext(EditModeContext)
   return { editMode, setEditMode}
}
