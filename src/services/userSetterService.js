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
      if (langType === 'voiceSynthesisLanguage') {
        selectedByUser[chatId].voiceSynthesisLanguage = lang_
      } else {
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
  if (menuItem === '9_1' || menuItem === '19_1') return 'en'
  if (menuItem === '9_2' || menuItem === '19_2') return 'ru'
  if (menuItem === '9_3' || menuItem === '19_3') return 'uk'
  if (menuItem === '9_4' || menuItem === '19_4') return 'pl'
  if (menuItem === '19_5') return 'de'
  if (menuItem === '19_6') return 'cs'
  if (menuItem === '19_7') return 'es'
  if (menuItem === '19_8') return 'fr'
  if (menuItem === '19_9') return 'it'
  return 'en'
}