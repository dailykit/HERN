import { NextRequest, NextResponse } from 'next/server'

export default function middleware(req) {
   const url = req.nextUrl.clone()
   const hostname = req.headers.get('host')
   const brand = hostname.replace(':', '')

   if (
      !url.pathname.includes('.') && // exclude all files in the public folder
      !url.pathname.startsWith('/api') // exclude all API routes
   ) {
      url.pathname = `/${brand}${url.pathname}`
      console.log('rewriting to: ', url)
      return NextResponse.rewrite(url)
   }
}
