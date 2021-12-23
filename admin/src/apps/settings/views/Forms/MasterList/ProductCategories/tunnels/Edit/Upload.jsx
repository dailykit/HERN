import React from 'react'
import styled from 'styled-components'
import { IconButton, Spacer, Text } from '@dailykit/ui'
import useAssets from '../../../../../../../../shared/components/AssetUploader/useAssets'


const Upload = ({inputRef, files, setFiles, clearSelected, Key, assetRemove}) => {
   const [uploading, setUploading] = React.useState(false)

   const handleChange = e => {
      const nodes = Array.from(e.target.files).map(file => file)
      if (!Array.isArray(nodes) && nodes.length === 0) return

      const files = nodes.map(file => ({
         raw: file,
         preview: URL.createObjectURL(file),
      }))
      setFiles([...files])
      assetRemove(Key)
   }

   const removeSelection = index => {
      setFiles(existing => [...existing.filter((_, i) => i !== index)])
   }

   return (
      <div>
         <FileInput
            type="file"
            name="file"
            ref={inputRef}
            onChange={handleChange}
         />

         <Spacer size="24px" />
         {!uploading && (
            <>
               <Text as="title">Selected Image</Text>
               <Spacer size="8px" />
               {files.length > 0 ? (
                  <StyledImages>
                     {files.map((file, index) => {
                        if (!file.preview) return <StyledListItem><StyledImagePreview src={file} /><span>
                        <IconButton
                           size="sm"
                           type="solid"
                           onClick={e => {
                              assetRemove(Key)
                              removeSelection(index)
                              clearSelected()
                           }}
                        >
                           <Trash />
                        </IconButton>
                     </span></StyledListItem>

                        return (
                           <StyledImage key={index}>
                              {file.raw.type && (
                                 <StyledThumb
                                    src={file.preview}
                                    alt={file.raw.name}
                                 />
                              )}
                              <span>
                                 <IconButton
                                    size="sm"
                                    type="solid"
                                    onClick={() => {
                                       removeSelection(index)
                                       clearSelected()
                                    }}
                                 >
                                    <Trash />
                                 </IconButton>
                              </span>
                              <Spacer size="4px" />
                              <Text as="p">{file.raw.name}</Text>
                           </StyledImage>
                        )
                     })}
                  </StyledImages>
               ) : (
                  <span>No image selected!</span>
               )}
            </>
         )}
      </div>
   )
}

const StyledImages = styled.ul`
   display: grid;
   grid-gap: 24px;
   grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
`

const StyledImage = styled.li`
   width: 120px;
   list-style: none;
   position: relative;
   span {
      position: absolute;
      top: 6px;
      right: 6px;
   }
`
const StyledImagePreview = styled.img`
   width: 100%;
   height: 100%;
   object-fit: contain;
`
const StyledListItem = styled.li`
   position: relative;
   ${({ isHidden }) => isHidden && `display:none;`}
   span {
      top: 6px;
      right: 6px;
      display: none;
      position: absolute;
   }
   :hover span {
      display: block;
   }
`
const FileInput = styled.input`
   width: 100%;
   padding: 12px;
   border-radius: 2px;
   border: 1px solid #e3e3e3;
`

const StyledThumb = styled.img`
   height: 120px;
   width: 120px;
   object-fit: cover;
   border-radius: 8px;
   border: 1px solid #e3e3e3;
`

const Trash = ({ size = 18, color = '#ffffff' }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
   >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
   </svg>
)

export default Upload
