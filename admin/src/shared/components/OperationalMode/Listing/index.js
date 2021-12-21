import React from 'react'

import { Collapse } from 'antd'
import { CaretRightOutlined } from '@ant-design/icons'
import ListFunction from './ListForIds/brandId'
import BrandLocationId from './ListForIds/brandIdLocation'

const ManagerLevel = () => {
   const { Panel } = Collapse

   const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`

   return (
      <div>
         <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => (
               <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            className="site-collapse-custom-collapse"
         >
            <Panel
               header="Brand Manager"
               key="1"
               className="site-collapse-custom-panel"
            >
               <ListFunction />
            </Panel>
            <Panel
               header="Brand Location Manager"
               key="2"
               className="site-collapse-custom-panel"
            >
               <BrandLocationId />
            </Panel>
         </Collapse>
      </div>
   )
}

export default ManagerLevel
