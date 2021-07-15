export default function handler(req, res) {
   res.setPreviewData({ message: 'test' })
   res.end('Preview mode enabled')
}
