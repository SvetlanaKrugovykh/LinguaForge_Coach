const { buttonsConfig } = require('../data/keyboard')
const { testsMenu } = require('../data/tests_keyboard')
const menu = require('../modules/common_menu')
const tests = require('../modules/tests_menu')
const { textInput } = require('../modules/common_functions')
const langS = require('../services/langServerServices')
const { globalBuffer, selectedByUser } = require('../globalBuffer')
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
  selectedByUser[chatId].nativeLanguage = 'pl'   //TODO: remove this line after testing
  selectedByUser[chatId].language = 'pl'   //TODO: remove this line after testing
  let lang = selectedByUser[chatId]?.nativeLanguage || 'pl'
  lang = 'pl'   //TODO: remove this line after testing

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
      await textInput(bot, msg, data)
      await menu.translation(bot, msg, data)
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
      await menu.chooseTranslateDirectionMenu(bot, msg)
      break
    case '9_1':
    case '9_2':
    case '9_3':
    case '9_4':
      selectedByUser[chatId].changed = false
      await menu.chooseNativeLanguageMenu(bot, msg)
      break
    case '2_1':
    case '2_2':
    case '2_3':
      selectedByUser[chatId].OptionsParts1_3 = rightmostChar
      await tests.OptionsParts1_3(bot, msg, lang)
      break
    default:
      await menu.commonStartMenu(bot, msg, true)
  }
}

module.exports = { handler }