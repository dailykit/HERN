import React, { useEffect } from 'react'
import ReactPlayer from 'react-player'
import { Slide } from 'react-slideshow-image'
import 'react-slideshow-image/dist/styles.css'

export const IdleScreen = props => {
   const { config } = props
   const [playing, setPlaying] = React.useState(0)
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

   const videoURLs = config.idlePageSettings?.idlePageVideo?.value?.urls
   const playNextFile = () => {
      if (playing === videoURLs.length - 1) {
         setPlaying(0)
      } else {
         setPlaying(playing + 1)
      }
   }

   useEffect(() => {
      props.resetStates()
   }, [])

   return (
      <div className="hern-kiosk__idle-screen-container">
         {config.idlePageSettings?.idlePageVideo &&
         ReactPlayer.canPlay(videoURLs[playing]) ? (
            <>
               {/*TODO: Data types and useIsertType should be changed on the JSON file */}
               {config.idlePageSettings.idlePageVideo.value.assets
                  .backgroundImage && (
                  <div
                     style={{
                        backgroundImage: `url('${config.idlePageSettings.idlePageVideo.value.assets.backgroundImage}')`,
                     }}
                     className="hern-kiosk__idle-screen-video__background"
                  ></div>
               )}

               <ReactPlayer
                  muted
                  className="hern-kiosk__idle-screen-video"
                  playing={true}
                  controls={false}
                  height="100vh"
                  width="100vw"
                  url={videoURLs[playing]}
                  onEnded={playNextFile}
               />
            </>
         ) : (
            <Slide
               {...properties}
               cssClass="hern-kiosk__idle-screen-image-slider"
            >
               {config.idlePageSettings.idlePageImage.value.url.map(
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
         )}
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
