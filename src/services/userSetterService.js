const fs = require('fs')
const path = require('path')
const { selectedByUser } = require('../globalBuffer')

module.exports.pinNativeLanguage = function (menuItem, msg) {
  try {
    const chatId = msg?.chat?.id
    let lang = 'en'
    if (menuItem === '0_9') lang = 'ru'
    if (menuItem === '0_10') lang = 'pl'

    if (chatId && lang) {
      if (!selectedByUser[chatId]) selectedByUser[chatId] = {}
      selectedByUser[chatId].nativeLanguage = lang
      selectedByUser[chatId].text = ''
      selectedByUser[chatId].changed = true
      console.log(selectedByUser[chatId])
      pinToUserFile(chatId)
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

module.exports.getFromUserFile = function (chatId) {
  try {
    const filePath = path.join(__dirname, '../../../users/settings', `${chatId}.json`)
    return JSON.parse(fs.readFileSync(filePath))
  } catch (error) {
    console.log(`./users/settings/${chatId} not found`)
    return {}
  }
}