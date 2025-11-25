const fs = require('fs')
const path = require('path')
const { selectedByUser } = require('../globalBuffer')
require('dotenv').config()
const usersDataCatalog = process.env.USERS_DATA_CATALOG

module.exports.getFromUserFile = function (chatId) {
  try {
    const filePath = path.join(usersDataCatalog, `${chatId}.json`)
    return JSON.parse(fs.readFileSync(filePath))
  } catch (error) {
    console.log(`${usersDataCatalog}/${chatId}.json not found`)
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
