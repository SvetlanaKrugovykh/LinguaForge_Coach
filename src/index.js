const { handler } = require('./controllers/switcher')
const { isThisGroupId } = require('./modules/bot')
const { bot } = require('./globalBuffer')
const menu = require('./modules/common_menu')
const testS = require('./services/testsServices')
const langS = require('./services/langServerServices')
const { globalBuffer } = require('./globalBuffer')
const getU = require('./services/userGetterServices')
const cron = require('node-cron')
const mem = require('./services/memoryService')
const { handleAdminResponse } = require('./modules/adminMessageHandler')
const fs = require('fs')
const path = require('path')
require('dotenv').config()


const tempDownloadsCatalog = process.env.TEMP_DOWNLOADS_CATALOG
const tempCatalog = process.env.TEMP_CATALOG

if (tempDownloadsCatalog) {
  fs.promises.mkdir(tempDownloadsCatalog, { recursive: true })
    .then(() => console.log(`Directory created or already exists: ${tempDownloadsCatalog}`))
    .catch(err => console.error(`Failed to create directory: ${tempDownloadsCatalog}`, err))
}

if (tempCatalog) {
  fs.promises.mkdir(tempCatalog, { recursive: true })
    .then(() => console.log(`Directory created or already exists: ${tempCatalog}`))
    .catch(err => console.error(`Failed to create directory: ${tempCatalog}`, err))
}

bot.on('message', async (msg) => {

  if (await isThisGroupId(bot, msg.chat.id, msg)) return

  if (msg.text === '/start') {
await require("./services/userInitializeService").initializeUserSettings(
	msg.chat.id
)    
    console.log(new Date())
    console.log(msg.chat)
    await menu.commonStartMenu(bot, msg, true)
  } else {
    await handler(bot, msg, undefined)
  }
})

bot.on('text', async (msg) => {

  const lang = getU.getMenuLanguage(msg.chat.id)

  if (msg.text.includes('▫')) {
    await testS.saveUserAnswerData(msg, bot, lang, msg.text)
    return
  }
  if (msg.text.includes('✍')) {
    await handleAdminResponse(bot, msg)
    return
  }
  if (msg.text.includes('📦')) {
    await testS.getTxt4Words(msg, bot, lang)
    return
  }
  if (msg.text.includes('➡️')) {
    await menu.commonTestsMenu(bot, msg, true, lang)
    return
  }
  if (msg.text.includes('❔')) {
    await testS.evaluateTest(msg, bot, lang)
  }
  if (msg.text.includes('🔎')) {
    await testS.gotFormattedTask(bot, msg, lang)
  }
  if (msg.text.includes('📞')) {
    await langS.SendVoiceOutTest(bot, msg, lang)
  }
})

bot.on('callback_query', async (callbackQuery) => {
  try {
    const chatId = callbackQuery.message.chat.id
    await bot.answerCallbackQuery(callbackQuery.id)
    const action = callbackQuery.data
    const msg = callbackQuery.message
    console.log('Callback query received:', action)

    if (globalBuffer[chatId] === undefined) globalBuffer[chatId] = {}

    if (action.startsWith('select_client_')) {
      const targetChatId = action.split('_')[2]
      console.log(`Target client ID: ${targetChatId}`)
      await menu.notTextScene(bot, msg, "en", true, false, targetChatId)
    }
  } catch (error) {
    console.log(error)
  }
})


bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code)
  if (error.code === 'ECONNRESET') {
    console.log('Connection reset by peer, restarting polling...')
    bot.stopPolling()
      .then(() => bot.startPolling())
      .catch(err => console.error('Failed to restart polling:', err))
  }
})


cron.schedule('0 * * * *', () => {
  const currentHour = new Date().getHours()
  if (currentHour >= 9 && currentHour < 22) {
    mem.checkAndSendReminders()
  }
})

module.exports = { bot }
