const admin = require('../config/firebase-admin')

class AuthenticationMiddleware {

	async decodeToken(req, res, next) {
		
		try {
			const token = req.headers.authorization.split(' ')[1]
			const decodedValue = await admin.auth().verifyIdToken(token)
			console.log({decodedValue})
			if (decodedValue) {
				return next()
			}
			return res.json({message: 'UNAUTHENTICATED!'})
		} catch (e) {
			res.json(e.message | {message: 'UNAUTHENTICATED!'})
		}
	}

}

const middleware = new AuthenticationMiddleware()
module.exports = middleware