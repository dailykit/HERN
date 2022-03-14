import URL from 'url'
export const getUrlDetails = url => {
   return URL.parse(url)
}
