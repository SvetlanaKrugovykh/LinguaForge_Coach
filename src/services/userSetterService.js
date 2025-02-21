const fs = require('fs')
const path = require('path')
const { selectedByUser } = require('../globalBuffer')

module.exports.pinNativeLanguage = function (menuItem, msg) {
  try {
    const chatId = msg?.chat?.id
    const lang = module.exports.getLang(menuItem)

    if (chatId && lang) {
      if (!selectedByUser[chatId]) selectedByUser[chatId] = {}
      selectedByUser[chatId].nativeLanguage = lang
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
    const dirPath = path.join(__dirname, '../../../users/settings')
    const filePath = path.join(dirPath, `${chatId}.json`)

    fs.mkdirSync(dirPath, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(selectedByUser[chatId], null, 2))
  } catch (error) {
    console.log('Error pinning to user file:', error)
  }
}


module.exports.getLang = function (menuItem) {
  if (menuItem === '9_1') return 'en'
  if (menuItem === '9_2') return 'ru'
  if (menuItem === '9_3') return 'uk'
  if (menuItem === '9_4') return 'pl'
  return 'en'
}