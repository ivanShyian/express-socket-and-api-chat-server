const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://vue-express-socket-chat-default-rtdb.europe-west1.firebasedatabase.app",
  databaseAuthVariableOverride: {
    uid: "my-service-worker"
  }
});

module.exports = admin
