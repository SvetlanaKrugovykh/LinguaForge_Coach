const axios = require('axios')
const qs = require('qs')
const { inputLineScene } = require('../controllers/inputLine')
const { selectedByUser } = require('../globalBuffer')
const prompts = require('../data/prompts')
require('dotenv').config()

module.exports.check = async function (bot, msg, lang) {
  try {
    let inputLength = 3
    const text = (await inputLineScene(bot, msg)).trim()
    const voiceSynthesisLanguage = selectedByUser[msg?.chat?.id]?.voiceSynthesisLanguage || null

    if (!voiceSynthesisLanguage) return

    if (!text || text.length < inputLength) {
      await bot.sendMessage(msg.chat.id, 'that`s not enough\n', { parse_mode: 'HTML' })
      return
    }

    const response = await ollamaRequest('language', {
      text: text,
      language: voiceSynthesisLanguage,
      native_language: lang
    })

    const { sendFirmMessage } = require('../modules/firmMessageSender')
    await sendFirmMessage(bot, msg.chat.id, response, { parse_mode: 'HTML' })
  } catch (error) {
    console.error('Error check LANG_TOOL:', error.message)
  }
}

async function ollamaRequest(promptName, promptParams) {
  const URL_LANG_TOOL = process.env.URL_LANG_TOOL
  const promptText = prompts[promptName](promptParams)
  const response = await axios.post(
    URL_LANG_TOOL,
    {
      model: 'qwen2:7b',
      prompt: promptText
    },
    { headers: { 'Content-Type': 'application/json' } }
  )
  let resultText = ''
  if (typeof response.data === 'string') {
    response.data.split('\n').forEach(line => {
      try {
        const obj = JSON.parse(line)
        if (obj.response) resultText += obj.response
      } catch (e) { }
    })
  } else if (response.data.response) {
    resultText = response.data.response
  }

  return resultText.trim()

}
