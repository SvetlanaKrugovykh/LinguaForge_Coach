const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function splitMessage(text, maxLen = 4000) {
  const parts = []
  let current = 0
  while (current < text.length) {
    parts.push(text.slice(current, current + maxLen))
    current += maxLen
  }
  return parts
}

function firmDesign(text) {
  // Minimal but attractive design: colored header, clear blocks, emoji, readable font
  return `[1m[36m[44m\u2728 LinguaForge Coach \u2728\u001b[0m\n\n${text}\n\n\uD83D\uDCDA` // Telegram ignores ANSI, but header/emoji for style
}

module.exports.sendFirmMessage = async function (bot, chatId, text, options = { parse_mode: 'HTML' }) {
  if (!text || !text.trim()) return // Don't send empty messages

  // Apply design
  const designedText = firmDesign(text.trim())
  const messageParts = splitMessage(designedText, 4000)

  for (const part of messageParts) {
    try {
      await bot.sendMessage(chatId, part, options)
      await delay(2000)
    } catch (error) {
      // Optionally log or handle error
    }
  }
}
