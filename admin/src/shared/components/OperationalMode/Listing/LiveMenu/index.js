import { useSubscription } from '@apollo/react-hooks'
import React, { useRef, useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { COLLECTION_PRODUCTS, PRODUCT_PRICE_BRAND_LOCATION } from '../../Query'
import { Text, Spacer, Dropdown } from '@dailykit/ui'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { StyledGroupBy } from './styled'

const LiveMenu = () => {
   const [CollectionProducts, setCollectionProducts] = React.useState([])
   const { id } = useParams()
   const tableRef = useRef(null)

   const { loading } = useSubscription(COLLECTION_PRODUCTS, {
      variables: { brandId: parseInt(id) },
      onSubscriptionData: data => {
         const result = data.subscriptionData.data.products.map(product => {
            return {
               id: product.id,
               name: product.name,
               price: product.price,
               category:
                  product?.collection_categories[0]?.collection_productCategory
                     ?.productCategoryName || 'Not in Menu',
               specificPrice:
                  product?.productPrice_brand_locations[0]?.specificPrice ||
                  'Not set',
               specificDiscount:
                  product?.productPrice_brand_locations[0]?.specificDiscount ||
                  'Not set',
               isPublished:
                  product?.productPrice_brand_locations[0]?.isPublished ||
                  'Not set',
               isAvailable:
                  product?.productPrice_brand_locations[0]?.isAvailable ||
                  false,
               brandLocationId:
                  product?.productPrice_brand_locations[0]?.id || 'Not set',
            }
         })
         setCollectionProducts(result)
      },
      // onSubscriptionData: data => {
      //    setCollectionProducts(data.subscriptionData.data.products)
      // },
   })
   console.log('products', CollectionProducts)
   const groupByOptions = [{ id: 1, title: 'Category', payLoad: 'category' }]
   const columns = [
      {
         title: 'Id',
         field: 'id',
      },

      {
         title: 'Product Name',
         field: 'name',
      },

      {
         title: 'Price',
         field: 'price',
      },
   ]
   const tableLoaded = () => {
      const productGroup = localStorage.getItem(
         'tabulator-brand_manager_product_table-group'
      )
      const productGroupParse =
         productGroup !== undefined &&
         productGroup !== null &&
         productGroup.length !== 0
            ? JSON.parse(productGroup)
            : null
      tableRef.current.table.setGroupBy(
         !!productGroupParse && productGroupParse.length > 0
            ? productGroupParse
            : 'category'
      )
      tableRef.current.table.setGroupHeader(function (
         value,
         count,
         data1,
         group
      ) {
         let newHeader
         switch (group._group.field) {
            case 'category':
               newHeader = 'Category'
               break

            default:
               break
         }
         return `${newHeader} - ${value} || ${count} Products `
      })
   }
   const options = {
      cellVertAlign: 'middle',
      autoResize: true,
      maxHeight: 350,
      virtualDomBuffer: 20,
      placeholder: 'No Data Available',
      index: 'id',
      persistence: true,
      persistenceMode: 'local',
      selectablePersistence: true,
      persistence: {
         group: false,
         sort: true, //persist column sorting
         filter: true, //persist filter sorting
         page: true, //persist page
         columns: true, //persist columns
      },
      layout: 'fitDataStretch',
      resizableColumns: true,
      movableColumns: true,
      tooltips: true,
      downloadDataFormatter: data => data,
      downloadReady: (fileContents, blob) => blob,
   }
   return (
      <>
         <StyledGroupBy>
            <Text as="text1">Group By:</Text>
            <Spacer size="5px" xAxis />
            <Dropdown
               type="multi"
               variant="revamp"
               disabled={true}
               options={groupByOptions}
               searchedOption={() => {}}
               selectedOption={value => {
                  localStorage.setItem(
                     'tabulator-brand_manager_product_table-group',
                     JSON.stringify(value.map(x => x.payLoad))
                  )
                  tableRef.current.table.setGroupBy(value.map(x => x.payLoad))
               }}
               typeName="groupBy"
            />
         </StyledGroupBy>
         <ReactTabulator
            columns={columns}
            dataLoaded={tableLoaded}
            data={CollectionProducts}
            ref={tableRef}
         />
      </>
   )
}

export default LiveMenu
