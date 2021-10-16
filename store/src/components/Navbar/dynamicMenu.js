import React from 'react'
import { Menu } from 'antd'

export default function DynamicMenu({ menuItems }) {
   return (
      <>
         {menuItems.map(menuItem => {
            return <Menu.Item key={menuItem?.url}>{menuItem?.label}</Menu.Item>
         })}
      </>
   )
}
