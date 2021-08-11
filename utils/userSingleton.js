module.exports = class UserSingleton {
	_instance = null
	
	user = null
	chatsCollection = null

	constructor() {
		if (!UserSingleton._instance) {
			UserSingleton._instance = this
		}
		return UserSingleton._instance
	}

	set userData(val) {
    this.user = val
  }

  get userData() {
    return this.user
  }

  set userChatList(val) {
    this.chatsCollection = val
  }

  get userChatList() {
    return this.chatsCollection
  }
}