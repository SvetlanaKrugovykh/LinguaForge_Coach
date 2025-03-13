require('dotenv').config()
const inputLineScene = require('./inputLine')
const formPaymentLink = require('../services/paymentService').formPaymentLink

async function paymentScene(bot, msg) {
  try {
    const mode = process.env.MODE || 'PROD'
    const ligpay_env = process.env.LIQPAY_ENV || 'Test'

    if (mode === 'PROD' && ligpay_env === 'Test') {
      await bot.sendMessage(msg.chat.id, `⛔️ Оплата через LiqPay в даний час недоступна`, { parse_mode: 'HTML' })
      return
    }

    const chatId = msg.chat.id
    console.log("paymentScene -> chatId", chatId)

    await bot.sendMessage(chatId, "Wprowadź </i> kwotę płatności w złotych bez groszy, np.wpisanie kwoty 20 oznacza 20 złote </i>\n⚠️Uwaga, do kwoty wpłaty doliczana jest prowizja! \n⚠️ Prowizja wynosi 1, 5 % kwoty płatności!\n", { parse_mode: "HTML" })
    let userInput = await inputLineScene(bot, msg)
    let amount = userInput.replace(/[^0-9]/g, "")
    if (amount.length === 0) {
      await bot.sendMessage(chatId, "Nie podałeś kwoty płatności. Spróbuj ponownie")
      return
    }

    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      await bot.sendMessage(chatId, "Wprowadzona kwota jest nieprawidłowa. Spróbuj ponownie");
      return
    }

    const commissionRate = 0.015;
    const totalAmount = (Math.ceil((amount / (1 - commissionRate)) * 100) / 100).toFixed(2)

    console.log(totalAmount)
    let paymentLink = await formPaymentLink(bot, chatId, abbreviation, contract, totalAmount)
    const urlLink = paymentLink?.message?.paymentLink || null

    if (urlLink) {
      const markdownLink = `[Aby dokonać płatności, kliknij link](${urlLink})`
      bot.sendMessage(chatId, markdownLink, { parse_mode: 'Markdown' })
    }

  } catch (err) {
    console.log(err)
  }
}

module.exports = paymentScene
