const express = require('express')
const router = express.Router()
const FirebaseChats = require('../models/FirebaseChats')

const firebaseChats = new FirebaseChats()

router.post('/all', async(req, res) => {
	try {
		const {uid, id: databaseId} = req.body
		if (!uid) throw new Error('Internal Error')

		const list = await firebaseChats.getUserChatList({uid, databaseId})
		res.status(200).json(list)
	} catch (e) {
		res.status(400).json(e)
	}
})

router.get('/get/:id', async(req, res) => {
	try {
		const chatId = req.params.id || req.body.id
		const chatMessages = await firebaseChats.getChatById(chatId)
		res.status(200).json(chatMessages)
	} catch (e) {
		res.status(400).json(e)
	}
})

router.post('/send', async(req, res) => {
	try {
		const {content, id} = req.body
		const response = await firebaseChats.sendMessage(content, id)
		res.status(200).json(response)
	} catch (e) {
		res.status(400).json(response)
	}
})

module.exports = router
