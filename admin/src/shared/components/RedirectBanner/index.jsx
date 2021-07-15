import React from 'react'
import styled from 'styled-components'
import { TextButton } from '@dailykit/ui'

export const RedirectBanner = () => {
   const takeMe = () => {
      window.open(
         new URL(window._env_.REACT_APP_DATA_HUB_URI).origin + '/desktop'
      )
   }
   return (
      <Styles.Wrapper>
         <Styles.Para>
            We're having difficulties with current browser, please switch to
            latest version of chrome or use the stable version.
         </Styles.Para>
         <TextButton type="outline" onClick={takeMe}>
            Take me there
         </TextButton>
      </Styles.Wrapper>
   )
}

const Styles = {
   Wrapper: styled.section`
      left: 0;
      right: 0;
      bottom: 0;
      color: #fff;
      height: 120px;
      display: flex;
      padding: 0 24px;
      z-index: 999999;
      position: absolute;
      align-items: center;
      justify-content: space-between;
      background: rgb(34, 38, 50);
   `,
   Para: styled.p`
      width: 50%;
   `,
}
