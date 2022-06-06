import React from 'react'
import styled from 'styled-components'
import {
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
} from '@dailykit/ui'

import Images from './Images'
import Upload from './Upload'
import Misc from './Misc'
import Videos from './Videos'

export const AssetUploader = ({
   height,
   onMiscSelect = () => {},
   onAssetUpload = () => {},
   onImageSelect = () => {},
   onVideoSelect = data => {
      console.log(data)
   },
}) => {
   return (
      <Wrapper height={height}>
         <HorizontalTabs defaultIndex={0}>
            <HorizontalTabList>
               <HorizontalTab>Upload</HorizontalTab>
               <HorizontalTab>Images</HorizontalTab>
               <HorizontalTab>Videos</HorizontalTab>
               <HorizontalTab>Misc</HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel>
                  <Upload onAssetUpload={onAssetUpload} />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <Images onImageSelect={onImageSelect} />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <Videos onVideoSelect={onVideoSelect} />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <Misc onMiscSelect={onMiscSelect} />
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>
      </Wrapper>
   )
}

const Wrapper = styled.div`
   [data-reach-tab-list] {
      height: 40px !important;
      padding: 0 14px !important;
      [data-reach-tab] {
         height: inherit !important;
      }
   }
   [data-reach-tab-panel] {
      overflow-y: auto;
      padding: 14px !important;
      height: ${props => props.height || 'calc(100vh - 145px)'} !important;
   }
`
