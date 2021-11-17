export const getProtectedRoutes = (withBrand = false) => {
   const protectedRoutes = [
      '/get-started/select-delivery',
      '/get-started/select-menu',
      '/get-started/select-plan',
      '/get-started/checkout',
      '/menu',
      '/account/addresses',
      '/account/cards',
      '/account/loyalty-points',
      '/account/orders',
      '/account/profile',
      '/account/referrals',
      '/account/wallet',
      '/select-plan',
   ]
   const protectedTOutesWithBrandPrepend = protectedRoutes.map(
      eachRoute => '/[brand]' + eachRoute
   )
   return withBrand ? protectedTOutesWithBrandPrepend : protectedRoutes
}
