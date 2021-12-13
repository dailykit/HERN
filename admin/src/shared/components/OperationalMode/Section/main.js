import React from 'react'
import { Switch, Route, Link, Router } from 'react-router-dom'
import ManagerLevel from '../Listing'
import LiveMenu from '../Listing/LiveMenu'

const Main = () => {
   return (
      <main>
         <Switch>
            <Route path="/operationMode" component={ManagerLevel} exact />
            <Route path="/operationMode/product" exact />
            <Route path="/operationMode/:id" component={LiveMenu} exact />
         </Switch>
      </main>
   )
}
export default Main
