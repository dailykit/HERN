import React from 'react'
import { Flex, Spacer } from '@dailykit/ui'
import { GridView, StyledWrapper } from './style.js'
import ReactPlayer from 'react-player'
import Modal from './modal'
import Button from '../Button'
import useModal from '../useModal'
import { ChevronLeft, ChevronRight } from '../Icons/index.js'
import { theme } from '../../theme'
import { useWindowDimensions } from '../../utils'

const GridComp = ({
   data = {
      videos: [],
      images: []
   },
   layout = 'single'
}) => {
   const { ModalContainer, isShow, show, hide } = useModal()
   const { width } = useWindowDimensions()
   const [urls, setUrls] = React.useState([])
   const [showIndex, setShowIndex] = React.useState(0)
   const next = () => {
      if (showIndex === urls.length - 3) {
         setShowIndex(0)
      } else {
         setShowIndex(prev => prev + 1)
      }
   }
   const previous = () => {
      if (showIndex === 0) {
         setShowIndex(urls.length - 3)
      } else {
         setShowIndex(prev => prev - 1)
      }
   }
   React.useEffect(() => {
      const videoUrls = data?.videos.map(video => {
         return {
            type: 'video',
            path: video
         }
      })
      const imageUrls = data?.images.map(image => {
         return {
            type: 'image',
            path: image
         }
      })
      setUrls([...videoUrls, ...imageUrls])
   }, [data])

   return (
      <>
         <StyledWrapper>
            {layout === 'grid' && (
               <div className="outter-div">
                  <GridView>
                     {(width > 769 || showIndex === 0) &&
                        data?.videos.length > 0 && (
                           <div className="grid-child child1">
                              {data?.videos.length > 0 ? (
                                 <ReactPlayer
                                    controls
                                    width="100%"
                                    height="100%"
                                    url={data?.videos[0]}
                                 />
                              ) : (
                                 <img src={data?.images[0]} alt=" child-img" />
                              )}
                           </div>
                        )}
                     {(width > 769 || showIndex === 1) && (
                        <div className="grid-child child2">
                           <div className="child-grid">
                              <div className="child-grid-child1">
                                 <img src={data?.images[0]} alt=" child-img" />
                              </div>
                              <div className="child-grid-child2">
                                 <img src={data?.images[1]} alt=" child-img" />
                              </div>
                              <div className="child-grid-child3">
                                 <img src={data?.images[2]} alt=" child-img" />
                              </div>
                           </div>
                        </div>
                     )}
                     {(width > 769 || showIndex === 2) && (
                        <div className="grid-child child3">
                           <img src={data?.images[3]} alt=" child-img" />
                        </div>
                     )}
                  </GridView>
                  {width > 769 && (
                     <Button onClick={show} className="show-all-btn">
                        Show All {urls.length} images
                     </Button>
                  )}
               </div>
            )}
            {layout === 'single' && (
               <div className="outter-div">
                  <img
                     className="single__image"
                     src={data?.images[0]}
                     alt="experience-img"
                  />
               </div>
            )}
            {width < 769 && layout === 'grid' && (
               <>
                  <Flex
                     container
                     alignItems="center"
                     justifyContent="center"
                     margin="8px 0"
                  >
                     <Button onClick={previous} className="cstmArrowBtn">
                        {' '}
                        <ChevronLeft
                           size={theme.sizes.h8}
                           color={theme.colors.textColor4}
                        />
                     </Button>
                     <Spacer size="24px" xAxis />
                     <Button onClick={next} className="cstmArrowBtn">
                        <ChevronRight
                           size={theme.sizes.h8}
                           color={theme.colors.textColor4}
                        />
                     </Button>
                  </Flex>
               </>
            )}
         </StyledWrapper>
         <ModalContainer isShow={isShow}>
            <Modal open={show} close={hide} urls={urls} />
         </ModalContainer>
      </>
   )
}

export default GridComp
