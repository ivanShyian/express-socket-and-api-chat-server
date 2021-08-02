const express = require('express')
const router = express.Router()
const FirebaseUser = require('../models/FirebaseUser')

const firebaseUser = new FirebaseUser()

router.use((req, res, next) => {
  next()
})

router.post('/', async(req, res) => {
  const {email, password} = req.body
  await firebaseUser.createUser({email, password})
})

module.exports = router
