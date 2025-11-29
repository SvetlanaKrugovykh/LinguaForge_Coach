const fs = require('fs')
const path = require('path')
const { selectedByUser } = require('../globalBuffer')
require('dotenv').config()
const usersDataCatalog = process.env.USERS_DATA_CATALOG

module.exports.pinLanguage = function (menuItem, msg, langType = 'nativeLanguage') {
  try {
    const chatId = msg?.chat?.id
    const lang_ = module.exports.getLang(menuItem)

    if (chatId && lang_) {
      if (!selectedByUser[chatId]) selectedByUser[chatId] = {}

      switch (langType) {
        case 'voiceSynthesisLanguage':
          selectedByUser[chatId].voiceSynthesisLanguage = lang_
          break
        case 'nativeLanguage':
          selectedByUser[chatId].nativeLanguage = lang_
          // If menuLanguage is not set, set it to nativeLanguage
          if (!selectedByUser[chatId].menuLanguage) {
            selectedByUser[chatId].menuLanguage = lang_
          }
          break
        case 'learningLanguage':
          selectedByUser[chatId].learningLanguage = lang_;
          // If voiceSynthesisLanguage is not set, set it to learningLanguage
          if (!selectedByUser[chatId].voiceSynthesisLanguage) {
            selectedByUser[chatId].voiceSynthesisLanguage = lang_
          }
          break
        case 'menuLanguage':
          selectedByUser[chatId].menuLanguage = lang_
          break
        default:
          selectedByUser[chatId].nativeLanguage = lang_
      }
      selectedByUser[chatId].text = ''
      selectedByUser[chatId].changed = true
      console.log(selectedByUser[chatId])
      module.exports.pinToUserFile(chatId)
    }
  } catch (err) {
    console.log(err)
    return
  }
}

module.exports.pinToUserFile = function (chatId) {
  try {
    if (!selectedByUser[chatId]) return
    const dirPath = usersDataCatalog
    const filePath = path.join(dirPath, `${chatId}.json`)

    fs.mkdirSync(dirPath, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(selectedByUser[chatId], null, 2))
  } catch (error) {
    console.log('Error pinning to user file:', error)
  }
}


module.exports.getLang = function (menuItem) {
  if (/^[9|19|29|39]_1$/.test(menuItem)) return 'en'
  if (/^[9|19|29|39]_2$/.test(menuItem)) return 'ru'
  if (/^[9|19|29|39]_3$/.test(menuItem)) return 'uk'
  if (/^[9|19|29|39]_4$/.test(menuItem)) return 'pl'
  if (/^[9|19|29|39]_5$/.test(menuItem)) return 'de'
  if (/^[9|19|29|39]_6$/.test(menuItem)) return 'cs'
  if (/^[9|19|29|39]_7$/.test(menuItem)) return 'es'
  if (/^[9|19|29|39]_8$/.test(menuItem)) return 'fr'
  if (/^[9|19|29|39]_9$/.test(menuItem)) return 'it'
  return 'en'
}