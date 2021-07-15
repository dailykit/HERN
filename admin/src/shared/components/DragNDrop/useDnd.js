import { useLazyQuery } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { PRIORITY_UPDATE } from './mutation'

export const useDnd = () => {
   //mutation for initial priority update
   const [priorityMutation] = useLazyQuery(PRIORITY_UPDATE, {
      onCompleted: () => {
         toast.success('Priority updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         console.log(error)
      },
   })
   const initiatePriority = ({ tablename, schemaname, data }) => {
      console.log('useDnd', data)
      let item = []
      if (
         data.length === 1 &&
         (!data[0].position || data[0].position !== 1000000)
      ) {
         item = data
         item[0].position = 1000000
      }
      if (data.length > 1) {
         const nullPriorityData = data.filter(
            d => d.position === null || d.position === 0
         )
         if (nullPriorityData.length === 1) {
            item = nullPriorityData
            // item[0].position = 1000000
            if (
               data[data.length - nullPriorityData.length - 1].position === 0
            ) {
               let lastItemPriority =
                  data[data.length - nullPriorityData.length - 2].position / 2
               data[data.length - nullPriorityData.length - 1].position =
                  data[data.length - nullPriorityData.length - 2].position / 2
               for (let i in nullPriorityData) {
                  if (i === nullPriorityData.length - 1) {
                     item[i].position = 0
                     break
                  } else {
                     console.log('else cases')
                     lastItemPriority = lastItemPriority / 2
                     item[i].position = lastItemPriority
                     item[nullPriorityData.length - 1].position = 0
                  }
               }
               item = nullPriorityData
               item[0].position = 0
            } else {
               // console.log("null", nullPriorityData);
               if (item[0].position === 0 && data[0].position === 1000000) {
                  item = []
               } else if (data[0].position !== 1000000) {
                  const firstItem = data[0]
                  item = [firstItem]
                  item[0].position = 1000000
                  // item[item.length - 1].position = 0;
               } else {
                  item = nullPriorityData
                  item[0].position = 0
               }
            }
         }
         if (nullPriorityData.length === 0) {
            console.log('check')
            const lastItem = data[data.length - 1]
            item = [lastItem]
            item[0].position = 0
         }
         if (nullPriorityData.length > 1) {
            item = nullPriorityData
            if (nullPriorityData.length === data.length) {
               for (let i in nullPriorityData) {
                  if (i === nullPriorityData.length - 1) {
                     item[i].position = 0
                     break
                  } else {
                     item[i].position = 1000000 / Math.pow(2, i)
                     item[nullPriorityData.length - 1].position = 0
                  }
               }
            } else {
               console.log('else case')
               let lastItemPriority =
                  data[data.length - nullPriorityData.length - 1].position
               for (let i in nullPriorityData) {
                  if (i === nullPriorityData.length - 1) {
                     item[i].position = 0
                     break
                  } else {
                     console.log('else cases')
                     lastItemPriority = lastItemPriority / 2
                     item[i].position = lastItemPriority
                     item[nullPriorityData.length - 1].position = 0
                  }
               }
            }
         }
      }
      if (item.length > 0) {
         console.log('mutation data', data)
         priorityMutation({
            variables: {
               arg: {
                  tablename,
                  schemaname,
                  data1: data,
               },
            },
         })
      }
   }

   return { initiatePriority, priorityMutation }
}
