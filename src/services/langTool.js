const axios = require('axios')
const qs = require('qs')
const { inputLineScene } = require('../controllers/inputLine')

module.exports.check = async function (bot, msg, lang) {
  try {
    const URL_LANG_TOOL = process.env.URL_LANG_TOOL

    let inputLength = 3
    const text = (await inputLineScene(bot, msg)).trim()

    if (!text || text.length < inputLength) {
      await bot.sendMessage(msg.chat.id, 'that`s not enough\n', { parse_mode: 'HTML' })
      return
    }

    const data = qs.stringify({
      language: lang,
      text: text
    })

    const response = await axios.post(URL_LANG_TOOL, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (response.status === 200) {
      const matches = response.data.matches
      const message = formatMatches(matches)
      await bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' })
    } else {
      console.error('Error response when check LANG_TOOL:', response.statusText)
    }
  } catch (error) {
    console.error('Error check LANG_TOOL:', error.message)
  }
}

function formatMatches(matches) {
  if (matches.length === 0) {
    return 'No issues found in the text.'
  }

  let message = '<b>Text Analysis Results:</b>\n\n'
  matches.forEach((match, index) => {
    message += `<b>${index + 1}.</b> ${match.message}\n`
    message += `<i>Context:</i> ${match.context.text}\n`
    message += `<i>Suggestions:</i> ${match.replacements.map(rep => rep.value).join(', ')}\n\n`
  })

  return message
}