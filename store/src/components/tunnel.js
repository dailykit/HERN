import React from 'react'
import ReactDOM from 'react-dom'
import { useConfig } from '../lib'
import classNames from 'classnames'
import { isClient, useOnClickOutside } from '../utils'
import { Drawer } from 'antd'

const portalRoot = isClient ? document.getElementById('portal') : null

class Portal extends React.Component {
   constructor() {
      super()
      this.el = isClient ? document.createElement('div') : null
   }

   componentDidMount = () => {
      portalRoot.appendChild(this.el)
   }

   componentWillUnmount = () => {
      portalRoot.removeChild(this.el)
   }

   render() {
      const { children } = this.props

      if (this.el) {
         return ReactDOM.createPortal(children, this.el)
      } else {
         return null
      }
   }
}

export const Tunnel = ({
   isOpen,
   toggleTunnel,
   size = 'sm',
   children,
   direction = 'popup',
   ...props
}) => {
   const ref = React.useRef()
   useOnClickOutside(ref, () => toggleTunnel(false))
   const wrapperClasses = classNames(
      'hern-tunnel__wrapper',
      `hern-tunnel__${direction}--${size}`
   )
   if (isOpen)
      return (
         <Portal>
            <div className="hern-tunnel" {...props}>
               <div className={wrapperClasses} ref={ref}>
                  {children}
               </div>
            </div>
         </Portal>
      )
   return null
}

const Header = ({ title, children }) => {
   const { configOf } = useConfig('Visual')
   const theme = configOf('theme-color')
   return (
      <header className="hern-tunnel__header">
         <h2
            className="hern-tunnel__header__title"
            style={{
               color: theme?.accent
                  ? theme?.accent
                  : 'color: rgba(5, 150, 105, 1)',
            }}
         >
            {title}
         </h2>
         {children}
      </header>
   )
}

const Body = ({ children }) => {
   return <main className="hern-tunnel__body">{children}</main>
}

const Right = ({ title, children, visible, onClose }) => {
   return (
      <Drawer
         title={title}
         placement="right"
         width={425}
         onClose={onClose}
         visible={visible}
         className="hern-tunnel__ant"
      >
         {children}
      </Drawer>
   )
}
const Left = ({ title, children, visible, onClose }) => {
   return (
      <Drawer
         title={title}
         placement="left"
         width={425}
         onClose={onClose}
         visible={visible}
         className="hern-tunnel__ant"
      >
         {children}
      </Drawer>
   )
}

Tunnel.Header = Header
Tunnel.Body = Body
Tunnel.Right = Right
Tunnel.Left = Left
