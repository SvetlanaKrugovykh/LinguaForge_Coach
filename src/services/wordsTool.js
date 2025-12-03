const axios = require('axios')
const prompts = require('../data/prompts')
const { sendFirmMessage } = require('../modules/firmMessageSender')
require('dotenv').config()

async function ollamaRequest(promptName, promptParams) {
  const URL_LANG_TOOL = process.env.URL_LANG_TOOL
  const promptText = prompts[promptName](promptParams)
  const response = await axios.post(
    URL_LANG_TOOL,
    {
      model: 'qwen2:7b',
      prompt: promptText,
      temperature: Number(process.env.LANG_TOOL_TEMPERATURE) || 0.5
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

module.exports.analyzeWord = async function (bot, chatId, wordData) {
  try {
    const response = await ollamaRequest('wordAnalysis', wordData)
    await sendFirmMessage(bot, chatId, response, { parse_mode: 'HTML' })
  } catch (error) {
    console.error('Error in analyzeWord:', error.message)
  }
}
