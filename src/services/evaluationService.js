const vtt = require('./vttService')
const langT = require('./langTool')
const menu = require('../modules/common_menu')

module.exports.gotoEvaluate = async function (bot, msg, lang, part = '') {
  let filePath
  let response

  switch (part) {
    case '4':
      await langT.check(bot, msg, lang)
      break
    case '5':
      filePath = await menu.notTextScene(bot, msg, 'pl', false, true)
      response = await vtt.getVTT(filePath)
      if (response) {
        await bot.sendMessage(msg.chat.id, response)
      }
      break
    default:
      await menu.commonStartMenu(bot, msg, true)
  }

}