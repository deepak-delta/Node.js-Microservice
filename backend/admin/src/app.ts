import * as express from 'express'
import * as cors from 'cors'
import AppDataSource from './data-source'
import { Post } from './entity/Post'

const connectDb = async () => {
  await AppDataSource.initialize()
    .then(() => {
      console.log('Data Source has been initialized!')
    })
    .catch((err) => {
      console.error('Error during Data Source initialization', err)
    })
}

const PostRepository = AppDataSource.getRepository(Post)

connectDb()
const app = express()
app.use(cors({ origin: ['http://localhost:3000'] }))
app.use(express.json())

app.get('/api/posts', async (req, res) => {
  const posts = await PostRepository.find()
  res.json(posts)
})

app.post('/api/posts', async (req, res) => {
  const post = PostRepository.create(req.body)
  const savedPost = await PostRepository.save(post)
  return res.send(savedPost)
})

app.post('/api/posts/:id/likes', async (req, res) => {
  const post = await PostRepository.findOneBy({
    id: Number(req.params.id),
  })

  post.likes++
  const savedPost = await PostRepository.save(post)
  return res.send(savedPost)
})

app.get('/api/posts/:id', async (req, res) => {
  const post = await PostRepository.findOneBy({
    id: Number(req.params.id),
  })
  return res.send(post)
})

app.put('/api/posts/:id', async (req, res) => {
  const post = await PostRepository.findOneBy({
    id: Number(req.params.id),
  })

  PostRepository.merge(post, req.body)
  const savedPost = await PostRepository.save(post)
  return res.send(savedPost)
})

app.delete('/api/posts/:id', async (req, res) => {
  const post = await PostRepository.delete(req.params.id)

  return res.send('Deleted')
})

app.listen(4000, () => {
  console.log('listening on port 4000')
})
