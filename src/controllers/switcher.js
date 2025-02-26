const { buttonsConfig } = require('../data/keyboard')
const { testsMenu } = require('../data/tests_keyboard')
const menu = require('../modules/common_menu')
const tests = require('../modules/tests_menu')
const { textInput } = require('../modules/common_functions')
const langS = require('../services/langServerServices')
const { globalBuffer, selectedByUser } = require('../globalBuffer')
const { pinNativeLanguage } = require('../services/userSetterService')
const { getFromUserFile } = require('../services/userGetterServices')
const evS = require('../services/evaluationService')
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
  } catch (error) { console.log(error) }
}

async function handler(bot, msg) {
  const chatId = msg?.chat?.id
  if (globalBuffer[chatId] === undefined) globalBuffer[chatId] = {}

  if (globalBuffer[chatId]?.platform && globalBuffer[chatId]?.senderId) {
    console.log(`Platform: ${globalBuffer[chatId]?.platform}. SenderID: ${globalBuffer[chatId]?.senderId}`)

    await sendToPlatform(globalBuffer[chatId].platform, globalBuffer[chatId].senderId, msg)

    delete globalBuffer[chatId].platform
    delete globalBuffer[chatId].senderId
    return
  }

  if (!chatId || !msg?.text) return

  const data = getCallbackData(msg.text)
  if (!data) return

  if (!selectedByUser[chatId]) selectedByUser[chatId] = getFromUserFile(chatId)

  if (!globalBuffer[chatId]) globalBuffer[chatId] = {}
  let lang = selectedByUser[chatId]?.language || 'pl'

  console.log('The choice is:', data)
  const rightmostChar = data.slice(-1)

  switch (data) {
    case '0_1':
      await textInput(bot, msg, data)
      await menu.commonChoice(bot, msg, lang)
      break
    case '0_2':
      await menu.notTextScene(bot, msg)
      break
    case '0_3':
      await menu.settingsMenu(bot, msg, lang)
      break
    case '0_6':
      if (!selectedByUser[chatId].text || selectedByUser[chatId].text === '') {
        await menu.commonStartMenu(bot, msg, true)
        return
      } else {
        await langS.getVoiceFromTxt(selectedByUser[chatId].text, 'pl', msg, bot)
      }
      break
    case '0_5':
      selectedByUser[chatId].text = ''
      await textInput(bot, msg, data)
      await menu.translation(bot, msg, data)
      selectedByUser[chatId].text = ''
      break
    case '0_7':
      await menu.commonTestsMenu(bot, msg, true)
      break
    case '0_9':
      if (selectedByUser[chatId]?.changed) return
      pinNativeLanguage(data, msg)
      await menu.settingsMenu(bot, msg, lang)
      break
    case '1_1':
      selectedByUser[chatId].changed = false
      await menu.downloadPDF(bot, msg, lang)
      break
    case '1_2':
      selectedByUser[chatId].changed = false
      await menu.chooseNativeLanguageMenu(bot, msg)
      break
    case '2_1':
    case '2_2':
    case '2_3':
      selectedByUser[chatId].currentTest = {}
      selectedByUser[chatId].answerSet = []
      selectedByUser[chatId].OptionsParts1_3 = rightmostChar
      await tests.OptionsParts1_3(bot, msg, lang)
      break
    case '2_4':
    case '2_5':
    case '2_6':
      selectedByUser[chatId].currentOpus = {}
      selectedByUser[chatId].answerSet = []
      selectedByUser[chatId].OptionsParts4_6 = rightmostChar
      await tests.OptionsParts4_6(bot, msg, lang)
      break
    case '3_1':
    case '3_2':
    case '3_3':
      await tests.do1Test(bot, msg, lang)
      break
    case '5_1':
    case '5_2':
      selectedByUser[chatId].size = rightmostChar
      await tests.getOpus(bot, msg, lang)
      break
    case '5_3':
      await tests.putOpus(bot, msg, lang)
      break
    case '5_4':
      await evS.gotoEvaluate(bot, msg, lang, selectedByUser[chatId].OptionsParts4_6)
      break
    case '5_5':
      await langS.SendVoiceOutOpus(bot, msg, lang)
      break
    case '9_1':
    case '9_2':
    case '9_3':
    case '9_4':
      pinNativeLanguage(data, msg)
      break
    default:
      await menu.commonStartMenu(bot, msg, true)
  }
}

module.exports = { handler }