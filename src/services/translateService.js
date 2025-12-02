const { selectedByUser } = require('../globalBuffer')
const axios = require('axios')
const prompts = require('../data/prompts')
const { sendFirmMessage } = require('../modules/firmMessageSender')
require('dotenv').config()

async function ollamaRequest(promptName, promptParams) {
	const URL_LANG_TOOL = process.env.URL_LANG_TOOL
	const promptText = prompts[promptName](promptParams)
	const response = await axios.post(
		URL_LANG_TOOL,
		{
			model: 'qwen2:7b',
			prompt: promptText,
		},
		{ headers: { 'Content-Type': 'application/json' } }
	)
	let resultText = ''
	if (typeof response.data === 'string') {
		response.data.split('\n').forEach((line) => {
			try {
				const obj = JSON.parse(line)
				if (obj.response) resultText += obj.response
			} catch (e) {}
		})
	} else if (response.data.response) {
		resultText = response.data.response
	}
	return resultText.trim()
}

module.exports.callTranslate = async function (bot, msg, direction = 'direct') {
	try {
		const inputLength = 3
		const text = selectedByUser[msg.chat.id]?.text
		const learningLanguage =
			selectedByUser[msg?.chat?.id]?.learningLanguage || null
		const lang = selectedByUser[msg?.chat?.id]?.nativeLanguage || null

		console.log('learningLanguage:', learningLanguage)
		console.log('lang:', lang)

		if (!learningLanguage) return

		if (!text || text.length < inputLength) {
			await bot.sendMessage(msg.chat.id, 'that`s not enough\n', {
				parse_mode: 'HTML',
			})
			return
		}

		const response = await ollamaRequest('translate', {
			text: text,
			from: direction === 'direct' ? learningLanguage : lang,
			to: direction === 'direct' ? lang : learningLanguage,
			// explain_language: lang
		})

		await sendFirmMessage(bot, msg.chat.id, response, { parse_mode: 'HTML' })
	} catch (error) {
		console.error('Error in callTranslate:', error.message)
	}
}

module.exports.callTranslate_OLD = async function (bot, msg) {
	try {
		const text = selectedByUser[msg.chat.id]?.text
		const direction = `${selectedByUser[msg.chat.id]?.nativeLanguage}_${
			selectedByUser[msg.chat.id]?.direction
		}`

		if (!text || !direction || text.length < 7 || direction.length < 5) {
			console.log('Invalid text or direction:', { text, direction })
			return
		}

		let translatedText = text
		const directions = [`pl_en`, `en_ru`]
		const startTime = Date.now()
		console.log(`${startTime}: JSON request start`)

		for (const dir of directions) {
			const response = await axios.post(process.env.TRANSLATOR_URL, {
				direction: dir,
				text: translatedText,
			})

			translatedText =
				response.data.translated_text?.[0] ||
				response.data?.replyData?.translated_text?.[0] ||
				'Default value if not found'

			console.log(translatedText)
			await bot.sendMessage(msg.chat.id, `<b>${dir}:</b>\n${translatedText}`, {
				parse_mode: 'HTML',
			})
		}

		const endTime = Date.now()
		console.log(`${endTime}: JSON request duration: ${endTime - startTime}ms`)
	} catch (error) {
		await bot.sendMessage(msg.chat.id, `Sorry. Service under construction`, {
			parse_mode: 'HTML',
		})
		console.error('Error translating text:', error)
	}
}
