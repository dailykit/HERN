import React, { useEffect } from 'react'
import Image from 'next/image'
import { Slide } from 'react-slideshow-image'
import 'react-slideshow-image/dist/styles.css'

export const IdleScreen = props => {
   const { config } = props
   const properties = {
      duration: 3000,
      autoplay: true,
      transitionDuration: 500,
      infinite: true,
      easing: 'ease',
      arrows: false,
   }
   useEffect(() => {
      const b = document.querySelector('body')
      b.style.padding = 0
   }, [])
   return (
      <div className="hern-kiosk__idle-screen-container">
         <Slide {...properties} cssClass="hern-kiosk__idle-screen-image-slider">
            {config.idlePageSettings.idlePageImage.value.assets.images.map(
               (image, index) => {
                  return (
                     <img
                        src={image}
                        key={index}
                        alt="Picture of the author"
                        className="hern-kiosk__idle-screen-image"
                     />
                  )
               }
            )}
         </Slide>
         <footer
            style={{
               backgroundColor: `${config.kioskSettings.theme.primaryColor.value}`,
            }}
         >
            <img
               src={config.kioskSettings.logo.value}
               alt="logo"
               className="hern-kiosk__idle-screen-footer-logo"
            />
            <span
               className="hern-kiosk__idle-screen-page-text"
               style={{
                  color: `${config.idlePageSettings.idlePageTextColor.value}`,
               }}
            >
               {config.idlePageSettings.idlePageText.value ||
                  config.idlePageText.value}
            </span>
         </footer>
      </div>
   )
}
