import React, { useState, useEffect } from 'react'
import {
   Tunnels,
   Tunnel,
   useTunnel,
   IconButton,
   TunnelHeader,
   Flex,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import AssetTunnel from './upload'
import useGallery from './useGallery'
import PreviewImage from './PreviewImage'
import SingleImage from './SingleImage'
import { MainWrap, ImgWrapper, Trail, EditDiv, DeleteDiv } from './styled'
import ErrorBoundary from '../ErrorBoundary'
import { DeleteIcon, EditIcon } from '../../assets/icons'

export default function ImageGallery({ list = [], isMulti = false, onChange }) {
   const { current, setActive, removeImage, addImage, images, editImage } =
      useGallery(list)
   const [tunnels, openTunnel, closeTunnel] = useTunnel()
   const [isEditMode, setIsEditMode] = useState({
      isReady: false,
      editId: null,
   })

   const tunnelImageSave = image => {
      if (isEditMode.isReady) {
         onChange(editImage(image, isEditMode.editId))
         setIsEditMode({ ...isEditMode, isReady: false })
      } else {
         onChange(addImage(image))
      }
   }

   const editHandler = (index, editMode) => {
      setIsEditMode({ isReady: editMode, editId: index })
      openTunnel(1)
   }

   const remove = index => {
      onChange(removeImage(index))
   }

   useEffect(() => {
      if (Array.isArray(list) && list.length > 1 && !isMulti) {
         console.log("List contain multiple images, Set isMulti 'true' instead")
      }
   }, [list, images, isMulti])
   return (
      <div>
         {isMulti ? (
            <MainWrap>
               {list?.length !== 0 && (
                  <ImgWrapper image={list[current]}>
                     <img
                        src={list[current]}
                        alt="Product Preview"
                        style={{ objectFit: 'contain' }}
                     />
                     <Flex>
                        <EditDiv>
                           <IconButton
                              title="Edit"
                              size="sm"
                              type="ghost"
                              onClick={() => editHandler(current, true)}
                           >
                              <EditIcon />
                           </IconButton>
                        </EditDiv>

                        <DeleteDiv>
                           <IconButton
                              title="Delete"
                              size="sm"
                              type="ghost"
                              onClick={() => remove(current)}
                           >
                              <DeleteIcon />
                           </IconButton>
                        </DeleteDiv>
                     </Flex>
                  </ImgWrapper>
               )}
               <Trail hasImage={images.length > 0}>
                  <PreviewImage
                     images={list}
                     current={current}
                     setActive={index => setActive(index)}
                     openTunnel={openTunnel}
                  />
               </Trail>
            </MainWrap>
         ) : (
            <SingleImage
               imageUrl={list[0]}
               openTunnel={openTunnel}
               removeImage={index => remove(index)}
               editImage={(index, editMode) => editHandler(index, editMode)}
            />
         )}
         <ErrorBoundary rootRoute="/">
            <Tunnels tunnels={tunnels}>
               <Tunnel layer={1}>
                  <AssetTunnel
                     onImageSave={image => tunnelImageSave(image)}
                     closeTunnel={() => closeTunnel(1)}
                  />
               </Tunnel>
            </Tunnels>
         </ErrorBoundary>
      </div>
   )
}
