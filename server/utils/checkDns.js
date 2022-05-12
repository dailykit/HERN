const dns = require('dns')

export const checkDNSRecordStatus = params => {
   try {
      return new Promise((resolve, reject) => {
         switch (params.type) {
            case 'TXT':
               dns.resolveTxt(params.name, (err, records) => {
                  if (err) {
                     console.log(err)
                     resolve(false)
                  } else {
                     resolve(records)
                  }
               })
               break
            case 'CNAME':
               dns.resolveCname(params.name, (err, records) => {
                  if (err) {
                     console.log(err)
                     resolve(false)
                  } else {
                     resolve(records)
                  }
               })
               break
            default:
               resolve(false)
               break
         }
      })
   } catch (error) {
      throw Error('Error in checking DKIM status ', error)
   }
}
