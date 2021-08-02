const Firebase = require('./Firebase')
const admin = require('../config/firebase-admin')

class FirebaseUser extends Firebase {
  constructor() {
    super()
  }

  async createUser(data) {
    await this.__createNewFirebaseUser(data)
    await this.__createNewDatabaseUser(data)
  }

  async getUserData(data) {
    return this.__getUserDataFromDatabase(data.uid)
  }


  async __getUserDataFromDatabase(uid) {
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

  async __createNewFirebaseUser(data) {
    const {email, password, nickname} = data
    return admin
      .auth()
      .createUser({
        email,
        emailVerified: false,
        password,
        displayName: nickname,
        disabled: false
      })
  }
  
  async __createNewDatabaseUser(data) {
    const {email, password, nickname} = data
  }
}

module.exports = FirebaseUser
