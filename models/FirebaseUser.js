const Firebase = require('./Firebase')
const admin = require('../config/firebase-admin')
const randomId = require('../utils/randomIdGenerator')

class FirebaseUser extends Firebase {
  constructor() {
    super()
  }

  async createUser(data) {
    const firebaseAuthResponse = await this.__createNewFirebaseUser(data)

    if (firebaseAuthResponse.uid) {
      const result = await this.__writeNewUserToDatabase({
        ...data,
        uid: firebaseAuthResponse.uid
      })
      return result
    }
    return firebaseAuthResponse
  }

  async getUserData(data) {
    return this.__getUserDataFromDatabase(data.uid)
  }


  __getUserDataFromDatabase = async(uid) => {
    try {
      return new Promise(async(resolve, reject) => {
        await admin.database()
        .ref('users')
        .child(uid).child('userData')
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

  __createNewFirebaseUser = async(data) => {
    const {email, password, nickname} = data
    try {
      const response = await admin
      .auth()
      .createUser({
        email,
        emailVerified: false,
        password,
        displayName: nickname,
        disabled: false
      })
      return response
    } catch (e) {
      console.error(e)
      return e
    }
  }

  __writeNewUserToDatabase = async({uid, email, nickname, id}) => {
    const futureNewChatId = randomId()
    try {
      await admin.database().ref('/users/' + uid).set({
        userData: {
          email,
          nickname,
          uid,
          id,
          listOfChats: null
        },
        chatList: [futureNewChatId]
      })
      await admin.database().ref('/keys/' + [id]).set(uid)
      await admin.database().ref('/messages/' + futureNewChatId).set({
        lastMessage: false,
        users: [id]
      })
      return {state: true}
      return result
    } catch (e) {
      console.error(e)
      return {state: false, error: e.message || e}
    }
  }
}

module.exports = FirebaseUser
