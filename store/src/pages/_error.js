import { Result, Button } from 'antd'

import { ErrorIllustration } from '../assets/icons'
import { useConfig } from '../lib'
import { isClient } from '../utils'

function Error({ statusCode }) {
   console.log(`inside error component`, statusCode)
   const { configOf } = useConfig()
   const errorConfig = configOf('errorBoundaryDetails', 'errorBoundary')
   const handleReload = () => {
      if (isClient) {
         window.location.reload()
      }
   }
   return (
      <div
         style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
         }}
      >
         <Result
            icon={<ErrorIllustration />}
            title={errorConfig?.title?.value || errorConfig?.title?.default}
            subTitle={
               errorConfig?.subTitle?.value || errorConfig?.subTitle?.default
            }
            extra={
               <Button type="primary" onClick={handleReload}>
                  Reload
               </Button>
            }
         />
      </div>
   )
}

Error.getInitialProps = ({ res, err }) => {
   const statusCode = res ? res.statusCode : err ? err.statusCode : 404
   return { statusCode }
}

export default Error
