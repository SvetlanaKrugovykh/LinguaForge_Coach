const axios = require('axios')
const { text } = require('../data/keyboard')
require('dotenv').config()

module.exports.formPaymentLink = async function (bot, chatId, amount, lang = 'pl') {

  const formPayLinkURL = process.env.FORM_PAY_LINK_URL

  try {
    const response = await axios.post(formPayLinkURL, {
      abbreviation: process.env.ABBREVIATION,
      'payment_code': `${process.env.CONTRACT}_${chatId}`,
      amount
    })

    if (response.status === 200) {
      const currency = 'UAH'
      const description = `TelegramID: ${process.env.CONTRACT}_${chatId}. TOTAL: ${amount}.`
      //TODO save payment link to the database
      return true
    } else {
      await bot.sendMessage(chatId, text[lang]['0_21'], { parse_mode: "HTML" })
      console.error('Error sending message to the Telegram group:',
        response.statusText)
    }
  } catch (error) {
    await bot.sendMessage(chatId, text[lang]['0_21'], { parse_mode: "HTML" })
    console.error('Error sending message to the Telegram group:', error.message)
  }
}


