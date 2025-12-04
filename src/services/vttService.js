const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const { bot, selectedByUser } = require('../../src/globalBuffer')
require('dotenv').config()
const { check } = require('./langTool')

function deduplicateSentences(text) {
	const sentences = text.split(/(?<=[.!?])\s+/)
	const seen = new Set()
	return sentences
		.filter((s) => {
			const trimmed = s.trim()
			if (!trimmed) return false
			if (seen.has(trimmed)) return false
			seen.add(trimmed)
			return true
		})
		.join(' ')
}

module.exports.getVTT = async function (filePath, tgId, lang, msg) {
	try {
		if (!fs.existsSync(filePath)) {
			console.error(`Error: File not found at path ${filePath}`)
			return null
		}

		const language =
			selectedByUser[tgId]?.voiceSynthesisLanguage || process.env.LANG4VOICE || 'pl'
		const form = new FormData()
		form.append('file', fs.createReadStream(filePath))
		form.append('clientId', tgId)
		form.append('segment_number', '1')
		form.append('language', language)

		const formHeaders = form.getHeaders()

		const URL_VTT = process.env.SP_TO_TXT_URL
		const response = await axios.post(URL_VTT, form, {
			headers: {
				...formHeaders,
			},
		})
		fs.unlinkSync(filePath)
		let translatedText =
			response?.data?.translated_text || '⚠️❌ [Error: No text returned]'
		if (response?.data?.translated_text) {
			translatedText = deduplicateSentences(response.data.translated_text)
			await bot.sendMessage(msg.chat.id, translatedText)
			await check(bot, msg, lang, translatedText)
		}
		return translatedText
	} catch (error) {
		console.error('Error:', error.message)
		return null
	}
}