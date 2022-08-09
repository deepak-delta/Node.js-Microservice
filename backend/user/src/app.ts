import * as express from 'express'
import * as cors from 'cors'
import MongoDataSource from './data-source'

const connectDb = async () => {
  await MongoDataSource.initialize()
    .then(() => {
      console.log('Mongo Data Source has been initialized!')
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err)
    })
}

connectDb()

const app = express()
app.use(cors({ origin: ['http://localhost:8001'] }))
app.use(express.json())

app.listen(4000, () => {
  console.log('listening on port 8001')
})
