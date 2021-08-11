const Firebase = require('./Firebase')
const FirebaseUser = require('./FirebaseUser')
const admin = require('../config/firebase-admin')

const firebaseUser = new FirebaseUser()

class FirebaseChats extends Firebase {
  myUserDatabaseID = null
	usersByChat = {}
  chatsCollection = {}

	async getUserChatList(data) {
    this.myUserDatabaseID = data.databaseId

		const chatIds = await this.__getFirebaseUserChatList(data.uid)
    const result = await this.__getMessagesByValue('lastMessage', chatIds, null)

    super.firebaseUserChatList = this.chatsCollection
    return {lastMessages: result, chatsCollection: this.chatsCollection}
	}

	async getChatById(chatId) {
    return this.__getMessagesByValue('messages', null, chatId)
  }


  async sendMessage(content, chatId) {
    return this.__sendMessageToDatabase(content, chatId)
  }

  async __sendMessageToDatabase(content, chatId) {
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
    if (value && (chats || exactChat)) {
      switch (value) {
        case 'lastMessage':
          return await this.__fetchDataInLoopHelper({array: chats, callback: this.__fetchLastMessagesByChatId})
        case 'messages':
          return await this.__fetchMessagesByChatId(exactChat)
      }
    }
    return null
  }

   __fetchDataInLoopHelper = async({array, callback}) => {
    return Promise.all(array.map(async(el) => {
      return callback(el)
    }))
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
        this.usersByChat = {...this.usersByChat, [chat]: result.val()}
    		resolve(result.val())
    	}, (err) => {
    		reject(err)
    	})
    })
  }

	__getFirebaseUserChatList = async(uid) => {
		try {
      return new Promise(async(resolve, reject) => {
        await admin.database()
        .ref('users')
        .child(uid)
        .child('chatList')
        .on('value', data => {
          resolve(data.val())
        }, (err) => {
          reject(err)
        })
      })
    } catch (e) {
      console.error(e.message | e)
    }
	}
}

module.exports = FirebaseChats
