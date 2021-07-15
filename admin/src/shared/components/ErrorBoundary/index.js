import React from 'react'
import * as Sentry from '@sentry/react'
import styled from 'styled-components'
import { TextButton } from '@dailykit/ui'

import Illustration from './Illustration'

class ErrorBoundary extends React.Component {
   constructor(props) {
      super(props)
      this.state = { hasError: false }
      this.reload = this.reload.bind(this)
      this.backToHome = this.backToHome.bind(this)
   }

   static getDerivedStateFromError(error) {
      return { hasError: true }
   }

   componentDidCatch(error, errorInfo) {
      console.log(error, errorInfo)
   }

   reload() {
      window.location.reload()
   }

   backToHome() {
      window.location.href = this.props.rootRoute ?? '/'
   }

   render() {
      if (this.state.hasError) {
         return (
            <Wrapper>
               <Illustration />
               <h3>{this.props.message || 'Something went wrong!'}</h3>
               <p>
                  You can write an email about it to us,{' '}
                  <a href="mailto:roshan@dailykit.org">here</a>.
               </p>
               <Actions>
                  <TextButton type="outline" onClick={this.reload}>
                     Reload
                  </TextButton>
                  <TextButton type="solid" onClick={this.backToHome}>
                     Back to Home
                  </TextButton>
               </Actions>
            </Wrapper>
         )
      }
      return this.props.children
   }
}

export default Sentry.withErrorBoundary(ErrorBoundary, {
   fallback: 'Something went wrong!',
})

const Wrapper = styled.div`
   padding: 4rem;
   height: 100%;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;

   svg {
      max-width: 500px;
      height: auto;
      margin-bottom: 1rem;
   }

   h3 {
      color: #555b6e;
      font-size: 1.4rem;
      margin-bottom: 0rem;
   }

   p {
      font-size: 0.9rem;
      color: #888d9d;
      margin-bottom: 2rem;

      a {
         text-decoration: none;
         color: #00a7e1;
      }
   }
`

const Actions = styled.div`
   max-width: 280px;
   min-width: 240px;
   display: flex;
   justify-content: space-between;
`
