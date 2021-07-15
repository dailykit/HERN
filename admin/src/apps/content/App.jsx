import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import '@dailykit/react-tabulator/css/bootstrap/tabulator_bootstrap.min.css'
import '@dailykit/react-tabulator/lib/styles.css'
import './views/Listings/tableStyle.css'

// Sections
import Header from './sections/Header'
import Sidebar from './sections/Sidebar'
import Main from './sections/Main'
import ErrorBoundary from '../../shared/components/ErrorBoundary'
import BrandContext from './context/Brand'
import ConfigContext from './context/Config'
import FoldContext from './context/Fold'
import NavMenuContext from './context/NavMenu'

// Styled
import { StyledWrapper } from '../../styled'

const App = () => {
   const [isSidebarVisible, toggleSidebar] = React.useState(false)
   const [context, setContext] = React.useState({
      brandId: 0,
      brandName: '',
      websiteId: 0,
      brandDomain: '',
   })
   const [configContext, setConfigContext] = React.useState({})
   const [foldContext, setFoldContext] = React.useState({})
   const [navMenuContext, setNavMenuContext] = React.useState({})

   return (
      <ErrorBoundary rootRoute="/apps/content">
         {/* <StyledWrapper> */}
         <NavMenuContext.Provider value={[navMenuContext, setNavMenuContext]}>
            <FoldContext.Provider value={[foldContext, setFoldContext]}>
               <ConfigContext.Provider
                  value={[configContext, setConfigContext]}
               >
                  <BrandContext.Provider value={[context, setContext]}>
                     <Sidebar
                        visible={isSidebarVisible}
                        toggleSidebar={toggleSidebar}
                     />
                     <Main />
                     {/* </Router> */}
                  </BrandContext.Provider>
               </ConfigContext.Provider>
            </FoldContext.Provider>
         </NavMenuContext.Provider>
         {/* </StyledWrapper> */}
      </ErrorBoundary>
   )
}

export default App
