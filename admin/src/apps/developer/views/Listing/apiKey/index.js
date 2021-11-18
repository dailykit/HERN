import React from 'react'
import { Wrapper } from './styled'
import { ApiKeyProvider } from './state'
import ApiKeyListing from './apiKeyList'
import ApiKeyDetails from './apiKeyDetails'

export const ApiKey = () => {
 
    return (
       <ApiKeyProvider>
          <Wrapper>
             <div>
                <ApiKeyListing />
                <ApiKeyDetails />
             </div>
          </Wrapper>
       </ApiKeyProvider>
    )
 }