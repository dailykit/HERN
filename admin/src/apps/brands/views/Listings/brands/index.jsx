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
   TextButton,
} from '@dailykit/ui'
import { BRANDS } from '../../../graphql'
import tableOptions from '../../../tableOption'
import { get_env, logger } from '../../../../../shared/utils'
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
import moment from 'moment'
import '../../../tableStyle.css'
import axios from 'axios'

export const Brands = () => {
   const { tooltip } = useTooltip()
   const tableRef = React.useRef()
   const { tab, addTab } = useTabs()
   const { loading } = useMutation(BRANDS.CREATE_BRAND)
   const isClient =
      typeof window !== 'undefined' && window.document ? true : false
   const REVALIDATE_TOKEN = get_env('REVALIDATE_TOKEN')
   const NODE_ENV = get_env('NODE_ENV')
   const [isRevalidating, setIsRevalidation] = React.useState(false)

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

   // revalidate api
   const revalidateHandler = async brand => {
      setIsRevalidation(true)
      try {
         console.log('brand', brand)
         const origin = `https://${brand.domain}`

         const response = await axios({
            method: 'POST',
            url: `${origin}/api/revalidate`,
            headers: {
               'Content-Type': 'application/json',
               'revalidate-token': REVALIDATE_TOKEN,
            },
         })
         if (!response.status === 200) {
            toast.error('Something went wrong while publishing!')
            setIsRevalidation(false)
         }
         toast.success(`Successfully published new version for ${brand.title}`)
         setIsRevalidation(false)
      } catch (error) {
         toast.error('Something went wrong while publishing!')
         setIsRevalidation(false)
         throw new Error(error)
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
      {
         title: 'Created At',
         field: 'created_at',
         headerFilter: true,
         formatter: reactFormatter(<DateFormatter />),
      },

      {
         title: 'Publish Version',
         hozAlign: 'center',
         headerSort: false,
         frozen: true,
         headerHozAlign: 'center',
         formatter: reactFormatter(
            <Revalidate
               handler={revalidateHandler}
               isRevalidating={isRevalidating}
            />
         ),
         headerTooltip: function (column) {
            const identifier = 'brands_listing_publish_version_column'
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
                  className="brands-table"
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
   // if (cell.getData().isDefault) return null
   return (
      <IconButton type="ghost" size="sm" onClick={onClick}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}
const Revalidate = ({ cell, handler, isRevalidating = false }) => {
   const brand = cell._cell.row.data
   const onClick = () => {
      if (
         window.confirm(
            `Are you sure you want to Publish New Version on this Brand - ${brand.title}?`
         )
      ) {
         handler(brand)
      }
   }
   return (
      <TextButton
         isLoading={isRevalidating}
         type="solid"
         onClick={onClick}
         size="sm"
      >
         {isRevalidating ? 'Publishing...' : 'Publish New Version'}
      </TextButton>
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
                  title="Click to view this brand"
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
               <span title={data.isPublished ? 'Published' : 'Unpublished'}>
                  {data.isPublished ? <PublishIcon /> : <UnPublishIcon />}
               </span>
            </Flex>
         </Flex>
      </>
   )
}

const DateFormatter = ({ cell }) => {
   const data = cell.getData()
   return (
      <>
         <Text as="text1">
            {moment(data.created_at).format('DD-MM-YYYY hh:mm A')}
         </Text>
      </>
   )
}
