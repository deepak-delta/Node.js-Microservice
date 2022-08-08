import * as express from 'express'
import * as cors from 'cors'

const app = express()
app.use(cors({ origin: ['http://localhost:3000'] }))

app.use(express.json())

app.listen(4000, () => {
  console.log('listening on port 4000')
})
