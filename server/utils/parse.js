function parse(req, res, next) {
   req.setEncoding('utf8')

   let data = ''

   req.on('data', chunk => {
      data += chunk
   })

   req.on('end', () => {
      req.rawBody = data

      next()
   })
}

export { parse }
