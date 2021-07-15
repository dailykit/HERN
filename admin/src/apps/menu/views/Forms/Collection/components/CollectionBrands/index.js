import React from 'react'
import { Text, Form } from '@dailykit/ui'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   BRAND_COLLECTIONS,
   UPSERT_BRAND_COLLECTION,
} from '../../../../../graphql'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { toast } from 'react-toastify'
import { Flex } from '../../../../../../../shared/components/BasicInfo/styled'
import { InlineLoader, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'

const CollectionBrands = ({ state }) => {
   const tableRef = React.useRef()

   const {
      error,
      loading,
      data: { brandCollections = [] } = {},
   } = useSubscription(BRAND_COLLECTIONS)

   const [upsertBrandCollection] = useMutation(UPSERT_BRAND_COLLECTION, {
      onCompleted: data => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const columns = [
      {
         title: 'Title',
         field: 'title',
         headerFilter: true,
         headerSort: false,
      },
      {
         title: 'Domain',
         field: 'domain',
         headerFilter: true,
      },
      {
         title: 'Collection Available',
         formatter: reactFormatter(
            <ToggleCollection
               collectionId={state.id}
               onChange={object =>
                  upsertBrandCollection({ variables: { object } })
               }
            />
         ),
         width: 200,
      },
   ]

   const options = {
      cellVertAlign: 'middle',
      layout: 'fitColumns',
      autoResize: true,
      maxHeight: 420,
      resizableColumns: false,
      virtualDomBuffer: 80,
      placeholder: 'No Data Available',
      persistence: true,
      persistenceMode: 'cookie',
      pagination: 'local',
      paginationSize: 10,
   }

   if (loading) return <InlineLoader />

   return (
      <>
         <Text as="h2">
            <Flex container alignItems="center" justifyContent="flex-start">
               Brands
               <Tooltip identifier="collection_brands" />
            </Flex>
         </Text>
         {!loading && error ? (
            <Text as="p">Could not fetch brands!</Text>
         ) : (
            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={brandCollections}
               options={options}
            />
         )}
      </>
   )
}

export default CollectionBrands

const ToggleCollection = ({ cell, collectionId, onChange }) => {
   const brand = React.useRef(cell.getData())
   const [active, setActive] = React.useState(false)

   const toggleHandler = () => {
      onChange({
         collectionId,
         brandId: brand.current.id,
         isActive: !active,
      })
   }

   React.useEffect(() => {
      const isActive = brand.current.collections.some(
         collection =>
            collection.collectionId === collectionId && collection.isActive
      )
      setActive(isActive)
   }, [brand.current])

   return (
      <Form.Group>
         <Form.Toggle
            name={`available-${brand.current.id}`}
            onChange={toggleHandler}
            value={active}
         ></Form.Toggle>
      </Form.Group>
   )
}
