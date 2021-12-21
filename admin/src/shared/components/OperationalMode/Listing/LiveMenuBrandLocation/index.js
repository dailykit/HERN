import React from 'react'
import { useLocation } from 'react-router-dom'

const LiveMenuBrandLocation = () => {
   const location = useLocation()
   console.log('location:::', location.state[0].brandId)
   return <div></div>
}

export default LiveMenuBrandLocation
