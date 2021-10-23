import React from 'react'
import { Wrapper } from './styled'
import Button from '../Button'
import { useUser } from '../../Providers'

export default function SignupFold(props) {
   const { toggleAuthenticationModal } = useUser()
   const handleSignupClick = () => {
      toggleAuthenticationModal(true)
   }
   return (
      <Wrapper {...props}>
         <h1 className="signupFold_heading text1">Sign up</h1>
         <p className="signupFold_para text5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt anim id est laborum.
         </p>
         <Button
            className="signupFold_signupBtn text9"
            onClick={handleSignupClick}
         >
            Signup For Free
         </Button>
      </Wrapper>
   )
}
