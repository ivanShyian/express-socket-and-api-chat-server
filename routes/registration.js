const express = require('express')
const router = express.Router()
const FirebaseUser = require('../models/FirebaseUser')

const firebaseUser = new FirebaseUser()

router.post('/', async(req, res) => {
  try {
    const {email, password, nickname, id} = req.body
    const response = await firebaseUser.createUser({email, password, nickname, id})
    res.status(200).json(response)
  } catch (e) {
    res.status(400).json ({state: false})
  }
})

module.exports = router
