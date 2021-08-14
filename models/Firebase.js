const admin = require('../config/firebase-admin')

class Firebase {

  static async decodeUserByDatabaseId(databaseId) {
    return new Promise(async(resolve, reject) => {
      await admin.database().ref('keys').child(databaseId).on('value', (uid) => {
        resolve(uid.val())
      }, (err) => {
        reject(err)
      })
    }).catch((e) => {
      console.warn(e)
    })
  }

  static async getFirebaseUserChatList(uid) {
    console.log({uid})
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
    }).catch((e) => {
      console.warn(e)
    })
  }

  static async getUsersByChatIdExceptMe(chatId) {
    return new Promise(async(resolve, reject) => {
      await admin.database()
      .ref('messages')
      .child(chatId)
      .child('users')
      .on('value', data => {
        resolve(data.val())
      }, err => {
        reject(err)
      })
    }).catch((e) => {
      console.warn(e)
    })
  }

  static __removeMyUserFromList(array, chatId, myId) {
    if (!array.length) {
      return null
    }
    const user = array.length > 1 ? array.find(id => id !== myId) : array[0]
    
    return {
      [chatId]: user
    }
  }

  static async getUserChatCollection(myUser) {
    const collection = await this.getFirebaseUserChatList(myUser.uid)

    if (Array.isArray(collection)) {
      return Promise.all(await collection.map(async(chatId) => (
          this.__removeMyUserFromList(await this.getUsersByChatIdExceptMe(chatId), chatId, myUser.id)
        ))
      )
    }
    if (typeof collection === 'object' && Object.keys(collection).length) {
      return Promise.all(await Object.values(collection).map(async(chatId) => (
          this.__removeMyUserFromList(await this.getUsersByChatIdExceptMe(chatId), chatId, myUser.id)
        ))
      )
    }
  }

}

module.exports = Firebase
