const { testsMenu } = require('../data/tests_keyboard')
const { selectedByUser } = require('../globalBuffer')

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
}