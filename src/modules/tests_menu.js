const { testsMenu, t_txt } = require('../data/tests_keyboard')
const { selectedByUser } = require('../globalBuffer')
const testsServices = require('../services/testsServices')
const { sendTgMsg } = require('../services/commonService')

module.exports.OptionsParts1_3 = async function (bot, msg, lang) {
  await bot.sendMessage(msg.chat.id, testsMenu["level1_3"].title[lang], {
    reply_markup: {
      keyboard: testsMenu["level1_3"].buttons[lang],
      resize_keyboard: true
    }
  })
}

module.exports.OptionsParts4_6 = async function (bot, msg, lang) {
  await bot.sendMessage(msg.chat.id, testsMenu["level4_6"].title[lang], {
    reply_markup: {
      keyboard: testsMenu["level4_6"].buttons[lang],
      resize_keyboard: true
    }
  })
}

module.exports.getSubjectsMenu = async function (bot, msg, lang) {
  const subjects = await testsServices.getSubjects()
  const buttons = subjects.map(subject => ({ text: subject.subject }))
  const keyboard = []
  for (let i = 0; i < buttons.length; i += 3) {
    keyboard.push(buttons.slice(i, i + 3))
  }

  await bot.sendMessage(msg.chat.id, t_txt[lang]['0_15'], {
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true
    }
  })
}

module.exports.do1Test = async function (bot, msg, lang) {
  console.log('do1Test', selectedByUser[msg.chat.id]?.OptionsParts1_3)
  const part1_3 = selectedByUser[msg.chat.id]?.OptionsParts1_3 || '2'
  const result = await testsServices.get1Test(part1_3, lang, msg, bot)
  await executeResult(result, bot, msg, lang)
}

module.exports.getOpus = async function (bot, msg, lang) {
  console.log('getOpus', selectedByUser[msg.chat.id]?.OptionsParts4_6)
  const part4_5 = selectedByUser[msg.chat.id]?.OptionsParts4_6 || '4'
  const result = await testsServices.get1Opus(part4_5, lang, msg, bot)
  await showOpus(result, bot, msg, lang)
}

module.exports.putOpus = async function (bot, msg, lang) {
  console.log('getOpus', selectedByUser[msg.chat.id]?.OptionsParts4_6)
  const part4_6 = selectedByUser[msg.chat.id]?.OptionsParts4_6 || '4'
  await testsServices.put1Opus(part4_6, lang, msg, bot)
  selectedByUser[msg.chat.id].currentOpus = null
}


async function showOpus(result, bot, msg, lang) {
  const chatId = msg.chat.id
  if (!selectedByUser[chatId]) selectedByUser[chatId] = {}
  try {
    selectedByUser[chatId].currentOpus = result
    if (!result) {
      await bot.sendMessage(chatId, t_txt[lang]['0_10'], { parse_mode: 'HTML' })
      return
    }
    const subject = result?.example?.subject ? `${t_txt[lang]['0_11']} ${result.example.subject}` : ''
    const exampleText = result?.example?.example ? `${t_txt[lang]['0_12']}\n${result.example.example}` : ''

    const sortedWords = result.words.sort((a, b) => a.word.localeCompare(b.word))

    const wordsText = sortedWords.map(word => {
      return `<b>${word.word}</b>\nEN: ${word.en}\nUK: ${word.uk}\nRU: ${word.ru}`
    }).join('\n\n')

    const message = `${subject}\n\n${exampleText}\n\n${t_txt[lang]['0_13']}\n\n${wordsText}`
    await sendTgMsg(bot, chatId, message)

  } catch (error) {
    console.error(error)
  }
}


async function executeResult(result, bot, msg, lang) {
  const chatId = msg.chat.id

  if (!selectedByUser[chatId]) selectedByUser[chatId] = {}

  try {
    selectedByUser[chatId].currentTest = result

    if (!result?.options && !result?.text) {
      await bot.sendMessage(chatId, `${t_txt[lang]['0_14']}`, { parse_mode: 'HTML' })
      return
    }

    let optionsWithPrawdaFalsz
    if (result?.options) {
      optionsWithPrawdaFalsz = result.options.replace(/prawda\/fałsz/g, 'a) prawda b) fałsz')
    } else {
      optionsWithPrawdaFalsz = 'a) b) c)'
    }

    const options = optionsWithPrawdaFalsz.split(/(?=\s[a-z]\))/).map(option => `<b>${option.trim()}</b>`).join('\n').replace('a)', '\na)')
    const formattedText = result.text.replace(/(\d{1,3}\.)/g, '\n\n$1')

    const updatedOptions = options.replace(/(\d{1,3}\.)/g, '\n\n$1')
    const question = `${t_txt[lang]['0_0']}${formattedText}\n\n${t_txt[lang]['0_1']}${updatedOptions}`
    await sendTgMsg(bot, chatId, question)

    const numberMatchesText = formattedText.match(/\d{1,3}\./g)
    const numberMatchesOptions = updatedOptions.match(/\d{1,3}\./g)
    const numberMatches = [...new Set([...(numberMatchesText || []), ...(numberMatchesOptions || [])])]
    let numbers = numberMatches.map(num => num.trim().replace('.', '')).sort((a, b) => a - b)

    const letterMatchesText = formattedText.match(/[a-z]\)/g)
    const letterMatchesOptions = updatedOptions.match(/[a-z]\)/g)
    const letterMatches = [...new Set([...(letterMatchesText || []), ...(letterMatchesOptions || [])])]
    let letters = letterMatches.map(letter => letter[0]).sort()

    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
    letters = alphabet.filter(letter => {
      const lastLetter = letters[letters.length - 1]
      return letter <= lastLetter && !letters.includes(letter)
    }).concat(letters)

    if (numbers.length === 0 && letters.length > 0) {
      numbers = ['1']
    }

    if (letters.length === 0 && numbers.length > 0) {
      letters = ['a', 'b', 'c']
    }

    const keyboard = []
    numbers.forEach(num => {
      const row = []
      letters.forEach(letter => {
        row.push({ text: `${num}↔${letter}` })
      })
      keyboard.push(row)
    })

    keyboard.push([{ text: `${t_txt[lang]['0_3']}` }])
    keyboard.push([{ text: `${t_txt[lang]['0_2']}` }])

    await bot.sendMessage(chatId, `${t_txt[lang]['0_4']}`, {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
      }
    })

    result.correct = result.correct.replace(/(\d{1,3}\.)\s*prawda/g, '$1 a)').replace(/(\d{1,3}\.)\s*fałsz/g, '$1 b)')

  } catch (error) {
    console.error(error)
  }
}