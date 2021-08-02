const express = require('express')
const router = express.Router()
const FirebaseChats = require('../models/FirebaseChats')

const firebaseChats = new FirebaseChats() 

router.post('/list', async(req, res) => {
	try {
		const uid = req.body.uid
		const databaseId = req.body.id
		console.log(databaseId)
		if (!uid) throw new Error('Internal Error')

		const user = await firebaseChats.getUserChatList({uid, databaseId})
		res.status(200).json(user)		
	} catch (e) {
		res.status(400).json(e)
	}
})

// router.post('/')

module.exports = router