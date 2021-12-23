import React from 'react'
import { Switch, Route, Link, Router } from 'react-router-dom'
import ManagerLevel from '../Listing'
import LiveMenu from '../Listing/LiveMenu'
import LiveMenuBrandLocation from '../Listing/LiveMenuBrandLocation'

const Main = () => {
   return (
      <main>
         <Switch>
            <Route path="/operationMode" component={ManagerLevel} exact />
            <Route
               path="/operationMode/brandLocation:id"
               component={LiveMenu}
               exact
            />
            <Route path="/operationMode/brand-:id" component={LiveMenu} exact />
         </Switch>
      </main>
   )
}
export default Main
