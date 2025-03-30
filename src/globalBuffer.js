require('dotenv').config()


if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not defined')
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

const TelegramBot = require('node-telegram-bot-api')

const globalBuffer = {}
const selectedByUser = {}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true })


const liqpayKeys = {
  lev: {
    publicKey: process.env.LIQPAY_PUBLIC_KEY_LEV,
    privateKey: process.env.LIQPAY_PRIVATE_KEY_LEV,
  }
}

const testLiqpayKeys = {
  lev: {
    publicKey: process.env.TEST_LIQPAY_PUBLIC_KEY_LEV,
    privateKey: process.env.TEST_LIQPAY_PRIVATE_KEY_LEV,
  }
}

function getLiqpayKeys(abbreviation) {
  if (process.env.LIQPAY_ENV === 'Test') {
    return testLiqpayKeys[abbreviation] || null
  }
  return liqpayKeys[abbreviation] || null
}

module.exports = { bot, globalBuffer, selectedByUser, getLiqpayKeys }