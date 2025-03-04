const axios = require('axios')
const fs = require('fs')
const { t_txt } = require('../data/tests_keyboard')
const { selectedByUser } = require('../globalBuffer')
require('dotenv').config()


module.exports.getVoiceFromTxt = async function (text, lang, msg, bot) {
  try {
    const response = await axios.post(`${process.env.SERVER_URL}/g-tts`, {
      query: { "userId": msg.chat.id, "text": text, "lang": lang, "isReturnFile": false }
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })
    let filename = response.data.filename
    const fileStream = fs.createReadStream(filename)

    await bot.sendVoice(msg.chat.id, fileStream)

    return response.data
  } catch (error) {
    console.error(error)
  }
}

module.exports.getLangData = async function (text, msg, bot, lang) {
  try {
    let data = ''
    const response = await axios.post(`${process.env.SERVER_URL}/co-to-jest`, {
      "text": text,
      "userId": msg.chat.id
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })
    selectedByUser[msg.chat.id].words = response.data
    if (response.data && response.data.length > 0) {
      data = response.data.map(item => {
        return createWordCard(item)
      }).join('\n')
      await bot.sendMessage(msg.chat.id, data, { parse_mode: "HTML" })
      return response.data
    } else if (response.data) {
      data = response.data.words.map(item => {
        return createWordCard(item)
      }).join('\n')
      if (data && data !== '')
        await bot.sendMessage(msg.chat.id, data, { parse_mode: "HTML" })
    } else {
      await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_10']}`, { parse_mode: "HTML" })
      return null
    }
  } catch (error) {
    console.error(error)
  }
}


function createWordCard(item) {
  let result = ''
  if (item.word) result += `<b>Word: ${item.word}</b>\n\n`
  if (item.word_forms) result += `<b>Word Forms:</b> ${item.word_forms}\n\n`
  if (item.ru) result += `<b>Russian:</b> ${item.ru}\n\n`
  if (item.uk) result += `<b>Ukrainian:</b> ${item.uk}\n\n`
  if (item.en) result += `<b>English:</b> ${item.en}\n\n`
  if (item.part_of_speech) result += `<b>Part of Speech:</b> ${item.part_of_speech}\n\n`
  if (item.frequency) result += `<b>Frequency:</b> ${item.frequency}\n`
  return result
}

module.exports.SendVoiceOutOpus = async function (bot, msg, lang) {
  const currentOpus = selectedByUser[msg.chat.id]?.currentOpus
  if (!currentOpus || !Object.entries(currentOpus).length) {
    return null
  }
  const text = currentOpus?.example?.example
  if (!text || text === '') {
    await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_10']}`, { parse_mode: "HTML" })
    return
  }
  module.exports.getVoiceFromTxt(text, lang, msg, bot)

}
