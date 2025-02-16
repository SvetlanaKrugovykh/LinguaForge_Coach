const { testsMenu, t_txt } = require('../data/tests_keyboard')
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
  await executeResult(result, bot, msg, lang)
}

module.exports.doAllTests = async function (bot, msg) {
  console.log('do1Test', selectedByUser[msg.chat.id]?.OptionsParts1_3)
  const chatId = msg?.chat?.id
  const lang = selectedByUser[chatId]?.language || 'pl'
  const part1_3 = selectedByUser[msg.chat.id]?.OptionsParts1_3 || '2'
  const result = await testsServices.getAllTests(part1_3, lang, msg, bot)
  // await executeResult(result, bot, msg, lang)
}

async function executeResult(result, bot, msg, lang) {
  const chatId = msg.chat.id

  if (!selectedByUser[chatId]) selectedByUser[chatId] = {}
  selectedByUser[chatId].currentTest = result

  const options = result.options.split(/(?=\s[a-z]\))/).map(option => `<b>${option.trim()}</b>`).join('\n').replace('a)', '\na)')

  const question = `${t_txt[lang]['0_0']}\n${result.text}\n\n${t_txt[lang]['0_1']}\n${options}`
  await bot.sendMessage(chatId, question, { parse_mode: 'HTML' })
}

