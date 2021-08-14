const Firebase = require('./Firebase')
const admin = require('../config/firebase-admin')
const randomId = require('../utils/randomIdGenerator')

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
      return this.__getUserDataFromDatabase(data.uid)  
    }
    if (data.query && data.id) {
      return this.__getAllUsersFromDatabaseOptionaly({withQuery: true, query: data.query, myUserUid: data.id})
    }
  }

  async getAllUsers(me) {
    return this.__getAllUsersFromDatabaseOptionaly({withQuery: false, myUser: me})
  }


  __getAllUsersFromDatabaseOptionaly = async({withQuery, myUser, query = ''}) => {
    try {
      return new Promise(async(resolve, reject) => {
        await admin.database().ref('users').on('value',
          (users) => resolve(this.__returnMatchedUsers(!!withQuery, users.val(), query, myUser)),
          (err) => reject(err)
        )
      })
    } catch (e) {
      const error = e.message || e
      console.error(error)
      return error
    }
  }

  __returnMatchedUsers = async(byQuery, userList, query, myUser) => {
    if (userList && Object.keys(userList).length) {
      const collection = await this.__extractUserChatsCollection(myUser)
      const existedChats = collection && collection.map(item => Object.values(item)).flat(1)

      if (byQuery) {
        const regQuery = new RegExp(`${query}`, 'i')
        return this.__diveIntoObjectAndExtractArray(userList, 'userData')
          .filter((data) => {
            return regQuery.test(data.nickname) && data.uid !== myUser.uid && !existedChats.includes(data.userDatabaseID)
          })
      } else {
        return this.__diveIntoObjectAndExtractArray(userList, 'userData')
          .filter((data) => {
            return data.uid !== myUser.uid && !existedChats.includes(data.userDatabaseID)
          })
      }
    }
  }

  __extractUserChatsCollection = async(myUser) => {
    return Firebase.getUserChatCollection(myUser)
  }

  __diveIntoObjectAndExtractArray = (objectData, deeperProp) => {
     return Object.keys(objectData).map((data) => {
       if ([deeperProp] in objectData[data]) {
         let userData = objectData[data][deeperProp]
         userData = {
           ...userData,
           userDatabaseID: userData.id,
           unfam: true
         }
         delete userData.id
         delete userData.email
         return userData
       }
     })
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
