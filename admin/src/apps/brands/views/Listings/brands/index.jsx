import React from 'react'
import { toast } from 'react-toastify'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import {
   Text,
   PlusIcon,
   ComboButton,
   IconButton,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import { BRANDS } from '../../../graphql'
import tableOptions from '../../../tableOption'
import { logger } from '../../../../../shared/utils'
import { StyledWrapper, StyledHeader } from '../styled'
import { DeleteIcon } from '../../../../../shared/assets/icons'
import {
   InlineLoader,
   Flex,
   Tooltip,
   Banner,
} from '../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import CreateBrand from '../../../../../shared/CreateUtils/Brand/CreateBrand'
import { PublishIcon, UnPublishIcon } from '../../../assets/icons'

export const Brands = () => {
   const { tooltip } = useTooltip()
   const tableRef = React.useRef()
   const { tab, addTab } = useTabs()
   const { loading } = useMutation(BRANDS.CREATE_BRAND)


   const [deleteBrand] = useMutation(BRANDS.UPDATE_BRAND, {
      onCompleted: () => {
         toast.success('Brand deleted!')
      },
      onError: error => {
         console.log(error)
         toast.error('Could not delete!')
      },
   })

   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const {
      error,
      loading: listLoading,
      data: { brands = {} } = {},
   } = useSubscription(BRANDS.LIST)

   React.useEffect(() => {
      if (!tab) {
         addTab('Brands', '/brands/brands')
      }
   }, [tab, addTab])

   const cellClick = brand => {
      addTab(
         brand?.title || brand?.domain || 'N/A',
         `/brands/brands/${brand.id}`
      )
   }

   // Handler
   const deleteHandler = brand => {
      if (
         window.confirm(
            `Are you sure you want to delete Brand - ${brand.title}?`
         )
      ) {
         deleteBrand({
            variables: {
               id: brand.id,
               _set: { isArchived: true },
            },
         })
      }
   }

   const columns = React.useMemo(() => [
      {
         title: 'Brand',
         field: 'title',
         frozen: true,
         headerSort: true,
         headerFilter: true,
         formatter: reactFormatter(<BrandName />),
         headerTooltip: function (column) {
            const identifier = 'brands_listing_brand_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         cssClass: 'rowClick',
         cellClick: (e, cell) => {
            cellClick(cell.getData())
         },
         width: 400,
         resizable: 'true',
         minWidth: 100,
         maxWidth: 500,
      },
      {
         title: 'Actions',
         hozAlign: 'center',
         headerSort: false,
         frozen: true,
         width: 80,
         headerHozAlign: 'center',
         formatter: reactFormatter(
            <DeleteBrand deleteHandler={deleteHandler} />
         ),
         headerTooltip: function (column) {
            const identifier = 'brands_listing_actions_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Domain',
         field: 'domain',
         headerSort: true,
         headerFilter: true,
         formatter: cell => cell.getData().domain || 'N/A',
         headerTooltip: function (column) {
            const identifier = 'brands_listing_domain_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ])

   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }
   if (listLoading) return <InlineLoader />
   return (
      <StyledWrapper>
         <Banner id="brands-app-brands-listing-top" />
         <StyledHeader>
            <Flex container alignItems="center">
               <Text as="h2" style={{ marginBottom: '0px' }}>
                  Brands ({brands?.aggregate?.count || 0})
               </Text>
               <Tooltip identifier="brands_listing_heading" />
            </Flex>

            <ComboButton type="solid" onClick={() => openTunnel(1)}>
               <PlusIcon color="white" />
               Create Brand
            </ComboButton>
         </StyledHeader>
         {loading ? (
            <InlineLoader />
         ) : (
            <>
               <ReactTabulator
                  ref={tableRef}
                  columns={columns}
                  data={brands?.nodes || []}
                  options={{
                     ...tableOptions,
                     placeholder: 'No Brands Available Yet !',
                  }}
               />
            </>
         )}
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1} size="md">
               <CreateBrand closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Banner id="brands-app-brands-listing-bottom" />
      </StyledWrapper>
   )
}

const DeleteBrand = ({ cell, deleteHandler }) => {
   const onClick = () => deleteHandler(cell._cell.row.data)
   if (cell.getData().isDefault) return null
   return (
      <IconButton type="ghost" size="sm" onClick={onClick}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}
function BrandName({ cell, addTab }) {
   const data = cell.getData()
   return (
      <>
         <Flex
            container
            width="100%"
            justifyContent="space-between"
            alignItems="center"
         >
            <Flex
               container
               width="100%"
               justifyContent="flex-end"
               alignItems="center"
            >
               <p
                  style={{
                     width: '230px',
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                     marginBottom: '0px',
                  }}
               >
                  {cell._cell.value}
               </p>
            </Flex>

            <Flex
               container
               width="100%"
               justifyContent="flex-end"
               alignItems="center"
            >
               <IconButton type="ghost">
                  {data.isPublished ? <PublishIcon /> : <UnPublishIcon />}
               </IconButton>
            </Flex>
         </Flex>
      </>
   )
}
