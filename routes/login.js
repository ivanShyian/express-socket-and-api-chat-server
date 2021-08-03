const express = require('express')
const router = express.Router()
const FirebaseUser = require('../models/FirebaseUser')
const firebaseUser = new FirebaseUser()

router.post('/', async(req, res) => {
  const user = await firebaseUser.loginUser({uid: req.body.uid})
  res.json({status: user})
})

module.exports = router
