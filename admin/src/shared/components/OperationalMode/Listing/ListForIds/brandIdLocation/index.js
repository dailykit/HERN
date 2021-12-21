import React from 'react'
import { Select } from 'antd'
import { BRAND_ID, BRANDS_LOCATION_ID } from '../../../Query'
import { useSubscription } from '@apollo/react-hooks'
import { useTabs } from '../../../../../providers'
import { Spacer } from '@dailykit/ui'
import { useHistory } from 'react-router-dom'

const BrandLocationId = () => {
   const [brandLocationId, setBrandLocationId] = React.useState([])
   const [brandId, setBrandId] = React.useState([])
   const { addTab } = useTabs()
   const [secondOption, setSecondOption] = React.useState(null)
   const history = useHistory()

   const { loadingBrand } = useSubscription(BRAND_ID, {
      onSubscriptionData: data => {
         setBrandId(data.subscriptionData.data.brandsAggregate.nodes)
      },
   })
   const { loading } = useSubscription(BRANDS_LOCATION_ID, {
      variables: {
         where: {
            id: {
               _eq: secondOption,
            },
         },
      },
      onSubscriptionData: data => {
         setBrandLocationId(
            data.subscriptionData.data.brandsAggregate.nodes[0].brand_locations
         )
      },
   })
   // console.log('brand ID:::', brandId)
   // console.log('brand Location', brandLocationId)

   const { Option } = Select

   // console.log('second optiomn', secondOption)
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
            onSelect={option => {
               setSecondOption(option)
            }}
         >
            {brandId.map(eachId => {
               return <Option value={eachId.id}>{eachId.title}</Option>
            })}
         </Select>
         <Spacer xaxis size="20px" />
         <Select
            showSearch
            style={{ width: 200 }}
            placeholder="Select Brand Location Id"
            onSelect={option => {
               history.push({
                  pathname: `/operationMode/brandLocation-${option}`,
                  state: [{ brandId: secondOption }],
               })
            }}
         >
            {brandLocationId.map(eachId => {
               return <Option value={eachId.id}>{eachId.title}</Option>
            })}
         </Select>
      </>
   )
}

export default BrandLocationId
