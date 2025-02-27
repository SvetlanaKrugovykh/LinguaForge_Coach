const axios = require('axios')
const fs = require('fs')
const { t_txt } = require('../data/tests_keyboard')
const userM = require('./userMemorizeService')
const { selectedByUser } = require('../globalBuffer')

module.exports.get1Test = async function (part1_3, lang, msg, bot) {

  const result = module.exports.getTests(part1_3, lang, msg, bot, '1')
  return result

}

module.exports.get1Opus = async function (part4_6, lang, msg, bot) {
  const result = module.exports.getOpuses(part4_6, lang, msg, bot, '1')
  return result

}

module.exports.put1Opus = async function (part4_6, lang, msg, bot) {
  try {
    const currentOpus = selectedByUser[msg.chat.id]?.currentOpus

    if (!currentOpus || !Object.entries(currentOpus).length) {
      return null
    }

    const response = await axios.post(`${process.env.SERVER_URL}/user-opus-save`, {
      query: { "userId": msg.chat.id, "part": part4_6, "lang": lang, currentOpus, success: 1 }
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })

    return response.data
  } catch (error) {
    console.error(error)
  }
}

module.exports.getTests = async function (part1_3, lang, msg, bot, total) {
  try {
    const response = await axios.post(`${process.env.SERVER_URL}/get-test`, {
      query: { "userId": msg.chat.id, "part1_3": part1_3, "lang": lang, "isReturnFile": false, "total": total }
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })

    if (part1_3 === '1') {
      let filename = response.data.audio
      const fileStream = fs.createReadStream(filename)
      await bot.sendVoice(msg.chat.id, fileStream)
    }

    return response.data
  } catch (error) {
    console.error(error)
  }
}

module.exports.getOpuses = async function (part4_6, lang, msg, bot, total) {
  try {
    const size = selectedByUser[msg.chat.id].size || '1'
    const response = await axios.post(`${process.env.SERVER_URL}/get-opus`, {
      query: { "userId": msg.chat.id, "part4_6": part4_6, "lang": lang, "size": size }
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })

    return response.data
  } catch (error) {
    console.error(error)
  }
}

module.exports.evaluateTest = async function (msg, bot, lang) {
  let success = 0
  success = await module.exports.compareUserAnswer(msg, bot, lang)
  userM.setMemorize(lang, msg, 'part1_3', success)
  selectedByUser[msg.chat.id].currentTest = null
  selectedByUser[msg.chat.id].answerSet = null
}

module.exports.compareUserAnswer = async function (msg, bot, lang) {
  try {
    const answers = selectedByUser[msg.chat.id]?.answerSet
    const currentTest = selectedByUser[msg.chat.id]?.currentTest

    if (!answers || !currentTest || !currentTest.correct) {
      await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_10']}`, { parse_mode: 'HTML' })
      return 0
    }

    const correctAnswers = currentTest.correct

    const correctMap = correctAnswers.split(/(?<=\d\.\s[a-z]\))/).reduce((acc, answer) => {
      const [question, correctOption] = answer.trim().split(/\.\s/)
      if (correctOption) {
        acc[question] = correctOption.replace(')', '').trim()
      }
      return acc
    }, {})

    const discrepancies = answers.filter(answer => {
      const [question, userOption] = answer.split('▫')
      return correctMap[question] !== userOption
    })

    if (discrepancies.length === 0) {
      await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_5']}`, { parse_mode: 'HTML' })
      return 1
    } else {
      await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_6']}`, { parse_mode: 'HTML' })
      const discrepancyMessage = discrepancies.map(discrepancy => {
        const [question, userOption] = discrepancy.split('▫')
        return `${t_txt[lang]['0_7']} ${question}: ${t_txt[lang]['0_8']} ${userOption}, ${t_txt[lang]['0_9']} ${correctMap[question] || 'undefined'}`
      }).join('\n')

      await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_7']}:\n${discrepancyMessage}`, { parse_mode: 'HTML' })
      return 0
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports.saveUserAnswerData = async function (msg, bot, lang, choiceText) {
  if (!selectedByUser[msg.chat.id].answerSet) selectedByUser[msg.chat.id].answerSet = []

  const [questionNumber] = choiceText.split('▫')
  const existingIndex = selectedByUser[msg.chat.id].answerSet.findIndex(answer => answer.startsWith(questionNumber))

  if (existingIndex !== -1) {
    selectedByUser[msg.chat.id].answerSet[existingIndex] = choiceText
  } else {
    selectedByUser[msg.chat.id].answerSet.push(choiceText)
  }
}