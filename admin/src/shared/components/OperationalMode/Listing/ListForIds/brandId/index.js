import React from 'react'
import { Select } from 'antd'

import { useSubscription } from '@apollo/react-hooks'
import { BRAND_ID } from '../../../Query'
import { useTabs } from '../../../../../providers'

const ListFunction = () => {
   const [brandId, setBrandId] = React.useState([])
   const { addTab } = useTabs()

   const { loading } = useSubscription(BRAND_ID, {
      onSubscriptionData: data => {
         setBrandId(data.subscriptionData.data.brandsAggregate.nodes)
      },
   })
   console.log('brand ID:::', brandId)
   const { Option } = Select

   return (
      <>
         <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Brand Name"
            optionFilterProp="children"
            filterOption={(input, option) =>
               option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            filterSort={(optionA, optionB) =>
               optionA.children
                  .toLowerCase()
                  .localeCompare(optionB.children.toLowerCase())
            }
            onSelect={option =>
               addTab('Brand Manager', `/operationMode/brand-${option}`)
            }
         >
            {brandId.map(eachId => {
               return <Option value={eachId.id}>{eachId.title}</Option>
            })}
         </Select>
      </>
   )
}

export default ListFunction
