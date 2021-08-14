const Firebase = require('./Firebase')
const FirebaseUser = require('./FirebaseUser')
const admin = require('../config/firebase-admin')
const randomId = require('../utils/randomIdGenerator')

const firebaseUser = new FirebaseUser()

class FirebaseChats extends Firebase {
  myUserDatabaseID = null
  chatsCollection = {}

	async getUserChatList(data) {
    this.myUserDatabaseID = data.databaseId

		const list = await this.listOfUserChatList(data)
    const result = await this.__getMessagesByValue('lastMessage', list, null)
    const response = {lastMessages: result, chatsCollection: this.chatsCollection}

    this.__clearClassInstance()
    return response
	}

  async listOfUserChatList(data) {
    return Firebase.getFirebaseUserChatList(data.uid)
  }

	async getChatById(chatId) {
    return this.__getMessagesByValue('messages', null, chatId)
  }

  async sendMessage(content, chatId) {
    return this.__sendMessageToDatabase(content, chatId)
  }

  async addChatToUserList(data) {
    const {myUserId, userId} = data

    return this.__createNewMessageRoomAndAddToBothOfUsers(myUserId, userId)
  }

  __clearClassInstance = () => {
    this.chatsCollection = {}
    this.myUserDatabaseID = null
  }

  __createNewMessageRoomAndAddToBothOfUsers = async(myUserId, separateUserDatabaseId) => {
    const chatId = await this.__createNewMessageRoom(myUserId, separateUserDatabaseId)
    await this.__addChatToBothUsers(chatId, [myUserId, separateUserDatabaseId])
    console.log({chatId})
    return chatId
  }

  __createNewMessageRoom = async(me, separated) => {
    const id = randomId()
    const newMessageRoom = {
      lastMessage: false,
      users: [me, separated]
    }

    try {
      await admin.database().ref('/messages/' + id).set(newMessageRoom)
      return id
    } catch (e) {
      console.error(e)
      return {state: false}
    }
  }

  __addChatToBothUsers = async(chatId, ids) => {
    try {
      return Promise.all(await ids.map(async(id) => {
        const uid = await Firebase.decodeUserByDatabaseId(id)
        await admin.database().ref('users').child(uid).child('chatList').push(chatId)
        return {chatId, state: true}
        }
      ))
    } catch (e) {
      console.error(e)
      return {state: false}
    }
  }

  __sendMessageToDatabase = async(content, chatId) => {
    try {
      await admin.database().ref('messages').child(chatId).child('messages').push(content)
      delete content.databaseID
      await admin.database().ref('messages').child(chatId).child('lastMessage').set(content)
      return {state: true}
    } catch (e) {
      console.error(e)
      return {state: false}
    }
  }

	__getMessagesByValue = async(value, chats, exactChat) => {
    console.log({chats})
    if (value && (chats || exactChat)) {
      switch (value) {
        case 'lastMessage':
          return this.__fetchDataInLoopHelper({array: chats, callback: this.__fetchLastMessagesByChatId})
        case 'messages':
          return this.__fetchMessagesByChatId(exactChat)
      }
    }
    return null
  }

   __fetchDataInLoopHelper = async({array, callback}) => {
    if (typeof array === 'object') {
        return Promise.all(Object.values(array).map(async(el) => {
          return callback(el)
      }))
    } else {
      return Promise.all(array.map(async(el) => {
          return callback(el)
      }))
    }
  }

   __fetchLastMessagesByChatId = async(chatId) => {
    return new Promise(async(resolve, reject) => {
      await admin.database().ref('messages').child(chatId).child('lastMessage').on('value', async(result) => {

        const users = await this.__fetchUsersByChat(chatId)
        const userId = users.length === 2 ? users.find((id) => id !== this.myUserDatabaseID) : users[0]

        if (Object.keys(this.chatsCollection).length) {
          this.chatsCollection = {
            ...this.chatsCollection,
            [userId]: chatId
          }
        } else {
          this.chatsCollection = {[userId]: chatId}
        }

        const separateUserDatabaseId = users.find((databaseId) => databaseId !== this.myUserDatabaseID)
        const userKey = separateUserDatabaseId
          ? await Firebase.decodeUserByDatabaseId(separateUserDatabaseId)
          : this.myUserDatabaseID

        if (userKey !== this.myUserDatabaseID) {
          const userData = await firebaseUser.getUserData({uid: userKey})
          resolve({...result.val(), chatUser: userData})
        }
        resolve({...result.val(), chatUser: 'self', databaseID: this.myUserDatabaseID})

    }, (err) => {
      reject(err)
    })
   })
  }



  __fetchMessagesByChatId = async(chat) => {
    return new Promise(async(resolve, reject) => {
    	const response = await admin.database()
    	.ref('messages')
    	.child(chat)
    	.child('messages')
    	.on('value', (result) => {
        if (result.val() === null) {
          resolve([])          
        }
        if (result.val()) {
          resolve(result.val())
        }
    	}, (err) => {
    		reject(err)
    	})
    })
  }

  __fetchUsersByChat = async(chat) => {
    return new Promise(async(resolve, reject) => {
    	const users = await admin.database()
    	.ref('messages')
    	.child(chat)
    	.child('users')
    	.on('value', (result) => {
    		resolve(result.val())
    	}, (err) => {
    		reject(err)
    	})
    })
  }

}

module.exports = FirebaseChats
