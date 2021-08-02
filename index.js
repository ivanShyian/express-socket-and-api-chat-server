const express = require('express')
const app = express()
const cors = require('cors')
const server = require('http').createServer(app)

const authMiddleware = require('./middlewares/AuthenticationMiddleware')

const bodyParser = require('body-parser')
const loginRoute = require('./routes/login')
const registerRoute = require('./routes/registration')
const userRoute = require('./routes/user')
const chatsRoute = require('./routes/chats')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors({origin: ['http://localhost:8080', 'http://192.168.0.101:8080']}))

app.use(authMiddleware.decodeToken)

app.use('/login', loginRoute)
app.use('/registration', registerRoute)
app.use('/user', userRoute)
app.use('/chats', chatsRoute)
// app.get('/user/get:userId?', getUserRoute)
// app.get('/user/search', searchUserRoute)

module.exports = server
