import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import {
   INSERT_NAVIGATION_MENU_ITEM,
   UPDATE_NAVIGATION_MENU_ITEM,
   DELETE_NAVIGATION_MENU_ITEM,
} from '../../graphql'
import { logger } from '../../../../shared/utils'

export const useNavbarMenu = () => {
   // Mutation for creating a menu item
   const [createMenuItem] = useMutation(INSERT_NAVIGATION_MENU_ITEM, {
      onCompleted: () => {
         toast.success('Menu Item created!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })
   // Mutation for updating  menu item
   const [updateMenuItem] = useMutation(UPDATE_NAVIGATION_MENU_ITEM, {
      onCompleted: () => {
         toast.success('Menu Item updated!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })
   // Mutation for deleting menu item
   const [deleteMenuItem] = useMutation(DELETE_NAVIGATION_MENU_ITEM, {
      onCompleted: () => {
         toast.success('Menu Item deleted!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   return {
      createMenuItem,
      updateMenuItem,
      deleteMenuItem,
   }
}
