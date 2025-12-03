const vtt = require('./vttService')
const langT = require('./langTool')
const menu = require('../modules/common_menu')
const { check } = require('./langTool')

module.exports.gotoEvaluate = async function (bot, msg, lang, part = '') {
  let filePath
  let response
  const tgId = msg?.chat?.id || ''
  if (!tgId) return

  switch (part) {
    case '4':
      await langT.check(bot, msg, lang)
      break
    case '5':
      filePath = await menu.notTextScene(bot, msg, 'pl', false, true)
      response = await vtt.getVTT(filePath, tgId)
      break
    default:
      await menu.commonStartMenu(bot, msg, true)
  }

}