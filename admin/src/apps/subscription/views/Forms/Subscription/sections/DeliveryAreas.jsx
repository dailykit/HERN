import React from 'react'
import { isEmpty } from 'lodash'
import styled from 'styled-components'
import { toast } from 'react-toastify'
import { reactFormatter, ReactTabulator } from '@dailykit/react-tabulator'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import {
   Form,
   Flex,
   Text,
   Tunnel,
   Tunnels,
   Spacer,
   PlusIcon,
   useTunnel,
   ButtonTile,
   IconButton,
   TunnelHeader,
} from '@dailykit/ui'

import PickUpTunnel from './PickUp'
import tableOptions from '../../../../tableOption'
import { useTooltip } from '../../../../../../shared/providers'
import { DeleteIcon } from '../../../../../../shared/assets/icons'
import { logger, parseAddress } from '../../../../../../shared/utils'
import {
   Tooltip,
   ErrorState,
   InlineLoader,
   Banner,
} from '../../../../../../shared/components'
import {
   ZIPCODE,
   SUBSCRIPTION_ZIPCODES,
   INSERT_SUBSCRIPTION_ZIPCODES,
   UPDATE_SUBSCRIPTION_ZIPCODE,
} from '../../../../graphql'

const DeliveryAreas = ({ id, setAreasTotal }) => {
   const tableRef = React.useRef()
   const { tooltip } = useTooltip()
   const [mode, setMode] = React.useState('ADD')
   const [selectedZipcode, setSelectedZipcode] = React.useState({})
   const [tunnels, openTunnel, closeTunnel] = useTunnel()
   const [remove] = useMutation(ZIPCODE.DELETE, {
      onCompleted: () => {
         toast.success('Successfully deleted the zipcode!')
      },
      onError: error => {
         toast.success('Failed to delete the zipcode!')
         logger(error)
      },
   })
   const {
      error,
      loading,
      data: { subscription_zipcodes: subscriptionZipcodes = [] } = {},
   } = useSubscription(SUBSCRIPTION_ZIPCODES, {
      variables: { id },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         setAreasTotal(data.subscription_zipcodes.length)
      },
   })

   const rowClick = (e, cell) => {
      setMode('EDIT')
      setSelectedZipcode(cell?.getData())
      openTunnel(1)
   }

   const columns = React.useMemo(
      () => [
         {
            title: 'Zipcode',
            field: 'zipcode',
            headerFilter: true,
            cssClass: 'cell',
            cellClick: (e, cell) => rowClick(e, cell),
            headerFilterPlaceholder: 'Search zipcodes...',
            headerTooltip: column => {
               const identifier = 'listing_delivery_areas_column_fulfillment'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            field: 'deliveryPrice',
            title: 'Delivery Price',
            headerFilter: true,
            headerFilterPlaceholder: 'Search prices...',
            headerTooltip: column => {
               const identifier = 'listing_delivery_areas_column_zipcode'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            field: 'isDeliveryActive',
            title: 'Delivery',
            formatter: 'tickCross',
            headerTooltip: column => {
               const identifier =
                  'listing_delivery_areas_column_delivery_active'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Delivery Time',
            headerFilter: true,
            headerTooltip: column => {
               const identifier = 'listing_delivery_time_column_delivery_time'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            formatter: cell =>
               `${cell.getData().deliveryTime.from} - ${
                  cell.getData().deliveryTime.to
               }`,
         },
         {
            field: 'isPickupActive',
            title: 'Pick Up',
            formatter: 'tickCross',
            headerTooltip: column => {
               const identifier = 'listing_delivery_areas_column_pickup_active'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            title: 'Pick Up Time',
            headerFilter: true,
            headerTooltip: column => {
               const identifier = 'listing_delivery_time_column_pickup_time'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
            formatter: cell =>
               cell.getData().subscriptionPickupOptionId
                  ? `${cell.getData().subscriptionPickupOption?.time?.from} - ${
                       cell.getData().subscriptionPickupOption?.time?.to
                    }`
                  : 'N/A',
         },
         {
            field: 'isActive',
            title: 'Active',
            formatter: 'tickCross',
            headerTooltip: column => {
               const identifier = 'listing_delivery_areas_column_active'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            field: 'isDemo',
            title: 'Demo',
            formatter: 'tickCross',
            headerTooltip: column => {
               const identifier = 'listing_delivery_areas_column_isDemo'
               return (
                  tooltip(identifier)?.description ||
                  column.getDefinition().title
               )
            },
         },
         {
            width: 150,
            title: 'Actions',
            headerFilter: false,
            headerSort: false,
            hozAlign: 'center',
            cssClass: 'center-text',
            formatter: reactFormatter(<Delete remove={remove} />),
         },
      ],
      []
   )

   const resetEditMode = () => {
      setMode('ADD')
      setSelectedZipcode({})
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Failed to fetch the list of delivery areas!')
      logger(error)
      return (
         <ErrorState message="Failed to fetch the list of delivery areas!" />
      )
   }
   return (
      <>
         <Flex
            height="48px"
            container
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container alignItems="center">
               <Text as="h3">Delivery Areas</Text>
               <Tooltip identifier="form_subscription_section_delivery_day_section_delivery_areas" />
            </Flex>
            <IconButton
               size="sm"
               type="outline"
               onClick={() => {
                  resetEditMode()
                  openTunnel(1)
               }}
            >
               <PlusIcon />
            </IconButton>
         </Flex>
         <Spacer size="16px" />
         <ReactTabulator
            ref={tableRef}
            columns={columns}
            data={subscriptionZipcodes}
            options={{
               ...tableOptions,
               layout: 'fitColumns',
               pagination: 'local',
               paginationSize: 10,
            }}
         />
         <Tunnels tunnels={tunnels}>
            <Tunnel layer="1">
               <AreasTunnel
                  id={id}
                  mode={mode}
                  resetEditMode={resetEditMode}
                  closeTunnel={closeTunnel}
                  data={selectedZipcode}
                  setData={setSelectedZipcode}
               />
            </Tunnel>
         </Tunnels>
      </>
   )
}

export default DeliveryAreas

const AreasTunnel = ({
   id,
   mode = 'ADD',
   resetEditMode,
   data,
   closeTunnel,
}) => {
   const [pickupOption, setPickupOption] = React.useState(null)
   const [isPickupActive, setIsPickupActive] = React.useState(false)
   const [delivery, setDelivery] = React.useState({
      price: '',
      from: '',
      to: '',
      isActive: true,
   })
   const [zipcodes, setZipcodes] = React.useState('')
   const [tunnels, openOptionTunnel, closeOptionTunnel] = useTunnel(1)
   const [insertSubscriptionZipcodes, { loading: creating }] = useMutation(
      INSERT_SUBSCRIPTION_ZIPCODES,
      {
         onCompleted: () => {
            resetEditMode()
            closeTunnel(1)
            toast.success('Successfully created the delivery areas!')
         },
         onError: error => {
            logger(error)
            toast.success('Failed to create the delivery areas!')
         },
      }
   )
   const [updateSubscriptionZipcode, { loading: updating }] = useMutation(
      UPDATE_SUBSCRIPTION_ZIPCODE,
      {
         onCompleted: () => {
            resetEditMode()
            closeTunnel(1)
            toast.success('Successfully updated the delivery area!')
         },
         onError: error => {
            logger(error)
            toast.success('Failed to update the delivery area!')
         },
      }
   )

   React.useEffect(() => {
      if (mode === 'EDIT' && !isEmpty(data)) {
         setZipcodes(data?.zipcode)
         setDelivery({
            price: data?.deliveryPrice,
            from: data?.deliveryTime?.from,
            to: data?.deliveryTime?.to,
            isActive: data?.isDeliveryActive,
         })
         setPickupOption(data?.subscriptionPickupOption)
         setIsPickupActive(data?.isPickupActive)
      }
   }, [mode, data])

   const onDeliveryChange = (key, value) => {
      setDelivery(existing => ({
         ...existing,
         [key]: value,
      }))
   }

   const save = () => {
      if (mode === 'ADD') {
         const zips = zipcodes.split(',').map(node => node.trim())
         const objects = zips.map(zip => ({
            zipcode: zip,
            subscriptionId: id,
            isDeliveryActive: delivery.isActive,
            deliveryPrice: Number(delivery.price),
            deliveryTime: { from: delivery.from, to: delivery.to },
            isPickupActive: pickupOption?.id ? isPickupActive : false,
            subscriptionPickupOptionId: pickupOption?.id || null,
         }))
         insertSubscriptionZipcodes({
            variables: {
               objects,
            },
         })
      } else {
         updateSubscriptionZipcode({
            variables: {
               pk_columns: {
                  zipcode: data.zipcode,
                  subscriptionId: id,
               },
               _set: {
                  zipcode: zipcodes,
                  isDeliveryActive: delivery.isActive,
                  deliveryPrice: Number(delivery.price),
                  deliveryTime: { from: delivery.from, to: delivery.to },
                  isPickupActive: pickupOption?.id ? isPickupActive : false,
                  subscriptionPickupOptionId: pickupOption?.id || null,
               },
            },
         })
      }
   }

   return (
      <>
         <TunnelHeader
            title={mode === 'ADD' ? 'Add Zipcodes' : 'Edit Zipcode'}
            close={() => closeTunnel(1)}
            right={{
               title: 'Save',
               isLoading: creating || updating,
               action: () => save(),
            }}
            tooltip={
               <Tooltip identifier="form_subscription_tunnel_zipcode_heading" />
            }
         />
         <Banner id="subscription-app-create-subscription-form-add-zipcode-tunnel-top" />
         <Flex padding="16px">
            <Form.Group>
               <Form.Label htmlFor="zipcodes" title="zipcodes">
                  <Flex container alignItems="center">
                     {mode === 'ADD' ? 'Zipcodes*' : 'Zipcode'}
                     <Tooltip identifier="form_subscription_tunnel_zipcode_field_zipcode" />
                  </Flex>
               </Form.Label>
               {mode === 'ADD' ? (
                  <Form.TextArea
                     id="zipcodes"
                     name="zipcodes"
                     value={zipcodes}
                     placeholder="Enter the zipcodes"
                     onChange={e => setZipcodes(e.target.value)}
                  />
               ) : (
                  <Form.Text
                     id="zipcode"
                     name="zipcode"
                     value={zipcodes}
                     placeholder="Enter the zipcode"
                     onChange={e => setZipcodes(e.target.value)}
                  />
               )}
            </Form.Group>
            {mode === 'ADD' && (
               <Form.Hint>Enter comma seperated zipcodes.</Form.Hint>
            )}
            <Spacer size="24px" />
            <Text as="h3">Delivery</Text>
            <Spacer size="18px" />
            <Form.Group>
               <Form.Toggle
                  name="isDeliveryActive"
                  value={delivery.isActive}
                  onChange={() =>
                     onDeliveryChange('isActive', !delivery.isActive)
                  }
               >
                  Is Active?
               </Form.Toggle>
            </Form.Group>
            <Spacer size="24px" />
            <Form.Group>
               <Form.Label htmlFor="price" title="price">
                  <Flex container alignItems="center">
                     Price*
                     <Tooltip identifier="form_subscription_tunnel_zipcode_field_price" />
                  </Flex>
               </Form.Label>
               <Form.Text
                  id="price"
                  name="price"
                  value={delivery.price}
                  placeholder="Enter the price"
                  onChange={e =>
                     onDeliveryChange(e.target.name, e.target.value)
                  }
               />
            </Form.Group>
            <Spacer size="24px" />
            <Styles.Row>
               <Form.Group>
                  <Form.Label htmlFor="from" title="from">
                     <Flex container alignItems="center">
                        From
                        <Tooltip identifier="form_subscription_tunnel_zipcode_field_delivery_from" />
                     </Flex>
                  </Form.Label>
                  <Form.Time
                     id="from"
                     name="from"
                     value={delivery.from}
                     placeholder="Enter delivery from"
                     onChange={e =>
                        onDeliveryChange(e.target.name, e.target.value)
                     }
                  />
               </Form.Group>
               <Spacer size="16px" xAxis />
               <Form.Group>
                  <Form.Label htmlFor="to" title="to">
                     <Flex container alignItems="center">
                        To
                        <Tooltip identifier="form_subscription_tunnel_zipcode_field_delivery_to" />
                     </Flex>
                  </Form.Label>
                  <Form.Time
                     id="to"
                     name="to"
                     value={delivery.to}
                     placeholder="Enter delivery to"
                     onChange={e =>
                        onDeliveryChange(e.target.name, e.target.value)
                     }
                  />
               </Form.Group>
            </Styles.Row>
            <Spacer size="24px" />
            <Text as="h3">Pick Up</Text>
            <Spacer size="14px" />
            {!isEmpty(pickupOption) && (
               <>
                  <Form.Group>
                     <Form.Toggle
                        name="isPickupActive"
                        value={isPickupActive}
                        onChange={() => setIsPickupActive(!isPickupActive)}
                     >
                        Is Active?
                     </Form.Toggle>
                  </Form.Group>
                  <Spacer size="24px" />
                  <SelectedOption
                     option={pickupOption}
                     setPickupOption={setPickupOption}
                  />
                  <Spacer size="24px" />
               </>
            )}
            <ButtonTile
               noIcon
               type="secondary"
               text="Select Pickup Option"
               onClick={() => openOptionTunnel(1)}
            />
            <PickUpTunnel
               onSave={option => setPickupOption(option)}
               tunnel={{
                  list: tunnels,
                  close: closeOptionTunnel,
               }}
            />
         </Flex>
         <Banner id="subscription-app-create-subscription-form-add-zipcode-tunnel-bottom" />
      </>
   )
}

const SelectedOption = ({ option, setPickupOption }) => {
   return (
      <Styles.SelectedOption container alignItems="center">
         <main>
            <section>
               <span>Pickup time</span>
               <p as="subtitle">
                  {option?.time?.from} - {option?.time?.to}
               </p>
            </section>
            <Spacer size="16px" xAxis />
            <section>
               <span>Address</span>
               <p as="subtitle">{parseAddress(option.address)}</p>
            </section>
            <Spacer size="16px" />
         </main>
         <aside>
            <IconButton
               size="sm"
               type="ghost"
               onClick={() => setPickupOption(null)}
            >
               <DeleteIcon color="#FF5A52" />
            </IconButton>
         </aside>
      </Styles.SelectedOption>
   )
}

const Delete = ({ cell, remove }) => {
   const removeItem = () => {
      const { subscriptionId, zipcode } = cell.getData()
      if (
         window.confirm(`Are your sure you want to delete ${zipcode} zipcode?`)
      ) {
         remove({ variables: { subscriptionId, zipcode } })
      }
   }

   return (
      <IconButton size="sm" type="ghost" onClick={removeItem}>
         <DeleteIcon color="#FF5A52" />
      </IconButton>
   )
}

const Styles = {
   Row: styled.div`
      display: flex;
      align-items: center;
      > section {
         flex: 1;
      }
   `,
   Options: styled.ul``,
   Option: styled.li`
      list-style: none;
   `,
   SelectedOption: styled.div`
      display: flex;
      > section {
         > span {
            font-size: 14px;
            text-transform: uppercase;
            color: #433e46;
            letter-spacing: 0.4px;
         }
         > p {
            color: #555b6e;
         }
      }
   `,
}
