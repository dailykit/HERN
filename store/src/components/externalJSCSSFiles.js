import React from 'react'
import Head from 'next/head'

const ExternalJSCSSFiles = ({ externalFiles }) => {
   const cssFiles = externalFiles.filter(file => file.type === 'css')
   const jsFiles = externalFiles.filter(file => file.type === 'js')
   return (
      <Head>
         {cssFiles.map(file => (
            <link
               id={file.id}
               rel="stylesheet"
               href={file.path}
               type="text/css"
               media="screen"
               data-stylesheet-scope={file.fileScope}
               data-stylesheet-id={file.fileId}
               data-stylesheet-position={file.position}
               data-stylesheet-link-id={file.id}
            />
         ))}
         {jsFiles.map(file => (
            <script
               type="text/javascript"
               key={file.id}
               src={file.path}
               defer
               data-stylesheet-scope={file.fileScope}
               data-stylesheet-id={file.fileId}
               data-stylesheet-position={file.position}
               data-stylesheet-link-id={file.id}
            ></script>
         ))}
      </Head>
   )
}

export { ExternalJSCSSFiles }
