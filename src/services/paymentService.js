const axios = require('axios')

module.exports.formPaymentLink = async function (bot, chatId, abbreviation, contract, amount) {

  const formPayLinkURL = process.env.FORM_PAY_LINK_URL

  try {
    const response = await axios.post(formPayLinkURL, {
      abbreviation,
      'payment_code': contract.payment_code,
      amount
    })

    if (response.status === 200) {
      const currency = 'UAH'
      const description = `TelegramID: ${contract.payment_code}. TOTAL: ${amount} грн.`
      // const payment = await dbRequests.createPayment(contract.id, contract.organization_id, amount, currency, description, `order_${Date.now()}`)
      console.log(payment)
      return response.data
    } else {
      await bot.sendMessage(chatId, '⛔️ Wystąpił błąd podczas tworzenia łącza do LiqPay.', { parse_mode: "HTML" })
      console.error('Error sending message to the Telegram group:',
        response.statusText)
    }
  } catch (error) {
    await bot.sendMessage(chatId, '⛔️ Wystąpił błąd podczas tworzenia łącza do LiqPay.', { parse_mode: "HTML" })
    console.error('Error sending message to the Telegram group:', error.message)
  }
}


