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
  if (msg.text.startsWith('platform:')) {
    console.log('Received platform message:', msg.text)
    await menu.commonStartMenu(bot, msg, true)
  }
})

bot.on('callback_query', async (callbackQuery) => {
  try {
    const chatId = callbackQuery.message.chat.id
    await bot.answerCallbackQuery(callbackQuery.id)
    const action = callbackQuery.data
    const msg = callbackQuery.message
    const inlineKeyboard = msg.reply_markup.inline_keyboard
    const text = inlineKeyboard[0][0].text
    const platforms = text.match(/platform:\s(\w+)/)[1]
    const senderIdMatch = text.match(/sender_id:\s(\d+)/)
    const senderId = senderIdMatch ? senderIdMatch[1] : null
    const platform = platforms ? platforms : 'facebook'
    if (!senderId) {
      console.log('sender_id not found:', text)
      return
    }
    console.log('Callback query received:', action)

    if (globalBuffer[senderId] === undefined) {
      globalBuffer[senderId] = {}
      if (platform !== 'whatsapp') Persistent.sendWelcomeMessage(senderId)
    } else {
      if (platform !== 'whatsapp') Persistent.sendMultipleChoice(senderId)
    }

    if (action === 'reply') {
      await bot.sendMessage(
        msg.chat.id,
        `✅ Input reply message for: \nplatform: ${platform}\nsender_id: ${senderId}`
      )
      if (globalBuffer[chatId] === undefined) globalBuffer[chatId] = {}
      globalBuffer[chatId].platform = platform
      globalBuffer[chatId].senderId = senderId
    } else if (action === 'decline') {
      await bot.sendMessage(
        msg.chat.id,
        `❌ Decline message for: \nplatform: Facebook\nsender_id: ${senderId}`
      )
    } else {
      console.log('Unknown action:', action)
    }
  } catch (error) { console.log(error) }
})

module.exports = { bot }
