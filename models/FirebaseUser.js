const Firebase = require('./Firebase')
const admin = require('../config/firebase-admin')
const randomId = require('../utils/randomIdGenerator')
const UserSingleton = require('../utils/userSingleton')
const userHelper = new UserSingleton()

class FirebaseUser extends Firebase {
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
    if (data.uid) {
      const user = await this.__getUserDataFromDatabase(data.uid)   
      if (data.me) {
        super.firebaseUserData = user
      } 
      return user
    }
    if (data.query) {
      return this.__getUserDataFromDatabaseByNickname(data.query)
    }
  }


  __getUserDataFromDatabaseByNickname = async(query) => {
    try {
      return new Promise(async(resolve, reject) => {
        await admin.database()
        .ref('users')
        .on('value',
          (users) => resolve(this.__returnMatchedUsers(users.val(), query)),
          (err) => reject(err)
        )
      })
    } catch (e) {
      const error = e.message || e
      console.error(error)
      return error
    }
  }

  __returnMatchedUsers = (userList, query) => {
    if (userList && Object.keys(userList).length) {
      const regQuery = new RegExp(`${query}`, 'i')

      const existedChats = userHelper.chatsCollection && Object.keys(userHelper.chatsCollection)

      return Object.keys(userList)
        .map((user) => userList[user].userData)
        .filter((data) => {
          return regQuery.test(data.nickname) && data.uid !== super.firebaseUserData.uid && !existedChats.includes(data.id)
         })
    }
  }

  __getUserDataFromDatabase = async(uid) => {
    try {
      return new Promise(async(resolve, reject) => {
        await admin.database()
        .ref('users')
        .child(uid).child('userData')
        .on('value',
          (data) => resolve(data.val())),
          (err) => reject(err)
      })
    } catch (e) {
      const error = e.message || e
      console.error(error)
      return error
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
      const error = e.message || e
      console.error(error)
      return error
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
      const error = e.message || e
      console.error(error)
      return {state: false, error}
    }
  }
}

module.exports = FirebaseUser
