const admin = require('../config/firebase-admin')

class AuthenticationMiddleware {

	async decodeToken(req, res, next) {
		
		try {
			if (req.originalUrl === '/registration') {
				return next()
			}

			if (!req.headers.authorization) {
				throw new Error()
			}
			const token = req.headers.authorization.split(' ')[1]
			const decodedValue = await admin.auth().verifyIdToken(token)
			if (decodedValue) {
				return next()
			}
			return res.status(401).json({message: 'UNAUTHENTICATED!'})
		} catch (e) {
			res.status(401).json(e.message | {message: 'UNAUTHENTICATED!'})
		}
	}

}

const middleware = new AuthenticationMiddleware()
module.exports = middleware