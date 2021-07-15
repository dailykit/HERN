import React from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import {
   UPDATE_SHOWN_COUNT,
   GET_SHOW_COUNT,
   UPDATE_LAST_VISITED,
} from '../../graphql'
import moment from 'moment'
import useIsOnViewPort from '../../hooks/useIsOnViewport'
import ActionButtons from './components/ActionButtons'
import { Wrapper } from './styles'
import { toast } from 'react-toastify'
import { logger } from '../../utils'

const BannerFile = ({ file, id, handleClose, userEmail }) => {
   const [isOpen, setIsOpen] = React.useState(true)
   const ref = React.useRef()
   const isOnViewport = useIsOnViewPort(ref)
   const [lastVisited, setLastVisited] = React.useState(null)

   const [updateShownCount] = useMutation(UPDATE_SHOWN_COUNT, {
      skip: !userEmail,
      onError: err => {
         toast.error('Something went wrong !')
         logger(err)
         return null
      },
   })

   const [updateLastVisited] = useMutation(UPDATE_LAST_VISITED, {
      skip: !userEmail,
      onError: err => {
         toast.error('Something went wrong !')
         logger(err)
         return null
      },
   })

   const { data, error, loading } = useQuery(GET_SHOW_COUNT, {
      skip: !userEmail,
      variables: {
         userEmail,
         divId: file.divId,
         fileId: file.file.id,
      },
   })

   React.useEffect(() => {
      const queryData = data?.ux_user_dailyosDivIdFile[0]
      const isValidShownAgain =
         data && !loading && !error && queryData?.showAgain
      const isValidNotShowAgain =
         data &&
         !loading &&
         !error &&
         !queryData?.showAgain &&
         queryData?.shownCount === 0 &&
         queryData?.closedCount === 0

      setLastVisited(queryData?.lastVisited)

      if (isValidShownAgain || isValidNotShowAgain) {
         setIsOpen(true)
         updateLastVisited({
            variables: {
               lastVisited: new Date().toISOString(),
               userEmail,
               divId: file.divId,
               fileId: file.file.id,
            },
         })
      }
   }, [data, loading, error])

   React.useEffect(() => {
      const isBeforeADay = moment(lastVisited).isBefore(
         moment().subtract(24, 'hours')
      )

      if (isOnViewport && isBeforeADay) {
         updateShownCount({
            variables: {
               userEmail,
               divId: file.divId,
               fileId: file.file.id,
            },
         })
      }
   }, [isOnViewport, lastVisited])

   return (
      <Wrapper ref={ref}>
         {file.divId === id && file.condition.isValid && (
            <>
               <ActionButtons isMinimized={isOpen} setIsMinimized={setIsOpen} />
               <div
                  id={`${id}-${file.file.id}`}
                  style={{ display: isOpen ? 'block ' : 'none' }}
               />
            </>
         )}
      </Wrapper>
   )
}

export default BannerFile
