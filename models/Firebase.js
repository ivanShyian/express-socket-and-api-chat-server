const admin = require('../config/firebase-admin')

class Firebase {
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
