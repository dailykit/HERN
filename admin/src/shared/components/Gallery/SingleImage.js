import React from 'react'
import { ButtonTile, IconButton } from '@dailykit/ui'
import { WrapperDiv, EditDiv, DeleteDiv, ImgWrapper } from './styled'
import { DeleteIcon, EditIcon } from '../../assets/icons'

const SingleImage = ({ imageUrl, openTunnel, removeImage, editImage }) => {
   return (
      <>
         {imageUrl ? (
            <WrapperDiv>
               <ImgWrapper>
                  <img
                     src={imageUrl}
                     alt="Product Preview"
                     width="100%"
                     height="340px"
                     style={{ objectFit: 'contain' }}
                  />
               </ImgWrapper>
               <EditDiv>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={e => e.stopPropagation() || editImage(0, true)}
                  >
                     <EditIcon size="20" />
                  </IconButton>
               </EditDiv>

               <DeleteDiv>
                  <IconButton
                     size="sm"
                     type="solid"
                     onClick={e => e.stopPropagation() || removeImage(0)}
                  >
                     <DeleteIcon size="20" />
                  </IconButton>
               </DeleteDiv>
            </WrapperDiv>
         ) : (
            <ButtonTile
               type="uploadImage"
               size="sm"
               text="Add a Photo"
               onClick={() => openTunnel(1)}
            />
         )}
      </>
   )
}

export default SingleImage
