const vtt = require('./vttService')
const menu = require('../modules/common_menu')

module.exports.gotoEvaluate = async function (bot, msg, lang, part = '') {

  if (part === '5') {
    const filePath = await menu.notTextScene(bot, msg, 'pl', false, true)
    const response = await vtt.getVTT(filePath)
    if (response) {
      await bot.sendMessage(msg.chat.id, response)
    }
  }

}