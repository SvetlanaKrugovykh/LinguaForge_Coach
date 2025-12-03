const { buttonsConfig } = require('../data/keyboard')
const { testsMenu } = require('../data/tests_keyboard')
const menu = require('../modules/common_menu')
const tests = require('../modules/tests_menu')
const { textInput } = require('../modules/common_functions')
const langS = require('../services/langServerServices')
const { payNow } = require('../controllers/payments')
const { globalBuffer, selectedByUser } = require('../globalBuffer')
const { pinLanguage } = require('../services/userSetterService')
const { getFromUserFile } = require('../services/userGetterServices')
const evS = require('../services/evaluationService')
const mem = require('../services/memoryService')
const dsa = require('../services/textAnalyze')
const wordsTool = require('../services/wordsTool')

require('dotenv').config()

function getCallbackData(text) {
	try {
		for (const buttonSet of Object.values(buttonsConfig)) {
			for (const langButtons of Object.values(buttonSet.buttons)) {
				for (const buttonRow of langButtons) {
					for (const button of buttonRow) {
						if (button.text === text) {
							return button.callback_data
						}
					}
				}
			}
		}
		for (const buttonSet of Object.values(testsMenu)) {
			for (const langButtons of Object.values(buttonSet.buttons)) {
				for (const buttonRow of langButtons) {
					for (const button of buttonRow) {
						if (button.text === text) {
							return button.callback_data
						}
					}
				}
			}
		}
		return null
	} catch (error) {
		console.log(error)
	}
}

async function handler(bot, msg) {
	const chatId = msg?.chat?.id
	let answer = ''
	if (globalBuffer[chatId] === undefined) globalBuffer[chatId] = {}

	if (globalBuffer[chatId]?.platform && globalBuffer[chatId]?.senderId) {
		console.log(
			`Platform: ${globalBuffer[chatId]?.platform}. SenderID: ${globalBuffer[chatId]?.senderId}`
		)

		await sendToPlatform(
			globalBuffer[chatId].platform,
			globalBuffer[chatId].senderId,
			msg
		)

		delete globalBuffer[chatId].platform
		delete globalBuffer[chatId].senderId
		return
	}

	if (!chatId || !msg?.text) return

	const data = getCallbackData(msg.text)
	if (!data) return

  if (!selectedByUser[chatId]) 	selectedByUser[chatId] = await require('../services/userInitializeService').initializeUserSettings(chatId)

	if (!globalBuffer[chatId]) globalBuffer[chatId] = {}
	let lang = selectedByUser[chatId]?.nativeLanguage || 'pl'
	let menuLang = selectedByUser[chatId]?.menuLanguage || 'pl'
	let synthesisLang = selectedByUser[chatId]?.voiceSynthesisLanguage || 'pl'
	let learningLanguage = selectedByUser[chatId]?.learningLanguage || 'pl'

	const subj__ = 'Subject:' + selectedByUser[chatId]?.subject || ''

	console.log('The choice is:', data)
	const rightmostChar = data.slice(-1)

	switch (data) {
		case '7_0':
			await textInput(bot, msg, data)
			await menu.textTranslation(bot, msg, 'reverse')
			break
		case '6_9':
			await textInput(bot, msg, data)
			await menu.textTranslation(bot, msg, 'direct')
			break
		case '0_1':
			await textInput(bot, msg, data)
			await menu.commonChoice(bot, msg)
			break
		case '0_2':
			await menu.notTextScene(bot, msg)
			break
		case '0_3':
		case '0_4':
			await menu.commonStartMenu(bot, msg, true)
			break
		case '0_5':
			selectedByUser[chatId].text = ''
			await textInput(bot, msg, data)
			answer = await menu.translation(bot, msg, data)
			if (answer && Array.isArray(answer) && answer[0]) {
				const wordData = {
					word: answer[0].word || "",
					wordForms: answer[0].word_forms || "",
					russian: answer[0].ru || "",
					ukrainian: answer[0].uk || "",
					english: answer[0].en || "",
					partOfSpeech: answer[0].part_of_speech || "",
					gender: answer[0].gender || "-",
					language: learningLanguage,
					explain_language: lang,
				}
				await wordsTool.analyzeWord(bot, msg.chat.id, wordData)
			}
			if (answer) await menu.wordPinMenu(bot, msg, lang)
			selectedByUser[chatId].text = ''
			break
		case '0_6':
			if (!selectedByUser[chatId].text || selectedByUser[chatId].text === '') {
				await menu.commonStartMenu(bot, msg, true)
				return
			} else {
				const lang4Voice =
					selectedByUser[chatId]?.voiceSynthesisLanguage ||
					process.env.LANG4VOICE ||
					'pl'
				await langS.getVoiceFromTxt(
					selectedByUser[chatId].text,
					lang4Voice,
					msg,
					bot
				)
			}
			break
		case '0_96':
			if (!selectedByUser[chatId].text || selectedByUser[chatId].text === '') {
				await menu.commonStartMenu(bot, msg, true)
				return
			} else {
				const lang4Voice =
					selectedByUser[chatId]?.voiceSynthesisLanguage ||
					process.env.LANG4VOICE ||
					'pl'
				await langS.getVoiceFromTxt(
					selectedByUser[chatId].text,
					lang4Voice,
					msg,
					bot,
					'Dictation'
				)
			}
			break
		case '0_7':
			await menu.commonTestsMenu(bot, msg, true)
			break
		case '0_8':
			await menu.settingsMenu(bot, msg, menuLang)
			break
		case '0_9':
			if (selectedByUser[chatId]?.changed) return
			pinLanguage(data, msg)
			await menu.settingsMenu(bot, msg, menuLang)
			break
		case '0_16':
			answer = await langS.getLangData(subj__, msg.chat.id, bot, lang)
			if (answer) await menu.wordPinMenu(bot, msg, menuLang)
			break
		case '1_1':
			selectedByUser[chatId].changed = false
			await menu.downloadPDF(bot, msg, menuLang, 'pl')
			break
		case '1_2':
			selectedByUser[chatId].changed = false
			await menu.chooseLanguageMenu(bot, msg, 'nativeLanguage')
			break
		case '11_2':
			selectedByUser[chatId].changed = false
			await menu.chooseLanguageMenu(bot, msg, 'voiceSynthesisLanguage')
			break
		case '22_2':
			selectedByUser[chatId].changed = false
			await menu.chooseLanguageMenu(bot, msg, 'learningLanguage')
			break
		case '32_2':
			selectedByUser[chatId].changed = false
			await menu.chooseLanguageMenu(bot, msg, 'menuLanguage')
			break
		case '2_1':
		case '2_2':
		case '2_3':
			selectedByUser[chatId].currentTest = {}
			selectedByUser[chatId].answerSet = []
			selectedByUser[chatId].OptionsParts1_3 = rightmostChar
			await tests.OptionsParts1_3(bot, msg, menuLang)
			break
		case '2_4':
		case '2_5':
			selectedByUser[chatId].currentOpus = {}
			selectedByUser[chatId].answerSet = []
			selectedByUser[chatId].OptionsParts4_6 = rightmostChar
			await tests.OptionsParts4_6(bot, msg, menuLang)
			break
		case '2_6':
			selectedByUser[chatId].currentOpus = {}
			selectedByUser[chatId].answerSet = []
			selectedByUser[chatId].OptionsParts4_6 = rightmostChar
			await tests.getSubjectsMenu(bot, msg, menuLang)
			break
		case '3_1':
		case '3_2':
		case '3_3':
			await tests.do1Test(bot, msg, menuLang)
			break
		case '5_1':
		case '5_2':
			selectedByUser[chatId].size = rightmostChar
			await tests.getOpus(bot, msg, menuLang)
			break
		case '5_3':
			await tests.putOpus(bot, msg, menuLang)
			break
		case '5_4':
			await evS.gotoEvaluate(
				bot,
				msg,
				menuLang,
				selectedByUser[chatId].OptionsParts4_6
			)
			break
		case '7_1':
      await evS.gotoEvaluate(bot, msg, learningLanguage,'5')
      break      
		case '7_2':
      await evS.gotoEvaluate(bot, msg, learningLanguage,'4')
			break
		case '5_5':
			await langS.SendVoiceOutOpus(bot, msg, menuLang)
			break
		case '5_33':
			await tests.putWord(bot, chatId, menuLang)
			break
		case '5_34':
			await mem.doWordMemorize(msg)
			break
		case '9_1':
		case '9_2':
		case '9_3':
		case '9_4':
		case '9_5':
		case '9_6':
		case '9_7':
		case '9_8':
		case '9_9':
			pinLanguage(data, msg, 'nativeLanguage')
			break
		case '19_1':
		case '19_2':
		case '19_3':
		case '19_4':
		case '19_5':
		case '19_6':
		case '19_7':
		case '19_8':
		case '19_9':
			pinLanguage(data, msg, 'voiceSynthesisLanguage')
			break
		case '29_1':
		case '29_2':
		case '29_3':
		case '29_4':
		case '29_5':
		case '29_6':
		case '29_7':
		case '29_8':
		case '29_9':
			pinLanguage(data, msg, 'learningLanguage')
			break
		case '39_1':
		case '39_2':
		case '39_3':
		case '39_4':
		case '39_5':
		case '39_6':
		case '39_7':
		case '39_8':
		case '39_9':
			pinLanguage(data, msg, 'menuLanguage')
			break
		case 'pay_now':
			await payNow(bot, msg, menuLang)
			break
		case 'download_info':
			await menu.downloadPDF(bot, msg, menuLang, 'regulamin')
			break
		default:
			await menu.commonStartMenu(bot, msg, true)
	}
}

module.exports = { handler }
