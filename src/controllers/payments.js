require('dotenv').config()
const { inputLineScene } = require('../controllers/inputLine')
const { texts } = require('../data/keyboard')
const { formPaymentLink } = require('../services/paymentService')

module.exports.payNow = async function (bot, msg, lang = 'pl') {
  try {
    const mode = process.env.MODE || 'PROD'
    const ligpay_env = process.env.LIQPAY_ENV || 'Test'

    if (mode === 'PROD' && ligpay_env === 'Test') {
      await bot.sendMessage(msg.chat.id, texts[lang]['0_16'], { parse_mode: 'HTML' })
      return
    }

    const chatId = msg.chat.id
    console.log("paymentScene -> chatId", chatId)

    await bot.sendMessage(chatId, texts[lang]['0_17'], { parse_mode: "HTML" })
    const userInput = (await inputLineScene(bot, msg)).trim()
    let amount = userInput.replace(/[^0-9]/g, "")
    if (amount.length === 0) {
      await bot.sendMessage(chatId, texts[lang]['0_18'], { parse_mode: "HTML" })
      return
    }

    amount = parseFloat(amount)
    if (isNaN(amount) || amount <= 0) {
      await bot.sendMessage(chatId, texts[lang]['0_19'], { parse_mode: "HTML" })
      return
    }

    const commissionRate = 0.015
    const totalAmount = (Math.ceil((amount / (1 - commissionRate)) * 100) / 100).toFixed(2)

    console.log(totalAmount)
    let paymentLink = await formPaymentLink(bot, chatId, totalAmount, lang)

    if (paymentLink) {
      const markdownLink = `[${texts[lang]['0_20']}](${paymentLink})`
      bot.sendMessage(chatId, markdownLink, { parse_mode: 'Markdown' })
    }

  } catch (err) {
    console.log(err)
  }
}


