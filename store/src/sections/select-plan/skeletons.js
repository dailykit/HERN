import React from 'react'

export const SkeletonPlan = () => {
   return (
      <li className="hern-select-plan__skeletons">
         <header className="hern-select-plan__skeletons__header" />
         <main className="hern-select-plan__skeletons__main">
            <section className="hern-select-plan__skeletons__main__section" />
            <section className="hern-select-plan__skeletons__main__section" />
         </main>
         <footer className="hern-select-plan__skeletons__footer">
            <span className="hern-select-plan__skeletons__footer__span" />
         </footer>
      </li>
   )
}
