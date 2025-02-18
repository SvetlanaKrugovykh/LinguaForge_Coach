const fs = require('fs')
const path = require('path')
const { selectedByUser } = require('../globalBuffer')

module.exports.getFromUserFile = function (chatId) {
  try {
    const SLASH = process.env.SLASH
    const filePath = path.resolve(process.cwd(), `${SLASH}users${SLASH}settings`, `${chatId}.json`)
    return JSON.parse(fs.readFileSync(filePath))
  } catch (error) {
    console.log(`users/settings/${chatId}.json not found`)
    return {}
  }
}

module.exports.getNativeLanguage = function (chatId) {
  if (!selectedByUser[chatId]) selectedByUser[chatId] = module.exports.getFromUserFile(chatId)
  return selectedByUser[chatId]?.nativeLanguage || 'pl'
}

module.exports.getLanguage = function (chatId) {
  if (!selectedByUser[chatId]) selectedByUser[chatId] = module.exports.getFromUserFile(chatId)
  return selectedByUser[chatId]?.language || 'pl'
}
