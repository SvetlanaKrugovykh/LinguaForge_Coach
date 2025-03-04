const { bot, selectedByUser } = require('../globalBuffer')
const langS = require('./langServerServices')
const menu = require('../modules/common_menu')

module.exports.doWordMemorize = async function (msg) {
  if (!msg?.chat?.id) return

  if (!selectedByUser[msg.chat.id]?.doWordMemorize) {
    selectedByUser[msg.chat.id].doWordMemorize = []
  }

  const words = selectedByUser[msg.chat.id]?.words

  if (Array.isArray(words) && words[0]) {
    const word = words[0]?.word
    if (word) {
      selectedByUser[msg.chat.id].doWordMemorize.push(word)
      await bot.sendMessage(msg.chat.id, `✍ : ${word}`)
    }
  } else if (words && Array.isArray(words.words) && words.words[0]) {
    const word = words.words[0]?.word
    if (word) {
      selectedByUser[msg.chat.id].doWordMemorize.push(word)
      await bot.sendMessage(msg.chat.id, `✍ : ${word}`)
    }
  } else {
    console.error('No words found for user:', msg.chat.id)
  }
}


async function sendReminder(chatId, text) {
  const lang = 'pl'
  await langS.getLangData(text, chatId, bot, lang)
}

module.exports.checkAndSendReminders = async function () {
  for (const chatId in selectedByUser) {
    if (selectedByUser[chatId]?.doWordMemorize) {
      const words = selectedByUser[chatId].doWordMemorize
      words.forEach((word, index) => {
        setTimeout(() => {
          sendReminder(chatId, word)
        }, index * 60000)
      })
    }
  }
}
