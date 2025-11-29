const axios = require('axios')
const fs = require('fs')
const { t_txt } = require('../data/tests_keyboard')
const { selectedByUser } = require('../globalBuffer')
require('dotenv').config()


module.exports.getVoiceFromTxt = async function (text, lang, msg, bot, type = 'audio') {
  try {
    const response = await axios.post(`${process.env.SERVER_URL}/g-tts`, {
      query: { "userId": msg.chat.id, "text": text, "lang": lang, "isReturnFile": false, "type": type },
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
    console.error(error?.message || error)
  }
}

module.exports.getLangData = async function (text, chatId, bot, lang) {
  try {
    let data = ''
    const response = await axios.post(`${process.env.SERVER_URL}/co-to-jest`, {
      "text": text,
      "userId": chatId
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })
    selectedByUser[chatId].words = response.data
    if (response.data && response.data.length > 0) {
      data = response.data.map(item => {
        return createWordCard(item)
      }).join('\n')
      await bot.sendMessage(chatId, data, { parse_mode: "HTML" })
      return response.data
    } else if (response.data) {
      data = response.data.words.map(item => {
        return createWordCard(item)
      }).join('\n')
      if (data && data !== '')
        await bot.sendMessage(chatId, data, { parse_mode: "HTML" })
      return response.data.words
    } else {
      await bot.sendMessage(chatId, `${t_txt[lang]['0_10']}`, { parse_mode: "HTML" })
      return null
    }
  } catch (error) {
    await bot.sendMessage(chatId, `${t_txt[lang]['0_10']}`, { parse_mode: "HTML" })
    return null
  }
}


function createWordCard(item) {
  let result = '✨ <b>Word Card</b> ✨\n'
  result += '───────────────\n'
  if (item.word) result += `🔤 <b>Word:</b> <i>${item.word}</i>\n\n`
  if (item.word_forms) result += `🧩 <b>Forms:</b> <i>${item.word_forms}</i>\n\n`
  if (item.ru) result += `🇷🇺 <b>Russian:</b> <i>${item.ru}</i>\n\n`
  if (item.uk) result += `🇺🇦 <b>Ukrainian:</b> <i>${item.uk}</i>\n\n`
  if (item.en) result += `🇬🇧 <b>English:</b> <i>${item.en}</i>\n\n`
  if (item.part_of_speech) result += `📖 <b>Part of Speech:</b> <i>${item.part_of_speech}</i>\n\n`
  if (item.gender) result += `⚧️ <b>Gender:</b> <i>${item.gender}</i>\n\n`
  if (item.frequency) result += `⚡️ <b>Frequency:</b> <i>${item.frequency}</i>\n\n`
  if (item.explanation) result += `💡 <b>Explanation:</b> <i>${item.explanation}</i>\n\n`
  result += '───────────────'
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

module.exports.SendVoiceOutTest = async function (bot, msg, lang) {
  const currentTest = selectedByUser[msg.chat.id]?.currentTest
  if (!currentTest || !Object.entries(currentTest).length) {
    return null
  }
  const text = currentTest?.text + ' ' + currentTest?.options
  if (!text || text === '') {
    await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_10']}`, { parse_mode: "HTML" })
    return
  }
  module.exports.getVoiceFromTxt(text, lang, msg, bot)

}
