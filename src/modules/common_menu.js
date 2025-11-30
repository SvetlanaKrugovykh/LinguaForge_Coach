const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { menuStarter } = require('../controllers/clientsAdmin')
const { respondToSelectedClient } = require('../modules/adminMessageHandler')
require('dotenv').config()
const { buttonsConfig, texts } = require('../data/keyboard')
const { testsMenu } = require('../data/tests_keyboard')
const { users } = require('../users/users.model')
const { selectedByUser, globalBuffer } = require('../globalBuffer')
const { checkUserPermissions } = require('../services/checkUsers')
const langS = require('../services/langServerServices')
const translateS = require('../services/translateService')

module.exports.commonStartMenu = async function (bot, msg) {
	console.log(`/start at ${new Date()} tg_user_id: ${msg.chat.id}`)
	const chatId = msg.chat.id
	const lang = selectedByUser[chatId]?.menuLanguage || 'en'
	const adminUser = users.find((user) => user.id === chatId)
	if (adminUser) {
		await menuStarter(bot, msg)
	} else {
		const permissionAccepted = await checkUserPermissions(bot, msg)
		if (permissionAccepted) {
			await menuStarter(bot, msg)
		} else {
			await module.exports.userMenu(bot, msg)
		}
	}
}

module.exports.settingsMenu = async function (bot, msg) {
	const chatId = msg.chat.id
	const lang = selectedByUser[chatId]?.menuLanguage || 'en'
	await bot.sendMessage(chatId, buttonsConfig['settingsButtons'].title[lang], {
		reply_markup: {
			keyboard: buttonsConfig['settingsButtons'].buttons[lang],
			resize_keyboard: true,
		},
	})
}

module.exports.userMenu = async function (bot, msg) {
	const chatId = msg.chat.id
	const lang = selectedByUser[chatId]?.menuLanguage || 'en'
	await bot.sendMessage(chatId, buttonsConfig['userMenu'].title[lang], {
		reply_markup: {
			keyboard: buttonsConfig['userMenu'].buttons[lang],
			resize_keyboard: true,
		},
	})
}

module.exports.commonTestsMenu = async function (bot, msg, data) {
	const chatId = msg.chat.id
	const lang = selectedByUser[chatId]?.menuLanguage || 'en'
	await bot.sendMessage(chatId, buttonsConfig['examPartsMenu'].title[lang], {
		reply_markup: {
			keyboard: buttonsConfig['examPartsMenu'].buttons[lang],
			resize_keyboard: true,
		},
	})
}
module.exports.wordPinMenu = async function (bot, msg) {
	const chatId = msg.chat.id
	const lang = selectedByUser[chatId]?.menuLanguage || 'en'
	await bot.sendMessage(chatId, testsMenu['pinWord'].title[lang], {
		reply_markup: {
			keyboard: testsMenu['pinWord'].buttons[lang],
			resize_keyboard: true,
		},
	})
}

module.exports.commonChoice = async function (bot, msg) {
	const chatId = msg?.chat?.id
	if (!chatId || !msg?.text) return
	const lang = selectedByUser[chatId]?.menuLanguage || 'en'
	await bot.sendMessage(chatId, buttonsConfig['confirmTextInput'].title[lang], {
		reply_markup: {
			keyboard: buttonsConfig['confirmTextInput'].buttons[lang],
			resize_keyboard: true,
		},
	})
}

function getValidLang(lang) {
	const allowed = ['ru', 'uk', 'pl', 'en', 'cs', 'de', 'fr', 'es', 'it']
	return allowed.includes(lang) ? lang : 'en'
}

module.exports.chooseLanguageMenu = async function (
	bot,
	msg,
	menuType = 'nativeLanguage'
) {
	const chatId = msg.chat.id
	const lang = selectedByUser[chatId]?.menuLanguage || 'en'
	let buttonsConfigKey = 'chooseNativeLanguage'
	if (menuType === 'voiceSynthesisLanguage')
		buttonsConfigKey = 'chooseVoiceSynthesisLanguage'
	if (menuType === 'learningLanguage')
		buttonsConfigKey = 'chooseLearningLanguage'
	if (menuType === 'menuLanguage') buttonsConfigKey = 'chooseMenuLanguage'
	await bot.sendMessage(chatId, buttonsConfig[buttonsConfigKey].title[lang], {
		reply_markup: {
			keyboard: buttonsConfig[buttonsConfigKey].buttons[lang],
			resize_keyboard: true,
		},
	})
}

module.exports.notTextScene = async function (
	bot,
	msg,
	lang = 'en',
	toSend = true,
	voice = false,
	toChatID = null
) {
	const GROUP_ID = toChatID || process.env.GROUP_ID
	try {
		const chatId = msg.chat.id
		await bot.sendMessage(chatId, `<i>${texts[lang]['0_2']}\n</i>`, {
			parse_mode: 'HTML',
		})

		const collectedMessages = []

		const handleMessage = async (message) => {
			if (message.chat.id === chatId) {
				if (message.text) {
					collectedMessages.push({ type: 'text', content: message.text })
				} else if (message.photo) {
					const fileId = message.photo[message.photo.length - 1].file_id
					collectedMessages.push({ type: 'photo', fileId })
				} else if (message.document) {
					const fileId = message.document.file_id
					collectedMessages.push({ type: 'document', fileId })
				} else if (message.audio) {
					const fileId = message.audio.file_id
					collectedMessages.push({ type: 'audio', fileId })
				} else if (message.voice) {
					const fileId = message.voice.file_id
					collectedMessages.push({ type: 'voice', fileId })
				}
			}
		}

		bot.on('message', handleMessage)

		await new Promise((resolve) => {
			const timeout = setTimeout(() => {
				bot.removeListener('message', handleMessage)
				resolve()
			}, 30000)

			bot.on('message', (message) => {
				if (message.chat.id === chatId) {
					clearTimeout(timeout)
					bot.removeListener('message', handleMessage)
					resolve()
				}
			})
		})

		for (const message of collectedMessages) {
			if (!toChatID) {
				if (!globalBuffer.msgQueue) globalBuffer.msgQueue = {}
				if (!globalBuffer.msgQueue[msg.chat.id])
					globalBuffer.msgQueue[msg.chat.id] = []
			} else {
				respondToSelectedClient(bot, msg, toChatID)
			}

			if (message.type === 'text') {
				if (!toChatID) {
					globalBuffer.msgQueue[msg.chat.id].push({
						type: 'text',
						content: message.content,
					})
					if (toSend) {
						await bot.sendMessage(
							GROUP_ID,
							`Message from ${msg.chat.first_name} ${msg.chat.last_name} (ID: ${msg.chat.id}):\n${message.content}`,
							{ parse_mode: 'HTML' }
						)
					}
				} else {
					await bot.sendMessage(
						GROUP_ID,
						`Reply from admin group:\n${message.content}`,
						{ parse_mode: 'HTML' }
					)
				}
			} else {
				if (toSend) {
					const header = !toChatID
						? `Message from ${msg.chat.first_name} ${msg.chat.last_name} (ID: ${msg.chat.id}):`
						: `Reply from admin group:\n`
					await bot.sendMessage(GROUP_ID, header, { parse_mode: 'HTML' })
				}
				if (message.type === 'photo') {
					if (!toChatID)
						globalBuffer.msgQueue[msg.chat.id].push({
							type: 'photo',
							fileId: message.fileId,
						})
					await bot.sendPhoto(GROUP_ID, message.fileId)
				} else if (message.type === 'document') {
					if (!toChatID)
						globalBuffer.msgQueue[msg.chat.id].push({
							type: 'document',
							fileId: message.fileId,
						})
					await bot.sendDocument(GROUP_ID, message.fileId)
				} else if (message.type === 'audio') {
					if (!toChatID)
						globalBuffer.msgQueue[msg.chat.id].push({
							type: 'audio',
							fileId: message.fileId,
						})
					await bot.sendAudio(GROUP_ID, message.fileId)
				} else if (message.type === 'voice') {
					const dirPath = process.env.TEMP_DOWNLOADS_CATALOG
					fs.mkdirSync(dirPath, { recursive: true })
					const filePath = path.join(dirPath, `${message.fileId}.ogg`)
					await downloadFile(bot, message.fileId, filePath)
					if (!toChatID)
						globalBuffer.msgQueue[msg.chat.id].push({ type: 'voice', filePath })
					return filePath
				}
			}
		}

		if (toSend && !toChatID) {
			await bot.sendMessage(chatId, texts[lang]['0_4'], { parse_mode: 'HTML' })
		}
	} catch (err) {
		console.log(err)
		await bot.sendMessage(msg.chat.id, texts[lang]['0_1'])
	}
}

async function blockMenu(bot, msg, lang = 'pl') {
	await bot.sendMessage(msg.chat.id, texts[lang]['block'], {})
}

module.exports.translation = async function (bot, msg, data) {
	const chatId = msg?.chat?.id
	if (!chatId || !msg?.text) return

	const text = selectedByUser[chatId].text
	if (!text || text === '') return

	const lang = selectedByUser[chatId]?.learningLanguage || "pl"
	const answer = await langS.getLangData(text, chatId, bot, lang)
	if (!answer) return null
	return answer
}

async function downloadFile(bot, fileId, dest) {
	const file = await bot.getFile(fileId)
	const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`
	const response = await axios({
		url,
		method: 'GET',
		responseType: 'stream',
	})

	return new Promise((resolve, reject) => {
		const writer = fs.createWriteStream(dest)
		response.data.pipe(writer)
		writer.on('finish', resolve)
		writer.on('error', reject)
	})
}

module.exports.downloadPDF = async function (bot, msg, lang = 'pl', fileN) {
	try {
		const filePath = path.join(__dirname, '../../assets/pdf', `${fileN}.pdf`)
		await bot.sendDocument(
			msg.chat.id,
			filePath,
			{},
			{
				filename: `${lang}.pdf`,
				contentType: 'application/pdf',
			}
		)
	} catch (err) {
		console.log(err)
		await bot.sendMessage(msg.chat.id, texts[lang]['0_1'])
	}
}

module.exports.textTranslation = async function (
	bot,
	msg,
	direction = 'direct'
) {
	await translateS.callTranslate(bot, msg, direction)
}
