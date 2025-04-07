const axios = require('axios')
const { textInput } = require('../modules/common_functions')
const { selectedByUser } = require('../globalBuffer')
const { AI_questions } = require('../data/toAIqw')
require('dotenv').config()


module.exports.deepSeekAnylize = async function (bot, msg, lang) {
  try {

    selectedByUser[msg.chat.id].text = ''
    await textInput(bot, msg)
    const text = selectedByUser[msg.chat.id].text
    const request_text = AI_questions['AI_0'] + text

    const response = await queryDeepSeek(request_text)

    if (!response) {
      await bot.sendMessage(msg.chat.id, 'Bląd po odpowiedzi API. Proszę spróbować ponownie.', { reply_to_message_id: msg.message_id })
      return
    }
    return response
  } catch (error) {
    console.error('Error analyzing text:', error)
    throw error
  }
}


async function queryDeepSeek(prompt) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions', // предположительный эндпоинт
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
      }
    )
    return response.data.choices[0].message.content
  } catch (error) {
    console.error("Ошибка API:", error.response?.data || error.message)
    return null
  }
}

