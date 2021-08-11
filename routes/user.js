const express = require('express')
const router = express.Router()
const FirebaseUser = require('../models/FirebaseUser')
const firebaseUser = new FirebaseUser()

router.post('/me', async(req, res) => {
	try {
		const uid = req.body.uid
		if (!uid) throw new Error('UID is empty')

		const user = await firebaseUser.getUserData({uid, me: true})
		res.status(200).json(user)
	} catch (e) {
		res.status(400).json(e)
	}
})

router.post('/search', async(req, res) => {
	try {
		const query = req.body.query
		if (!query) throw new Error('Query is empty')

		const result = await firebaseUser.getUserData({query})
		res.status(200).json({result})
	} catch (e) {
		res.status(400).json(e)
	}
})

module.exports = router