const { selectedByUser } = require('../globalBuffer')

module.exports.getFromUserFile = function (chatId) {
  try {
    const filePath = path.join(__dirname, '../../../users/settings', `${chatId}.json`)
    return JSON.parse(fs.readFileSync(filePath))
  } catch (error) {
    console.log(`./users/settings/${chatId} not found`)
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
