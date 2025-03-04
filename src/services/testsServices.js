const axios = require('axios')
const fs = require('fs')
const { t_txt } = require('../data/tests_keyboard')
const userM = require('./userMemorizeService')
const { selectedByUser } = require('../globalBuffer')
const { sendTgMsg } = require('./commonService')
const testM = require('../modules/tests_menu')

module.exports.get1Test = async function (part1_3, lang, msg, bot) {

  const result = module.exports.getTests(part1_3, lang, msg, bot, '1')
  return result

}

module.exports.getSubjects = async function () {
  try {
    const response = await axios.post(`${process.env.SERVER_URL}/get-subjects`, {
      "text": "subject"
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

module.exports.getTxt4Words = async function (msg, bot, lang) {
  const subj = msg.text.replace('📦 ', '')
  const result = await module.exports.get1Opus('6', lang, msg, bot, subj)
  await testM.showOpus(result, bot, msg, lang)
}
module.exports.get1Opus = async function (part4_6, lang, msg, bot, subj = '') {
  const result = module.exports.getOpuses(part4_6, lang, msg, bot, '1', subj)
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

module.exports.getOpuses = async function (part4_6, lang, msg, bot, total, subj = '') {
  try {
    const size = selectedByUser[msg.chat.id].size || '1'
    const response = await axios.post(`${process.env.SERVER_URL}/get-opus`, {
      query: { "userId": msg.chat.id, "part4_6": part4_6, "lang": lang, "size": size, "subject": subj }
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
    const answers = selectedByUser[msg.chat.id]?.answerSet || []
    const currentTest = selectedByUser[msg.chat.id]?.currentTest

    if (!currentTest || !currentTest.correct) {
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

    const explanations = currentTest.explanation ? currentTest.explanation.split('. ').reduce((acc, explanation, index) => {
      const questionNumber = (index + 1).toString()
      const [_, explanationText] = explanation.split(' - ')
      acc[questionNumber] = explanationText ? explanationText.trim() : ''
      return acc
    }, {}) : {}

    Object.keys(correctMap).forEach(question => {
      if (!explanations[question]) {
        explanations[question] = ''
      }
    })

    const discrepancies = Object.keys(correctMap).filter(question => {
      const userAnswer = answers.find(answer => answer.startsWith(question))
      if (!userAnswer) return true
      const [, userOption] = userAnswer.split('↔')
      return correctMap[question] !== userOption
    })

    if (discrepancies.length === 0) {
      await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_5']}`, { parse_mode: 'HTML' })
      return 1
    } else {
      await bot.sendMessage(msg.chat.id, `${t_txt[lang]['0_6']}`, { parse_mode: 'HTML' })
      const discrepancyMessage = discrepancies.map(question => {
        const userAnswer = answers.find(answer => answer.startsWith(question))
        const userOption = userAnswer ? userAnswer.split('↔')[1] : '⁉️'
        const explanation = explanations[question] ? `\n${t_txt[lang]['0_15']} ${explanations[question]}` : ''
        return `${t_txt[lang]['0_7']} ${question}: ${t_txt[lang]['0_8']} ${userOption}, ${t_txt[lang]['0_9']} ${correctMap[question]}${explanation}`
      }).join('\n\n')

      await sendTgMsg(bot, msg.chat.id, `${t_txt[lang]['0_7']}:\n${discrepancyMessage}`)
      return 0
    }
  } catch (error) {
    console.error(error)
  }
}

module.exports.saveUserAnswerData = async function (msg, bot, lang, choiceText) {
  if (!selectedByUser[msg.chat.id].answerSet) selectedByUser[msg.chat.id].answerSet = []

  const [questionNumber] = choiceText.split('↔')
  const existingIndex = selectedByUser[msg.chat.id].answerSet.findIndex(answer => answer.startsWith(questionNumber))

  if (existingIndex !== -1) {
    selectedByUser[msg.chat.id].answerSet[existingIndex] = choiceText
  } else {
    selectedByUser[msg.chat.id].answerSet.push(choiceText)
  }
}