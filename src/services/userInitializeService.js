const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { selectedByUser } = require('../globalBuffer')
require('dotenv').config()
const usersDataCatalog = process.env.USERS_DATA_CATALOG

module.exports.initializeUserSettings = async function (chatId) {
	try {
		const SERVER_URL = process.env.SERVER_URL
		const LG_SERVER_AUTHORIZATION = process.env.LG_SERVER_AUTHORIZATION
		const headers = LG_SERVER_AUTHORIZATION
			? { Authorization: LG_SERVER_AUTHORIZATION }
			: {}
		const response = await axios.post(
			`${SERVER_URL}/user-get`,
			{ chat_id: chatId },
			{ headers }
		)

		if (response.status === 200 && response.data && response.data[0]) {
			const user = response.data[0]
			const userObj = {
				id: user.user_id,
				first_name: user.first_name,
				last_name: user.last_name,
				username: user.username,
				nativeLanguage: user.language_code || 'pl',
				menuLanguage: user.menu_language || 'pl',
				voiceSynthesisLanguage: user.tts_language || 'pl',
				learningLanguage: user.learning_language || 'pl',
				text: '',
				changed: false,
			}
			selectedByUser[chatId] = userObj
			// Save user settings to file
			const dirPath = usersDataCatalog
			const filePath = path.join(dirPath, `${chatId}.json`)
			fs.mkdirSync(dirPath, { recursive: true })
			fs.writeFileSync(filePath, JSON.stringify(userObj, null, 2))
			return userObj
		} else {
			console.log('Server user-get error:', response.status, response.data)
			return null
		}
	} catch (error) {
		console.log(
			'Error initializing user settings:',
			error?.response?.data || error.message
		)
		return null
	}
}
