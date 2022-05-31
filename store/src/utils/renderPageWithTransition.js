import { CSSTransition } from 'react-transition-group'
import { getAnimationConfig } from './getAnimationConfig'

export const RenderPageWithTransition = ({ animationConfig, children }) => {
   const { isAnimationRequired, animateIn, animateOut, duration } =
      getAnimationConfig(animationConfig)
   if (!isAnimationRequired) {
      return children
   }

   const transitionClasses = {
      enter: 'animate__animated',
      enterActive: animateIn,
      appear: 'animate__animated',
      appearActive: animateIn,
      exit: 'animate__animated',
      exitActive: animateOut,
   }
   return (
      <CSSTransition
         in={true}
         appear={true}
         timeout={duration}
         classNames={transitionClasses}
         unmountOnExit
      >
         {children}
      </CSSTransition>
   )
}
