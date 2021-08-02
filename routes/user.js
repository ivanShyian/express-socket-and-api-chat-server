const express = require('express')
const router = express.Router()
const FirebaseUser = require('../models/FirebaseUser')
const firebaseUser = new FirebaseUser()

router.post('/me', async(req, res) => {
	try {
		const uid = req.body.uid
		if (!uid) throw new Error('Internal Error')

		const user = await firebaseUser.getUserData({uid})
		console.log(user)
		res.status(200).json(user)
	} catch (e) {
		res.status(400).json(e)
	}
})

module.exports = router