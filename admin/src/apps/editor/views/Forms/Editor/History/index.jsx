import React from 'react'
import PropTypes from 'prop-types'
import { useQuery } from '@apollo/react-hooks'

// State
import { Context } from '../../../../state'

// Queries
import { GET_COMMITS, GET_COMMIT_CONTENT } from '../../../../graphql'

// Styles
import { HistoryPanel, Commit } from './styles'

// Helpers
import fetchCall from '../../../../utils/fetchCall'

const History = props => {
   const { state, dispatch } = React.useContext(Context)
   const [index, setIndex] = React.useState(null)
   const { loading, data: commits } = useQuery(GET_COMMITS, {
      variables: {
         path: props.path.split('/').slice(0, 1).join('/'),
         commits: props.commits,
      },
   })

   React.useEffect(() => {
      if (index) {
         const body = JSON.stringify({
            query: GET_COMMIT_CONTENT,
            variables: {
               path: props.path,
               id: props.commits[index],
            },
         })
         fetchCall(body).then(({ data }) => {
            const { getCommitContent } = data
            return props.selectVersion(getCommitContent)
         })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [index])

   const selectCommit = index => {
      const version = commits.getCommits[index].committer.timestamp * 1000
      setIndex(index)
      dispatch({
         type: 'SET_VERSION',
         payload: {
            path: props.path,
            version: version,
         },
      })
   }

   if (loading)
      return (
         <HistoryPanel>
            <header>
               <h3>History</h3>
            </header>
            <main>Loading</main>
         </HistoryPanel>
      )
   return (
      <HistoryPanel>
         <header>
            <h3>History</h3>
            {state.tabs[state.currentTab].version && (
               <div>
                  <span>
                     Viewing version
                     {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                     }).format(state.tabs[state.currentTab].version)}
                  </span>
                  <button onClick={() => props.viewCurrentVersion()}>
                     View Current
                  </button>
               </div>
            )}
         </header>
         <main>
            {commits.getCommits.map((commit, index) => (
               <Commit key={index}>
                  <div>
                     <span>{commit.message}</span>
                     <button onClick={() => selectCommit(index)}>View</button>
                  </div>
                  <span>
                     {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                     }).format(commit.committer.timestamp * 1000)}
                  </span>
               </Commit>
            ))}
         </main>
      </HistoryPanel>
   )
}

History.propTypes = {
   commits: PropTypes.array,
   path: PropTypes.string,
}

export default History
