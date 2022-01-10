import React from 'react'
import { Flex, Spacer } from '@dailykit/ui'
import { Popup } from '../../../../shared/components'
import {
   Javascript,
   Html,
   Css,
   Pug,
   Ejs,
   Json,
   Liquid,
   FileIcon,
   CloseIcon,
   XML,
} from '../../assets/Icons'
import { useGlobalContext } from '../../context'
import { Card, Cross, FileTypeWrapper } from './style'

export default function FileType({ show, closePopup, setFileType }) {
   return (
      <Popup show={show}>
         <Flex container alignItems="start" justifyContent="space-between">
            <Popup.Text>Select the file type</Popup.Text>
            <Cross onClick={closePopup}>{CloseIcon}</Cross>
         </Flex>
         <FileTypeWrapper>
            <Card onClick={() => setFileType('js')}>
               <Javascript />
               <p>Javascript</p>
            </Card>
            <Card onClick={() => setFileType('html')}>
               <Html />
               <p>Html</p>
            </Card>
            <Card onClick={() => setFileType('css')}>
               <Css />
               <p>Css</p>
            </Card>
            <Card onClick={() => setFileType('pug')}>
               <Pug />
               <p>Pug</p>
            </Card>
            <Card onClick={() => setFileType('json')}>
               <Json size="64" />
               <p>Json</p>
            </Card>
            <Card onClick={() => setFileType('ejs')}>
               <Ejs size="64" />
               <p>Ejs</p>
            </Card>
            <Card onClick={() => setFileType('liquid')}>
               <Liquid size="64" />
               <p>Liquid</p>
            </Card>
            <Card onClick={() => setFileType('xml')}>
               <XML />
               <p>XML</p>
            </Card>
         </FileTypeWrapper>
      </Popup>
   )
}
