import _hasIn from 'lodash/hasIn'
export const getAnimationConfig = animationConfig => {
   let isAnimationRequired = true
   let animateIn = 'animate__fadeIn'
   let animateOut = 'animate__fadeOut'
   let duration = 1
   let delay = 0
   let initiallyVisible = true
   let animateOnce = true
   let animatePreScroll = true

   if (animationConfig) {
      if (_hasIn(animationConfig, 'animation.isAnimationRequired')) {
         isAnimationRequired =
            animationConfig.animation.isAnimationRequired.value ||
            animationConfig.animation.isAnimationRequired.default
      }
      if (isAnimationRequired) {
         if (_hasIn(animationConfig, 'animation.animateIn')) {
            animateIn =
               animationConfig.animation.animateIn.value.value ||
               animationConfig.animation.animateIn.default.value
         }
         if (_hasIn(animationConfig, 'animation.animateOut')) {
            animateOut =
               animationConfig.animation.animateOut.value.value ||
               animationConfig.animation.animateOut.default.value
         }
         if (_hasIn(animationConfig, 'animation.duration')) {
            duration =
               animationConfig.animation.duration.value ||
               animationConfig.animation.duration.default
         }
         if (_hasIn(animationConfig, 'animation.delay')) {
            delay =
               animationConfig.animation.delay.value ||
               animationConfig.animation.delay.default
         }
         if (_hasIn(animationConfig, 'animation.initiallyVisible')) {
            initiallyVisible =
               animationConfig.animation.initiallyVisible.value ||
               animationConfig.animation.initiallyVisible.default
         }
         if (_hasIn(animationConfig, 'animation.animateOnce')) {
            animateOnce =
               animationConfig.animation.animateOnce.value ||
               animationConfig.animation.animateOnce.default
         }
         if (_hasIn(animationConfig, 'animation.animatePreScroll')) {
            animatePreScroll =
               animationConfig.animation.animatePreScroll.value ||
               animationConfig.animation.animatePreScroll.default
         }
      }
   }
   return {
      isAnimationRequired,
      animateIn,
      animateOut,
      duration,
      delay,
      initiallyVisible,
      animateOnce,
      animatePreScroll,
   }
}
