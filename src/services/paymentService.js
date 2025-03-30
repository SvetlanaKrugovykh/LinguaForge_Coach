const axios = require('axios')
const { texts } = require('../data/keyboard')
const crypto = require('crypto')
const { getLiqpayKeys } = require('../globalBuffer.js')
require('dotenv').config()

module.exports.formPaymentLink = async function (bot, chatId, amount, lang = 'pl') {

  const payment_code = `${process.env.CONTRACT}_${chatId}`
  const abbreviation = process.env.ABBREVIATION

  try {
    let rate_to_pln = 1
    const response = await axios.post(`${process.env.SERVER_URL}/get-exchange-rate`, {
      "currency": "PLN",
      "rate_to_pln": 0,
      "date": new Date().toISOString().split('T')[0]
    }, {
      headers: {
        Authorization: process.env.LG_SERVER_AUTHORIZATION
      }
    })

    if (response?.data?.rate_to_pln) rate_to_pln = response.data.rate_to_pln
    console.log('Rate to PLN:', rate_to_pln)
    const amountInUAH = amount / rate_to_pln

    const paymentLink = await formPaymentLinkLink(abbreviation, payment_code, amountInUAH, lang)

    return paymentLink

  } catch (error) {
    await bot.sendMessage(chatId, texts[lang]['0_21'], { parse_mode: "HTML" })
    console.error('Error sending message to the Telegram group:', error.message)
  }
}


async function formPaymentLinkLink(abbreviation, payment_code, amount, lang = 'pl') {

  const liqpayKeys = getLiqpayKeys(abbreviation)
  if (!liqpayKeys) {
    console.log(`No LiqPay keys found for abbreviation: ${abbreviation}: ${payment_code}`)
    return null
  }

  const { publicKey, privateKey } = liqpayKeys
  console.log(`LiqPay Public Key: ${publicKey}`)

  const currency = 'UAH'
  const description = `${texts[lang]['0_22']} ${payment_code}.${texts[lang]['0_23']}${amount.toFixed(2)} UAH.`
  const callBackUrl = process.env.LIQPAY_CALLBACK_URL
  const URL_MDL = process.env.URL_MDL || ''
  const server_callback_url = `${callBackUrl}${URL_MDL}${abbreviation}/`
  console.log(`Payment Request: ${server_callback_url} | ${description} | ${amount} | ${currency}`)
  const data = Buffer.from(JSON.stringify({
    version: '3',
    public_key: publicKey,
    action: 'pay',
    amount: amount,
    currency: currency,
    description: description,
    order_id: `order_${Date.now()}`,
    server_url: server_callback_url,
  })).toString('base64')

  const signature = crypto.createHash('sha1')
    .update(privateKey + data + privateKey)
    .digest('base64')

  const paymentLink = `https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`
  console.log(paymentLink)

  return paymentLink
}