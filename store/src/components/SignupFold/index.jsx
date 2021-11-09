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
         <h1 className="signupFold_heading text1_secondary">Sign up</h1>
         <p className="signupFold_para text5">
            Get access to your personal dashboard and easily manage several
            events at one time. Be the first to know about new experiences
            curated to fit your needs.
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
