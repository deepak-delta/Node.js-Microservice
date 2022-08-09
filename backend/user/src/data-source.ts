import { DataSource } from 'typeorm'

const MongoDataSource = new DataSource({
  type: 'mongodb',
  host: 'localhost',
  database: 'userdb',
  entities: ['src/entity/*.js'],
  logging: false,
  synchronize: true,
})

export default MongoDataSource
