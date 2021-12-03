import Home from '../../views/Home'
import { Route } from 'react-router-dom'
import React from 'react'

const Main = () => {
   return (
      <>
         <Route exact path="/viewStore" component={Home} />
      </>
   )
}

export default Main
