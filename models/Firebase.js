const admin = require('../config/firebase-admin')
const UserSingleton = require('../utils/userSingleton')
const userHelper = new UserSingleton()

class Firebase {
  user = null
  userChatsList = null

  set firebaseUserData(val) {
    this.user = val
    //@TODO Refactor this bad practice code 
    userHelper.userData = val
  }

  get firebaseUserData() {
    return this.user
  }

  set firebaseUserChatList(val) {
    this.userChatsList = val
    //@TODO Refactor this bad practice code
    userHelper.userChatList = val
  }

  get firebaseUserChatList() {
    return this.userChatsList
  }

  static async decodeUserByDatabaseId(databaseId) {
    return new Promise(async(resolve, reject) => {
      await admin.database().ref('keys').child(databaseId).on('value', (uid) => {
        resolve(uid.val())
      }, (err) => {
        reject(err)
      })
    })
  }
}

module.exports = Firebase
