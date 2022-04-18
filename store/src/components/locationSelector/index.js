import dynamic from 'next/dynamic'

const Delivery = dynamic(() =>
   import('./delivery').then(promise => promise.Delivery)
)
const Pickup = dynamic(() => import('./pickup').then(promise => promise.Pickup))

const DineIn = dynamic(() => import('./dinein').then(promise => promise.DineIn))

const StoreList = dynamic(() =>
   import('./storeList').then(promise => promise.StoreList)
)

const AddressInfo = dynamic(() =>
   import('./addressInfo').then(promise => promise.AddressInfo)
)

const LocationSelector = dynamic(() =>
   import('./locationSelector').then(promise => promise.LocationSelector)
)

export { Delivery, Pickup, DineIn, StoreList, AddressInfo, LocationSelector }
// export * from './addressInfo'
// export * from './delivery'
// export * from './dinein'
// export * from './pickup'
// export * from './storeList'
// export * from './locationSelector'
