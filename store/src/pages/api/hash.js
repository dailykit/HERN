import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export default async function handler(req, res) {
   if (req.method === 'POST') {
      const { password = '' } = req.body
      const hash = await bcrypt.hash(password, SALT_ROUNDS)
      return res.status(200).json({ success: true, hash })
   }
}
