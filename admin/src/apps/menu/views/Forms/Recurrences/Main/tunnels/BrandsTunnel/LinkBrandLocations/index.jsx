import React from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import {
   Dropdown,
   Flex,
   Form,
   Spacer,
   Toggle,
   TunnelHeader,
} from '@dailykit/ui'
import { BRAND_LOCATIONS,UPSERT_BRAND_LOCATION_RECURRENCE } from '../../../../../../../graphql'
import { TunnelBody } from '../../styled'
import { InlineLoader } from '../../../../../../../../../shared/components'
import { reactFormatter,ReactTabulator } from '@dailykit/react-tabulator'
import { RecurrenceContext } from '../../../../../../../context/recurrence'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../../shared/utils'
import { repeat } from 'lodash'
import { Banner, Tooltip } from '../../../components'


const LinkBrandLocations = ({ closeTunnelForLocations, brandId }) => {
   const tableRef = React.useRef()
   const { recurrenceState } = React.useContext(RecurrenceContext)
   const [locationList, setLocationList] = React.useState([])
   const [click, setClick] = React.useState(null)
   const [title, setTitle] = React.useState([])

   const { 
       locationError, 
       locationListLoading, 
       locationData } = useSubscription(
    BRAND_LOCATIONS,
    {
        variables: {brandId: {_eq: brandId}},    
        onSubscriptionData: ({
            subscriptionData: {
            data: { brands_location = [] },
          },
       }) => {
        //    console.log("brands location::",brands_location,brandId)
          let locationsData = brands_location.map(location => {
             return {
                id: location?.id || '',
                label: location?.label || '',
                description:
                      location?.label +
                      '-' +
                      location?.city || '',
             }
          })
          setLocationList(previousLocation => [
             ...previousLocation,
             ...locationsData,
          ])
       },
    }
 )

//    console.log("brand location list here",locationList,brandId)
   const close = () => {
      closeTunnelForLocations(1)
   }

   const [upsertBrandLocationRecurrence] = useMutation(UPSERT_BRAND_LOCATION_RECURRENCE, {
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
       title: 'Label',
       field: 'label',
       headerFilter: true,
       headerSort: false,
    },
    {
       title: 'City',
       field: 'description',
       headerFilter: true,
    },
    {
        title: 'Link Location to Recurrence ',  
        headerTooltip: function (column) {
            return (column.getDefinition().title)},      
        formatter: reactFormatter(
           <ToggleRecurrence
           recurrenceId={recurrenceState.recurrenceId}
               onChange={object =>
                  upsertBrandLocationRecurrence({ variables: { object } })
               }
            />
        ),
     },
    
 ]

 const options = {
    cellVertAlign: 'middle',
    layout: 'fitColumns',
    autoResize: true,
    maxHeight: 420,
    resizableColumns: true,
    virtualDomBuffer: 80,
    placeholder: "No data available",
    persistence: true,
    persistenceMode: 'cookie',
 }

   return (
      <>
         <TunnelHeader
            title="Brand Locations"
            close={close}
         />
         <TunnelBody>
            {locationListLoading ? (
               <InlineLoader />
            ) : (
               <ReactTabulator
                  ref={tableRef}
                  columns={columns}
                  data={locationList}
                  options={options}
               />
            // <></>
            )}
         </TunnelBody>
      </>
   )
}
export default LinkBrandLocations



const ToggleRecurrence = ({ cell, onChange, recurrenceId }) => {
    const brandLocation = React.useRef(cell.getData())
    const [active, setActive] = React.useState(false)
    // console.log('brand location toggle:', brandLocation)
    
    const toggleHandler = value => {
    //    console.log('values::',value)
       onChange({
          recurrenceId,
          brandLocationId: brandLocation.current.id,
          isActive: !active,
       })
    }
 
    // React.useEffect(() => {
    //    const isActive = brandLocation.current.recurrences.some(
    //       recurrence =>
    //          recurrence.recurrenceId === recurrenceId && recurrence.isActive
    //    )
    //    setActive(isActive)
    // }, [brandLocation.current])
 
    return (
       <Form.Toggle
        //   name={`toggle-${brand.current.id}`}
          value={active}
          onChange={toggleHandler}
       />
    )
 }
 