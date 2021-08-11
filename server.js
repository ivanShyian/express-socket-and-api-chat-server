const InMemorySessionStore = require("./utils/sessionStore.");
const server = require('./index')
const randomId = require('./utils/randomIdGenerator')

const sessionStorage = new InMemorySessionStore()
const port = process.env.PORT || 3001
const io = require('socket.io')(server, {
  path: '/socket-service/',
  cors: {
    origin: ['http://localhost:8080', 'http://192.168.0.102:8080'],
    methods: ['POST', 'GET']
  }
})

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID

  if (sessionID) {
    const session = sessionStorage.findSession(sessionID)
    if (session) {
      socket.sessionID = sessionID
      socket.userID = session.userID
      socket.username = session.username
      socket.databaseID = session.databaseID
      return next()
    }
  }

  const username = socket.handshake.auth.nickname
  const userDatabaseID = socket.handshake.auth.userDatabaseID

  if (!username) {
    return next(new Error('invalid username'))
  }

  socket.sessionID = randomId()
  socket.userID = randomId()
  socket.username = username
  socket.databaseID = userDatabaseID
  next()
})

io.on('connection', async(socket) => {
  console.log(`<= User: ${socket.id} connected =>`)
  socket.join(socket.userID)

  socket.emit('session', {
    sessionID: socket.sessionID,
    userID: socket.userID,
    userDatabaseID: socket.databaseID
  })

  const users = []
  for await(const [id, socket] of io.of('/').sockets) {
    users.push({
      userID: socket.userID,
      nickname: socket.username,
      userDatabaseID: socket.databaseID
    })
  }
  socket.emit('users', users)

  socket.broadcast.emit('user connected', {
    userID: socket.userID,
    nickname: socket.username,
    userDatabaseID: socket.databaseID
  })

  socket.on('sendMessage', ({ content, to }) => {
    socket.to(to).to(socket.userID).emit('new-message', {
      content,
      from: socket.userID,
      to
    })
  })

  socket.on('disconnect', async(reason) => {
    console.log(`<= User: ${socket.id} disconnected - ${reason} =>`)

    const matchingSockets = await io.in(socket.userID).allSockets()
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userID);
      // update the connection status of the session
      sessionStorage.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        databaseID: socket.databaseID,
        connected: false,
      })
    }
  })
})

server.listen(+port, () => {
  console.log(`<= server init in: [${port}] port =>`)
})

module.exports = server
