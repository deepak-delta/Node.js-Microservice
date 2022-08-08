import { DataSource } from 'typeorm'

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'admindb',
  entities: ['src/entity/*.js'],
  logging: false,
  synchronize: true,
})

export default AppDataSource
