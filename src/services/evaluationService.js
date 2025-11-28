const vtt = require('./vttService')
const langT = require('./langTool')
const menu = require('../modules/common_menu')
const { check } = require('./langTool')

function deduplicateSentences(text) {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const seen = new Set()
  return sentences.filter(s => {
    const trimmed = s.trim()
    if (!trimmed) return false
    if (seen.has(trimmed)) return false
    seen.add(trimmed)
    return true
  }).join(' ')
}

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
      if (response) {
        const deduped = deduplicateSentences(response)
        await bot.sendMessage(msg.chat.id, deduped)
        await check(bot, msg, lang, deduped)
      }
      break
    default:
      await menu.commonStartMenu(bot, msg, true)
  }

}