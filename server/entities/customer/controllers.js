export const getCustomer = async (req, res) => {
   try {
      const { email = '' } = req.params
      if (!email)
         return res
            .status(401)
            .json({ success: false, error: 'Email is required!' })
      const user = await getUserKeycloakDetails(email)
      return res.status(200).json({ success: true, data: user })
   } catch (error) {
      return res.status(500).json({ success: false, error })
   }
}
