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
      refetchQueries: ['getFolderWithFiles'],
   })

   const [createFile] = useMutation(CREATE_FILE, {
      onCompleted: () => {
         toast.success('File is successfully created!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles'],
   })

   const [renameFolder] = useMutation(RENAME_FOLDER, {
      onCompleted: () => {
         toast.success('Folder is successfully renamed')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles'],
   })

   const [renameFile] = useMutation(RENAME_FILE, {
      onCompleted: () => {
         toast.success('File is successfully renamed')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles'],
   })

   const [deleteFolder] = useMutation(DELETE_FOLDER, {
      onCompleted: () => {
         toast.success('Folder is successfully deleted')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles'],
   })

   const [deleteFile] = useMutation(DELETE_FILE, {
      onCompleted: () => {
         toast.success('File is successfully deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles'],
   })

   const [recordFile] = useMutation(INSERT_RECORD, {
      onCompleted: () => {
         toast.success('File Record successfully saved')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles'],
   })
   const [updateRecoredFile] = useMutation(UPDATE_RECORD, {
      onCompleted: () => {
         toast.success('File Record successfully updated')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles'],
   })
   const [deleteRecoredFile] = useMutation(DELETE_RECORD, {
      onCompleted: () => {
         toast.success('File Record successfully deleted')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
      refetchQueries: ['getFolderWithFiles'],
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
   }
}
