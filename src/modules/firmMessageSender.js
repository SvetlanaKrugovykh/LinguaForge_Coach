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
  // Minimal but attractive design: emoji header, clear blocks, readable font
  return `✨ <b>LinguaForge Coach</b> ✨\n\n${text}\n\n📚`
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
