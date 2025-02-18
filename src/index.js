const { handler } = require('./controllers/switcher')
const { isThisGroupId } = require('./modules/bot')
const { bot } = require('./globalBuffer')
const menu = require('./modules/common_menu')
const tests = require('./modules/tests_menu')
const { globalBuffer } = require('./globalBuffer')

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
  if (msg.text.includes('🔸')) {
    await tests.do1Test(bot, msg)
    return
  }
  if (msg.text.includes('🔶')) {
    await tests.doAllTests(bot, msg)
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

module.exports = { bot }
