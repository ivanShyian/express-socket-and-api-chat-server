const express = require('express')
const router = express.Router()
const FirebaseUser = require('../models/FirebaseUser')
const firebaseUser = new FirebaseUser()

router.post('/me', async(req, res) => {
	try {
		const {uid} = req.body
		if (!uid) throw new Error('UID is empty')

		const user = await firebaseUser.getUserData({uid})
		res.status(200).json(user)
	} catch (e) {
		res.status(400).json(e)
	}
})

router.post('/search', async(req, res) => {
	try {
		const {query, me} = req.body

		const result = await firebaseUser.getUserData({query, me})
		res.status(200).json({result})
	} catch (e) {
		res.status(400).json(e)
	}
})

router.post('/search/all', async(req, res) => {
	try {
		const {query, me} = req.body

		const result = await firebaseUser.getAllUsers(me)
		console.log('finisg')
		res.status(200).json({result})
	} catch (e) {
		res.status(400).json(e)
	}
})

module.exports = router