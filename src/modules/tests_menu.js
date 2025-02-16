const { testsMenu } = require('../data/tests_keyboard')
const { selectedByUser } = require('../globalBuffer')
const testsServices = require('../services/testsServices')

module.exports.OptionsParts1_3 = async function (bot, msg, lang) {
  await bot.sendMessage(msg.chat.id, testsMenu["level1_3"].title[lang], {
    reply_markup: {
      keyboard: testsMenu["level1_3"].buttons[lang],
      resize_keyboard: true
    }
  })
}

module.exports.do1Test = async function (bot, msg) {
  console.log('do1Test', selectedByUser[msg.chat.id]?.OptionsParts1_3)
  const chatId = msg?.chat?.id
  const lang = selectedByUser[chatId]?.language || 'pl'
  const part1_3 = selectedByUser[msg.chat.id]?.OptionsParts1_3 || '2'
  const result = await testsServices.get1Test(part1_3, lang, msg, bot)
  await executeResult(result, bot, msg)
}

module.exports.doAllTests = async function (bot, msg) {
  console.log('do1Test', selectedByUser[msg.chat.id]?.OptionsParts1_3)
  const chatId = msg?.chat?.id
  const lang = selectedByUser[chatId]?.language || 'pl'
  const part1_3 = selectedByUser[msg.chat.id]?.OptionsParts1_3 || '2'
  const result = await testsServices.getAllTests(part1_3, lang, msg, bot)
  await executeResult(result, bot, msg)
}

async function executeResult(result, bot, msg) {
  console.log('executeResult', result)
}