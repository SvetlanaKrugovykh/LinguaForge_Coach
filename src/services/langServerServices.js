const axios = require('axios')
const fs = require('fs')
const { bot } = require('../globalBuffer')
const { t_txt } = require('../data/tests_keyboard')
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
    const response = await axios.post(`${process.env.SERVER_URL}/co-to-jest`, {
      "text": text
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })
    if (response.data && response.data.length > 0) {
      let data = response.data.map(item => {
        let result = ''
        if (item.word) result += `<b>Word: ${item.word}</b>\n`
        if (item.word_forms) result += `<b>Word Forms:</b> ${item.word_forms}\n`
        if (item.ru) result += `<b>Russian:</b> ${item.ru}\n`
        if (item.uk) result += `<b>Ukrainian:</b> ${item.uk}\n`
        if (item.en) result += `<b>English:</b> ${item.en}\n`
        if (item.part_of_speech) result += `<b>Part of Speech:</b> ${item.part_of_speech}\n`
        if (item.frequency) result += `<b>Frequency:</b> ${item.frequency}\n`
        if (item.example) result += `<b>Example:</b> ${item.example}\n`
        return result
      }).join('\n')
      await bot.sendMessage(msg.chat.id, data, { parse_mode: "HTML" })
      return response.data
    } else {
      await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_10']}`, { parse_mode: "HTML" })
      return null
    }
  } catch (error) {
    console.error(error)
  }
}