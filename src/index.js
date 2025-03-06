const { handler } = require('./controllers/switcher')
const { isThisGroupId } = require('./modules/bot')
const { bot } = require('./globalBuffer')
const menu = require('./modules/common_menu')
const testS = require('./services/testsServices')
const { globalBuffer } = require('./globalBuffer')
const getU = require('./services/userGetterServices')
const cron = require('node-cron')
const mem = require('./services/memoryService')


bot.on('message', async (msg) => {

  if (await isThisGroupId(bot, msg.chat.id, msg)) return

  if (msg.text === '/start') {
    console.log(new Date())
    console.log(msg.chat)
    await menu.commonStartMenu(bot, msg, true)
  } else {
    await handler(bot, msg, undefined)
  }
})

bot.on('text', async (msg) => {

  const lang = getU.getLanguage(msg.chat.id)

  if (msg.text.includes('↔')) {
    await testS.saveUserAnswerData(msg, bot, lang, msg.text)
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
})

bot.on('callback_query', async (callbackQuery) => {
  try {
    const chatId = callbackQuery.message.chat.id
    await bot.answerCallbackQuery(callbackQuery.id)
    const action = callbackQuery.data
    const msg = callbackQuery.message
    console.log('Callback query received:', action)

    if (globalBuffer[chatId] === undefined) globalBuffer[chatId] = {}

  } catch (error) { console.log(error) }
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

cron.schedule('0 9-22 * * *', () => {
  mem.checkAndSendReminders()
})

module.exports = { bot }
