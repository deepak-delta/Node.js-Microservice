import * as express from 'express'
import * as cors from 'cors'
import MongoDataSource from './data-source'
import * as amqp from 'amqplib'
import process = require('process')
import * as dotenv from 'dotenv'

const connectDb = async () => {
  await MongoDataSource.initialize()
    .then(() => {
      console.log('Mongo Data Source has been initialized!')
      connectMQ()
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err)
    })
}

const connectMQ = async () => {
  try {
    dotenv.config()
    const connection = await amqp.connect(process.env.RABBITMQ_URL, {
      clientProperties: { connection_name: 'User' },
    })
    const channel = await connection.createChannel()
    const queueName = 'Admin.MQ1.RequestQueue'
    await channel.assertQueue(queueName)
    console.log('MQ1 has been initialized!')

    const app = express()
    app.use(cors({ origin: ['http://localhost:8080'] }))
    app.use(express.json())

    channel.consume(queueName, (message) => {
      const input = JSON.parse(message.content.toString())
      console.log(input)
      channel.ack(message)
    })

    app.listen(8001, () => {
      console.log('listening on port 8001')
    })

    process.on('beforeExit', () => {
      console.log('Closing RabbitMQ connection...')
      connection.close()
    })
  } catch (error) {
    console.error(error)
  }
}
connectDb()
