import { useMutation } from '@apollo/react-hooks'
import {
   CREATE_FILE,
   CREATE_FOLDER,
   RENAME_FILE,
   RENAME_FOLDER,
   DELETE_FILE,
   DELETE_FOLDER,
   UPDATE_RECORD,
   INSERT_RECORD,
   DELETE_RECORD,
   CREATE_BLOCK,
} from '../graphql'
import { toast } from 'react-toastify'

export const useDailyGit = () => {
   const [createFolder] = useMutation(CREATE_FOLDER, {
      onCompleted: () => {
         toast.success('Folder is successfully created!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles', 'getNestedFolders'],
   })

   const [createFile] = useMutation(CREATE_FILE, {
      onCompleted: () => {
         toast.success('File is successfully created!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles', 'getNestedFolders'],
   })

   const [renameFolder] = useMutation(RENAME_FOLDER, {
      onCompleted: () => {
         toast.success('Folder is successfully renamed')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles', 'getNestedFolders'],
   })

   const [renameFile] = useMutation(RENAME_FILE, {
      onCompleted: () => {
         toast.success('File is successfully renamed')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles', 'getNestedFolders'],
   })

   const [deleteFolder] = useMutation(DELETE_FOLDER, {
      onCompleted: () => {
         toast.success('Folder is successfully deleted')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles', 'getNestedFolders'],
   })

   const [deleteFile] = useMutation(DELETE_FILE, {
      onCompleted: () => {
         toast.success('File is successfully deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles', 'getNestedFolders'],
   })

   const [recordFile] = useMutation(INSERT_RECORD, {
      onCompleted: () => {
         toast.success('File Record successfully saved')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles', 'getNestedFolders'],
   })
   const [updateRecoredFile] = useMutation(UPDATE_RECORD, {
      onCompleted: () => {
         toast.success('File Record successfully updated')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles', 'getNestedFolders'],
   })
   const [deleteRecoredFile] = useMutation(DELETE_RECORD, {
      onCompleted: () => {
         toast.success('File Record successfully deleted')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles', 'getNestedFolders'],
   })

   const [addBlock] = useMutation(CREATE_BLOCK, {
      onCompleted: () => {
         toast.success('File added to the block')
      },
      onError: error => {
         toast.error('Something is Wrong')
         console.log(error)
      },
   })

   return {
      createFile,
      createFolder,
      renameFile,
      renameFolder,
      deleteFile,
      deleteFolder,
      recordFile,
      updateRecoredFile,
      deleteRecoredFile,
      addBlock,
   }
}
