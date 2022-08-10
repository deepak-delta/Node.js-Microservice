"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const data_source_1 = require("./data-source");
const Post_1 = require("./entity/Post");
const amqp = require("amqplib");
const process = require("process");
const dotenv = require("dotenv");
const connectDb = async () => {
    await data_source_1.default.initialize()
        .then(() => {
        console.log('Data Source has been initialized!');
        connectMQ();
    })
        .catch((err) => {
        console.error('Error during Data Source initialization', err);
    });
};
const connectMQ = async () => {
    try {
        dotenv.config();
        const connection = await amqp.connect(process.env.RABBITMQ_URL, {
            clientProperties: { connection_name: 'Admin' },
        });
        const channel = await connection.createChannel();
        const queueName = 'Admin.MQ1.RequestQueue';
        await channel.assertQueue(queueName);
        console.log('MQ1 has been initialized!');
        const PostRepository = data_source_1.default.getRepository(Post_1.Post);
        const app = express();
        app.use(cors({ origin: ['http://localhost:3000'] }));
        app.use(express.json());
        // Get list of all posts
        app.get('/api/posts', async (req, res) => {
            const posts = await PostRepository.find();
            res.json(posts);
        });
        app.post('/api/posts', async (req, res) => {
            const post = PostRepository.create(req.body);
            const savedPost = await PostRepository.save(post);
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(savedPost)));
            return res.send(savedPost);
        });
        // LIkes count
        app.post('/api/posts/:id/likes', async (req, res) => {
            const post = await PostRepository.findOneBy({
                id: Number(req.params.id),
            });
            post.likes++;
            const savedPost = await PostRepository.save(post);
            return res.send(savedPost);
        });
        // Get list of posts by post id
        app.get('/api/posts/:id', async (req, res) => {
            const post = await PostRepository.findOneBy({
                id: Number(req.params.id),
            });
            return res.send(post);
        });
        //Update post
        app.put('/api/posts/:id', async (req, res) => {
            const post = await PostRepository.findOneBy({
                id: Number(req.params.id),
            });
            PostRepository.merge(post, req.body);
            const savedPost = await PostRepository.save(post);
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(savedPost)));
            return res.send(savedPost);
        });
        //Delete post
        app.delete('/api/posts/:id', async (req, res) => {
            const post = await PostRepository.delete(req.params.id);
            channel.sendToQueue(queueName, Buffer.from(req.params.id));
            return res.send('Deleted');
        });
        app.listen(4001, () => {
            console.log('listening on port 4001');
        });
        process.on('beforeExit', () => {
            console.log('Closing RabbitMQ connection...');
            connection.close();
        });
    }
    catch (error) {
        console.error(error);
    }
};
connectDb();
