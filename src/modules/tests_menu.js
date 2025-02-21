const { testsMenu, t_txt } = require('../data/tests_keyboard')
const { selectedByUser } = require('../globalBuffer')
const testsServices = require('../services/testsServices')

module.exports.OptionsParts1_3 = async function (bot, msg, lang) {
  await bot.sendMessage(msg.chat.id, testsMenu["level1_3"].title[lang], {
    reply_markup: {
      keyboard: testsMenu["level1_3"].buttons[lang],
      resize_keyboard: true
    }
  })
}

module.exports.OptionsParts4_5 = async function (bot, msg, lang) {
  await bot.sendMessage(msg.chat.id, testsMenu["level4_5"].title[lang], {
    reply_markup: {
      keyboard: testsMenu["level4_5"].buttons[lang],
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
  console.log('getOpus', selectedByUser[msg.chat.id]?.OptionsParts4_5)
  const part4_5 = selectedByUser[msg.chat.id]?.OptionsParts4_5 || '4'
  const result = await testsServices.get1Opus(part4_5, lang, msg, bot)
  await showOpus(result, bot, msg, lang)
}

async function showOpus(result, bot, msg, lang) {
  const chatId = msg.chat.id
  if (!selectedByUser[chatId]) selectedByUser[chatId] = {}
  try {
    selectedByUser[chatId].currentOpus = result

    const subject = result.example.subject ? `${t_txt[lang]['0_11']} ${result.example.subject}` : ''
    const exampleText = result.example.example ? `${t_txt[lang]['0_12']}\n${result.example.example}` : ''

    const sortedWords = result.words.sort((a, b) => a.word.localeCompare(b.word))

    const wordsText = sortedWords.map(word => {
      return `<b>${word.word}</b>\nEN: ${word.en}\nUK: ${word.uk}\nRU: ${word.ru}`
    }).join('\n\n')

    const message = `${subject}\n\n${exampleText}\n\n${t_txt[lang]['0_13']}\n\n${wordsText}`

    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
  } catch (error) {
    console.error(error)
  }
}


async function executeResult(result, bot, msg, lang) {
  const chatId = msg.chat.id

  if (!selectedByUser[chatId]) selectedByUser[chatId] = {}

  try {
    selectedByUser[chatId].currentTest = result

    const options = result.options.split(/(?=\s[a-z]\))/).map(option => `<b>${option.trim()}</b>`).join('\n').replace('a)', '\na)')
    const formattedText = result.text.replace(/(\d{1,3}\.)/g, '\n\n$1')

    const question = `${t_txt[lang]['0_0']}${formattedText}\n\n${t_txt[lang]['0_1']}${options}`
    await bot.sendMessage(chatId, question, { parse_mode: 'HTML' })

    const numberMatches = formattedText.match(/\d{1,3}\./g)
    const numbers = numberMatches ? numberMatches.map(num => num.trim().replace('.', '')) : []
    const letters = result.options.match(/[a-z]\)/g).map(letter => letter[0])

    const keyboard = []
    numbers.forEach(num => {
      const row = []
      letters.forEach(letter => {
        row.push({ text: `${num} - ${letter}` })
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
  } catch (error) {
    console.error(error)
  }
}
